import { useEffect, useState } from "react";

const LATITUDE = 22.806580;
const LONGITUDE = 85.993019;

const CUT_IN_SPEED = 3;
const RATED_SPEED = 12;
const CUT_OUT_SPEED = 25;
const PERFORMANCE_RATIO = 0.90;

const WEATHER_API =
  `https://api.open-meteo.com/v1/forecast?` +
  `latitude=${LATITUDE}` +
  `&longitude=${LONGITUDE}` +
  `&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,rain` +
  `&hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,rain` +
  `&past_days=31` +
  `&forecast_days=1` +
  `&timezone=auto`;

const calculatePower = (windSpeed, plantCapacityKW) => {
  if (windSpeed < CUT_IN_SPEED || windSpeed > CUT_OUT_SPEED) {
    return 0;
  }
  if (windSpeed >= RATED_SPEED) {
    return plantCapacityKW;
  }
  const fraction = (windSpeed - CUT_IN_SPEED) / (RATED_SPEED - CUT_IN_SPEED);
  return plantCapacityKW * Math.pow(fraction, 3);
};

const calculateAirDensity = (temperature, pressure) => {
  const temperatureKelvin = temperature + 273.15;
  const pressurePa = pressure * 100;
  return pressurePa / (287.05 * temperatureKelvin);
};

export function useWindData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User configurable plant capacity (Default 600 kW as requested)
  const [plantCapacity, setPlantCapacity] = useState(600);

  // Telemetry controls for ML fault prediction
  const [alternatorVoltage, setAlternatorVoltage] = useState(415.0);
  const [vibrationLevel, setVibrationLevel] = useState(3.2);
  const [generatorTemp, setGeneratorTemp] = useState(70.0);
  const [gearboxTemp, setGearboxTemp] = useState(65.0);

  const fetchWindData = async () => {
    try {
      setError(null);
      const response = await fetch(WEATHER_API);
      if (!response.ok) {
        throw new Error("Failed to fetch wind weather data");
      }

      const result = await response.json();
      const current = result.current;
      const hourly = result.hourly;

      const windSpeed = current.wind_speed_10m ?? 0;
      const windDirection = current.wind_direction_10m ?? 0;
      const temperature = current.temperature_2m ?? 0;
      const humidity = current.relative_humidity_2m ?? 0;
      const pressure = current.surface_pressure ?? 0;
      const rainfall = current.rain ?? 0;

      const airDensity = calculateAirDensity(temperature, pressure);
      const expectedPower = calculatePower(windSpeed, plantCapacity);
      const actualPower = expectedPower * PERFORMANCE_RATIO;

      let rotorSpeed = 0;
      if (windSpeed >= CUT_IN_SPEED && windSpeed <= CUT_OUT_SPEED) {
        rotorSpeed = Math.min(25, 6 + (windSpeed - 3) * 1.5);
      }
      const generatorSpeed = rotorSpeed * 60;

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

      const generationHistory = todayIndexes.map((index) => {
        const time = hourly.time[index];
        const speed = hourly.wind_speed_10m?.[index] ?? 0;
        const exp = calculatePower(speed, plantCapacity);
        const act = exp * PERFORMANCE_RATIO;

        return {
          time: new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          expected: Math.round(exp),
          actual: Math.round(act),
          windSpeed: Math.round(speed),
        };
      });

      const todayEnergy = todayIndexes.reduce((total, index) => {
        const speed = hourly.wind_speed_10m?.[index] ?? 0;
        const power = calculatePower(speed, plantCapacity) * PERFORMANCE_RATIO;
        return total + power;
      }, 0);

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let monthEnergy = 0;

      hourly.time.forEach((time, index) => {
        const date = new Date(time);
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          const speed = hourly.wind_speed_10m?.[index] ?? 0;
          const power = calculatePower(speed, plantCapacity) * PERFORMANCE_RATIO;
          monthEnergy += power;
        }
      });

      setData({
        wind_speed: Number(windSpeed.toFixed(1)),
        wind_direction: Math.round(windDirection),
        temperature: Number(temperature.toFixed(1)),
        humidity: Math.round(humidity),
        pressure: Math.round(pressure),
        rainfall: Number(rainfall.toFixed(1)),
        air_density: Number(airDensity.toFixed(3)),

        energy_production: Math.round(actualPower),
        power_output: Math.round(actualPower),
        today_energy: Number(todayEnergy.toFixed(1)),
        month_energy: Number(monthEnergy.toFixed(1)),
        total_energy: Number((monthEnergy * 3.8).toFixed(1)),

        expected_generation: Math.round(expectedPower),
        actual_generation: Math.round(actualPower),
        plant_capacity: plantCapacity,
        plant_efficiency: Math.round(PERFORMANCE_RATIO * 100),

        rotor_speed: Number(rotorSpeed.toFixed(1)),
        generator_speed: Math.round(generatorSpeed),
        blade_pitch_angle: windSpeed > 12 ? Number(((windSpeed - 12) * 2).toFixed(1)) : 0,

        // Telemetry inputs for ML Model
        alternator_voltage: alternatorVoltage,
        vibration_level: vibrationLevel,
        generator_temp: generatorTemp,
        gearbox_oil_temp: gearboxTemp,

        capacity_factor: Math.round((actualPower / plantCapacity) * 100),
        active_turbines: Math.round(plantCapacity / 100),
        total_turbines: Math.round(plantCapacity / 100),
        plant_health: vibrationLevel > 7.0 || generatorTemp > 90 ? 75 : 98,

        generationHistory,
      });
    } catch (err) {
      console.error("Wind API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWindData();
    const interval = setInterval(fetchWindData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [plantCapacity, alternatorVoltage, vibrationLevel, generatorTemp, gearboxTemp]);

  return {
    data,
    loading,
    error,
    plantCapacity,
    setPlantCapacity,
    alternatorVoltage,
    setAlternatorVoltage,
    vibrationLevel,
    setVibrationLevel,
    generatorTemp,
    setGeneratorTemp,
    gearboxTemp,
    setGearboxTemp,
    refetch: fetchWindData,
  };
}