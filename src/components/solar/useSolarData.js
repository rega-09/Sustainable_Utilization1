import { useEffect, useState } from "react";

const LATITUDE = 22.806580;
const LONGITUDE = 85.993019;

// Default performance ratio used to estimate actual PV output
const PERFORMANCE_RATIO = 0.90;

const WEATHER_API =
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${LATITUDE}` +
  `&longitude=${LONGITUDE}` +
  `&current=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,rain,shortwave_radiation` +
  `&hourly=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,shortwave_radiation` +
  `&past_days=31` +
  `&forecast_days=1` +
  `&timezone=auto`;

export function useSolarData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User configurable state: Total capacity defaults to 800 kW as requested
  const [plantCapacity, setPlantCapacity] = useState(800);

  // Manual Last Cleaning Date / Days since cleaning state
  const defaultLastClean = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [lastCleanDate, setLastCleanDate] = useState(defaultLastClean);

  // Compute days since last clean
  const calculateDaysSinceClean = (dateStr) => {
    if (!dateStr) return 0;
    const cleanDate = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.max(0, today - cleanDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysSinceCleaning = calculateDaysSinceClean(lastCleanDate);

  const fetchSolarData = async () => {
    try {
      setError(null);

      const response = await fetch(WEATHER_API);

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const result = await response.json();

      const current = result.current;
      const hourly = result.hourly;

      // 1. CURRENT SOLAR RADIATION
      const sunlight = current.shortwave_radiation ?? 0;

      // 2. CONVERT SOLAR RADIATION TO ESTIMATED PV POWER USING DYNAMIC PLANT CAPACITY
      const currentPower = Math.max(
        0,
        (sunlight / 1000) * plantCapacity * PERFORMANCE_RATIO
      );

      // 3. FIND TODAY'S HOURLY DATA
      const today = new Date();
      const todayDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: result.timezone,
      }).format(today);

      const todayIndexes = [];
      hourly.time.forEach((time, index) => {
        const date = time.slice(0, 10);
        if (date === todayDate) {
          todayIndexes.push(index);
        }
      });

      // 4. GENERATION HISTORY FOR TODAY
      const generationHistory = todayIndexes.map((index) => {
        const time = hourly.time[index];
        const radiation = hourly.shortwave_radiation?.[index] ?? 0;
        const expectedPower = Math.max(0, (radiation / 1000) * plantCapacity);
        const actualPower = expectedPower * PERFORMANCE_RATIO;

        return {
          time: new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          expected: Math.round(expectedPower),
          actual: Math.round(actualPower),
        };
      });

      // 5. TODAY'S ENERGY
      const todayEnergy = todayIndexes.reduce((total, index) => {
        const radiation = hourly.shortwave_radiation?.[index] ?? 0;
        const power = Math.max(
          0,
          (radiation / 1000) * plantCapacity * PERFORMANCE_RATIO
        );
        return total + power;
      }, 0);

      // 6. MONTH-TO-DATE ENERGY
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let monthEnergy = 0;

      hourly.time.forEach((time, index) => {
        const date = new Date(time);
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          const radiation = hourly.shortwave_radiation?.[index] ?? 0;
          const power = Math.max(
            0,
            (radiation / 1000) * plantCapacity * PERFORMANCE_RATIO
          );
          monthEnergy += power;
        }
      });

      // 7. CREATE 5-MINUTE HEATMAP
      const generationMap = [];
      for (let hour = 0; hour < 24; hour++) {
        const currentHourIndex = todayIndexes[hour];
        const nextHourIndex = todayIndexes[hour + 1];

        const currentRadiation =
          currentHourIndex !== undefined
            ? hourly.shortwave_radiation?.[currentHourIndex] ?? 0
            : 0;

        const nextRadiation =
          nextHourIndex !== undefined
            ? hourly.shortwave_radiation?.[nextHourIndex] ?? currentRadiation
            : currentRadiation;

        for (let step = 0; step < 12; step++) {
          const fraction = step / 12;
          const radiation =
            currentRadiation + (nextRadiation - currentRadiation) * fraction;
          const intensity = Math.min(100, Math.max(0, radiation / 10));
          generationMap.push(intensity);
        }
      }

      while (generationMap.length < 288) {
        generationMap.push(0);
      }
      generationMap.length = 288;

      // 8. ELECTRICAL ESTIMATES
      const dcVoltage = 812;
      const dcCurrent =
        currentPower > 0 ? (currentPower * 1000) / dcVoltage : 0;
      const acPower = currentPower * 0.98;
      const acVoltage = 415;
      const acCurrent =
        acPower > 0 ? (acPower * 1000) / (acVoltage * Math.sqrt(3)) : 0;

      // 9. UPDATE DASHBOARD DATA
      setData({
        // Environmental
        temperature: current.temperature_2m ?? 0,
        humidity: current.relative_humidity_2m ?? 0,
        cloud_cover: current.cloud_cover ?? 0,
        sunlight_intensity: Math.round(sunlight),
        wind_speed: current.wind_speed_10m ?? 0,
        rainfall: current.rain ?? 0,

        // Panel condition
        panel_temperature: Number(
          ((current.temperature_2m ?? 0) + (sunlight / 1000) * 15).toFixed(1)
        ),
        days_since_cleaning: daysSinceCleaning,
        last_clean_date: lastCleanDate,

        // Plant capacity
        plant_capacity: plantCapacity,

        // DC
        dc_voltage: dcVoltage,
        dc_current: Number(dcCurrent.toFixed(1)),
        dc_power: Number(currentPower.toFixed(1)),

        // AC
        ac_voltage: acVoltage,
        ac_current: Number(acCurrent.toFixed(1)),
        ac_power: Number(acPower.toFixed(1)),

        frequency: 50,
        power_factor: 0.98,

        // Strings
        string_voltage: 810,
        string_current: 8.5,
        active_strings: Math.round(plantCapacity / 13),
        faulty_strings: 0,

        // Generation
        energy_production: Math.round(currentPower),
        today_energy: Number(todayEnergy.toFixed(1)),
        month_energy: Number(monthEnergy.toFixed(1)),
        total_energy: Number((monthEnergy * 4.2).toFixed(1)),

        expected_generation: Math.round((sunlight / 1000) * plantCapacity),
        actual_generation: Math.round(currentPower),

        plant_efficiency:
          sunlight > 0 ? Math.round(PERFORMANCE_RATIO * 100) : 0,
        plant_health: daysSinceCleaning > 15 ? 82 : 96,

        // Charts
        generationHistory,
        generationMap,
      });
    } catch (err) {
      console.error("Solar API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolarData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSolarData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [plantCapacity, lastCleanDate]);

  return {
    data,
    loading,
    error,
    plantCapacity,
    setPlantCapacity,
    lastCleanDate,
    setLastCleanDate,
    daysSinceCleaning,
    refetch: fetchSolarData,
  };
}