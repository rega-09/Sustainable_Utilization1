import os

# --- 1. useWindData.js ---
use_wind_data_js = """import { useEffect, useState } from "react";

const LATITUDE = 22.806580;
const LONGITUDE = 85.993019;

// Prototype turbine configuration
const TURBINE_RATED_POWER_KW = 2.0;
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

const calculatePower = (windSpeed, capacity) => {
  if (windSpeed < CUT_IN_SPEED || windSpeed > CUT_OUT_SPEED) {
    return 0;
  }
  if (windSpeed >= RATED_SPEED) {
    return capacity;
  }
  const fraction = (windSpeed - CUT_IN_SPEED) / (RATED_SPEED - CUT_IN_SPEED);
  return capacity * Math.pow(fraction, 3);
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

  // Overrides for AI Model Testing & Plant Capacity
  const [plantCapacity, setPlantCapacity] = useState(600); // User requested 600kW default
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
        rotorSpeed = 8 + ((Math.min(windSpeed, RATED_SPEED) - CUT_IN_SPEED) / (RATED_SPEED - CUT_IN_SPEED)) * 14;
        rotorSpeed = Math.min(rotorSpeed, 22);
      }
      
      const generatorSpeed = rotorSpeed * 60;

      let bladePitch = 0;
      if (windSpeed >= RATED_SPEED) {
        bladePitch = 8;
      } else if (windSpeed >= CUT_IN_SPEED) {
        bladePitch = 2;
      }

      const today = new Date();
      const todayDate = new Intl.DateTimeFormat("en-CA", { timeZone: result.timezone }).format(today);
      const todayIndexes = [];
      hourly.time.forEach((time, index) => {
        if (time.slice(0, 10) === todayDate) todayIndexes.push(index);
      });

      const generationHistory = todayIndexes.map((index) => {
        const ws = hourly.wind_speed_10m?.[index] ?? 0;
        const expected = calculatePower(ws, plantCapacity);
        const actual = expected * PERFORMANCE_RATIO;
        return {
          time: hourly.time[index].slice(11, 16),
          expected: Number(expected.toFixed(2)),
          actual: Number(actual.toFixed(2)),
        };
      });

      let todayEnergy = 0;
      todayIndexes.forEach((index) => {
        const ws = hourly.wind_speed_10m?.[index] ?? 0;
        todayEnergy += calculatePower(ws, plantCapacity) * PERFORMANCE_RATIO;
      });

      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      let monthEnergy = 0;
      hourly.time.forEach((time, index) => {
        const date = new Date(time);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
          const ws = hourly.wind_speed_10m?.[index] ?? 0;
          monthEnergy += calculatePower(ws, plantCapacity) * PERFORMANCE_RATIO;
        }
      });

      const powerCurveData = [];
      for (let ws = 0; ws <= 30; ws++) {
        const expected = calculatePower(ws, plantCapacity);
        const actual = expected * PERFORMANCE_RATIO;
        powerCurveData.push({ windSpeed: ws, expected: Number(expected.toFixed(2)), actual: Number(actual.toFixed(2)) });
      }

      const turbineFactors = [1.00, 0.95, 0.82, 1.02, 0.00];
      const turbines = turbineFactors.map((factor, index) => {
        const power = (actualPower / 5) * factor * 5;
        let status = "ONLINE";
        if (index === 4) status = "OFFLINE";
        return {
          id: `T0${index + 1}`,
          power: Number(power.toFixed(2)),
          status,
          color: status === "ONLINE" ? "#83f28f" : status === "WARNING" ? "#F5B942" : "#E85D5D",
        };
      });

      const totalAvailablePower = turbines.reduce((sum, turbine) => sum + turbine.power, 0);
      const currentLoad = totalAvailablePower * 0.8;
      const surplusPower = totalAvailablePower - currentLoad;

      const yawAngle = windDirection;
      const bearingTemperature = 45 + (actualPower/plantCapacity) * 7;
      const generatorVoltageOutput = 690;
      const generatorCurrent = actualPower > 0 ? (actualPower * 1000) / (Math.sqrt(3) * generatorVoltageOutput) : 0;
      const gridVoltage = 415;
      const gridFrequency = 50;
      const powerFactor = 0.97;
      const turbineEfficiency = expectedPower > 0 ? (actualPower / expectedPower) * 100 : 0;

      setData({
        wind_speed: Number(windSpeed.toFixed(1)),
        wind_direction: Number(windDirection.toFixed(0)),
        temperature: Number(temperature.toFixed(1)),
        humidity: Number(humidity.toFixed(0)),
        pressure: Number(pressure.toFixed(1)),
        rainfall: Number(rainfall.toFixed(1)),
        air_density: Number(airDensity.toFixed(2)),

        rotor_speed: Number(rotorSpeed.toFixed(1)),
        generator_speed: generatorSpeed,
        blade_pitch_angle: Number(bladePitch.toFixed(1)),
        yaw_angle: Number(yawAngle.toFixed(0)),

        gearbox_temperature: gearboxTemp,
        generator_temperature: generatorTemp,
        gearbox_oil_temp: gearboxTemp,
        generator_temp: generatorTemp,
        bearing_temperature: Number(bearingTemperature.toFixed(0)),

        rotor_vibration: Number((1 + actualPower * 0.001).toFixed(1)),
        gearbox_vibration: vibrationLevel,
        vibration_level: vibrationLevel,
        generator_vibration: Number((1 + actualPower * 0.0005).toFixed(1)),

        generator_voltage: generatorVoltageOutput,
        generator_current: Number(generatorCurrent.toFixed(1)),
        generator_power: Number(actualPower.toFixed(2)),
        grid_voltage: gridVoltage,
        grid_current: Number(actualPower > 0 ? (actualPower * 1000 / (Math.sqrt(3) * gridVoltage * powerFactor)).toFixed(1) : 0),
        grid_frequency: gridFrequency,
        power_factor: powerFactor,
        alternator_voltage: alternatorVoltage,

        energy_production: Number(actualPower.toFixed(2)),
        power_output: Number(actualPower.toFixed(2)),
        today_energy: Number(todayEnergy.toFixed(1)),
        month_energy: Number(monthEnergy.toFixed(1)),
        total_energy: Number((monthEnergy * 3.8).toFixed(1)),
        expected_generation: Number(expectedPower.toFixed(2)),
        actual_generation: Number(actualPower.toFixed(2)),
        turbine_efficiency: Number(turbineEfficiency.toFixed(1)),
        turbine_health: vibrationLevel > 7.0 || generatorTemp > 90 ? 75 : 94,
        turbine_status: "ONLINE",
        maintenance_required: false,

        generationHistory,
        powerCurveData,
        turbines,
        totalAvailablePower: Number(totalAvailablePower.toFixed(2)),
        currentLoad: Number(currentLoad.toFixed(2)),
        surplusPower: Number(surplusPower.toFixed(2)),
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
    data, loading, error,
    plantCapacity, setPlantCapacity,
    alternatorVoltage, setAlternatorVoltage,
    vibrationLevel, setVibrationLevel,
    generatorTemp, setGeneratorTemp,
    gearboxTemp, setGearboxTemp,
  };
}
"""

with open('src/components/wind/useWindData.js', 'w') as f:
    f.write(use_wind_data_js)

print("useWindData.js generated.")
