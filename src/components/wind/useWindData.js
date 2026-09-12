import { useEffect, useState } from "react";

const LATITUDE = 22.806580;
const LONGITUDE = 85.993019;

// Prototype turbine configuration
const TURBINE_RATED_POWER_KW = 2.0;
const CUT_IN_SPEED = 3;
const RATED_SPEED = 12;
const CUT_OUT_SPEED = 25;

// Estimated performance ratio
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


// ------------------------------------------
// Wind turbine power model
// ------------------------------------------
const calculatePower = (windSpeed) => {
  if (
    windSpeed < CUT_IN_SPEED ||
    windSpeed > CUT_OUT_SPEED
  ) {
    return 0;
  }

  if (windSpeed >= RATED_SPEED) {
    return TURBINE_RATED_POWER_KW;
  }

  const fraction =
    (windSpeed - CUT_IN_SPEED) /
    (RATED_SPEED - CUT_IN_SPEED);

  return (
    TURBINE_RATED_POWER_KW *
    Math.pow(fraction, 3)
  );
};


// ------------------------------------------
// Estimate air density
// ------------------------------------------
const calculateAirDensity = (temperature, pressure) => {
  const temperatureKelvin = temperature + 273.15;
  const pressurePa = pressure * 100;

  return pressurePa /
    (287.05 * temperatureKelvin);
};


// ------------------------------------------
// Hook
// ------------------------------------------
export function useWindData() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);


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


      // ------------------------------------------
      // Current environmental data
      // ------------------------------------------

      const windSpeed =
        current.wind_speed_10m ?? 0;

      const windDirection =
        current.wind_direction_10m ?? 0;

      const temperature =
        current.temperature_2m ?? 0;

      const humidity =
        current.relative_humidity_2m ?? 0;

      const pressure =
        current.surface_pressure ?? 0;

      const rainfall =
        current.rain ?? 0;


      // ------------------------------------------
      // Air density
      // ------------------------------------------

      const airDensity =
        calculateAirDensity(
          temperature,
          pressure
        );


      // ------------------------------------------
      // Current turbine power
      // ------------------------------------------

      const expectedPower =
        calculatePower(windSpeed);

      const actualPower =
        expectedPower * PERFORMANCE_RATIO;


      // ------------------------------------------
      // Rotor speed
      // ------------------------------------------

      let rotorSpeed = 0;

      if (
        windSpeed >= CUT_IN_SPEED &&
        windSpeed <= CUT_OUT_SPEED
      ) {

        rotorSpeed =
          8 +
          ((Math.min(windSpeed, RATED_SPEED) -
            CUT_IN_SPEED) /
            (RATED_SPEED - CUT_IN_SPEED)) *
          14;

        rotorSpeed =
          Math.min(rotorSpeed, 22);
      }


      // ------------------------------------------
      // Blade pitch
      // ------------------------------------------

      let bladePitch = 0;

      if (windSpeed >= RATED_SPEED) {
        bladePitch = 8;
      } else if (windSpeed >= CUT_IN_SPEED) {
        bladePitch = 2;
      }


      // ------------------------------------------
      // Today's hourly generation
      // ------------------------------------------

      const today = new Date();

      const todayDate =
        new Intl.DateTimeFormat("en-CA", {
          timeZone: result.timezone,
        }).format(today);

      const todayIndexes = [];

      hourly.time.forEach((time, index) => {

        const date = time.slice(0, 10);

        if (date === todayDate) {
          todayIndexes.push(index);
        }

      });


      const generationHistory =
        todayIndexes.map((index) => {

          const ws =
            hourly.wind_speed_10m?.[index] ?? 0;

          const expected =
            calculatePower(ws);

          const actual =
            expected * PERFORMANCE_RATIO;

          return {

            time: hourly.time[index].slice(11, 16),

            expected:
              Number(expected.toFixed(2)),

            actual:
              Number(actual.toFixed(2)),
          };

        });


      // ------------------------------------------
      // Today's energy
      // ------------------------------------------

      let todayEnergy = 0;

      todayIndexes.forEach((index) => {

        const ws =
          hourly.wind_speed_10m?.[index] ?? 0;

        const power =
          calculatePower(ws) *
          PERFORMANCE_RATIO;

        // Hourly data → kW × 1 hour = kWh
        todayEnergy += power;

      });


      // ------------------------------------------
      // Month-to-date energy
      // ------------------------------------------

      const currentMonth =
        today.getMonth();

      const currentYear =
        today.getFullYear();

      let monthEnergy = 0;


      hourly.time.forEach((time, index) => {

        const date =
          new Date(time);

        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {

          const ws =
            hourly.wind_speed_10m?.[index] ?? 0;

          const power =
            calculatePower(ws) *
            PERFORMANCE_RATIO;

          monthEnergy += power;
        }

      });


      // ------------------------------------------
      // Power curve
      // ------------------------------------------

      const powerCurveData = [];

      for (let ws = 0; ws <= 30; ws++) {

        const expected =
          calculatePower(ws);

        const actual =
          expected * PERFORMANCE_RATIO;

        powerCurveData.push({

          windSpeed: ws,

          expected:
            Number(expected.toFixed(2)),

          actual:
            Number(actual.toFixed(2)),

        });

      }


      // ------------------------------------------
      // Five turbine wind farm
      // ------------------------------------------

      const turbineFactors = [
        1.00,
        0.95,
        0.82,
        1.02,
        0.00,
      ];


      const turbines =
        turbineFactors.map((factor, index) => {

          const power =
            actualPower * factor;

          let status = "ONLINE";

          if (index === 4) {
            status = "OFFLINE";
          }

          return {

            id: `T0${index + 1}`,

            power:
              Number(power.toFixed(2)),

            status,

            color:
              status === "ONLINE"
                ? "#83f28f"
                : status === "WARNING"
                  ? "#F5B942"
                  : "#E85D5D",
          };

        });


      const totalAvailablePower =
        turbines.reduce(
          (sum, turbine) =>
            sum + turbine.power,
          0
        );


      // ------------------------------------------
      // Prototype dispatch values
      // ------------------------------------------

      const currentLoad = 3.82;

      const surplusPower =
        totalAvailablePower - currentLoad;


      // ------------------------------------------
      // Mechanical estimates
      // ------------------------------------------

      const yawAngle =
        windDirection;

      const gearboxTemperature =
        50 + actualPower * 15;

      const generatorTemperature =
        52 + actualPower * 14;

      const bearingTemperature =
        45 + actualPower * 7;

      const gearboxVibration =
        1 + actualPower * 1.2;


      // ------------------------------------------
      // Electrical estimates
      // ------------------------------------------

      const generatorVoltage = 690;

      const generatorCurrent =
        actualPower > 0
          ? (actualPower * 1000) /
          (Math.sqrt(3) * generatorVoltage)
          : 0;

      const gridVoltage = 415;

      const gridFrequency = 50;

      const powerFactor = 0.97;


      // ------------------------------------------
      // Turbine efficiency
      // ------------------------------------------

      const turbineEfficiency =
        expectedPower > 0
          ? (actualPower / expectedPower) * 100
          : 0;


      // ------------------------------------------
      // Final data object
      // ------------------------------------------

      setData({

        // Environmental
        wind_speed:
          Number(windSpeed.toFixed(1)),

        wind_direction:
          Number(windDirection.toFixed(0)),

        temperature:
          Number(temperature.toFixed(1)),

        humidity:
          Number(humidity.toFixed(0)),

        pressure:
          Number(pressure.toFixed(1)),

        rainfall:
          Number(rainfall.toFixed(1)),

        air_density:
          Number(airDensity.toFixed(2)),


        // Mechanical
        rotor_speed:
          Number(rotorSpeed.toFixed(1)),

        blade_pitch_angle:
          Number(bladePitch.toFixed(1)),

        yaw_angle:
          Number(yawAngle.toFixed(0)),


        // Temperatures
        gearbox_temperature:
          Number(gearboxTemperature.toFixed(0)),

        generator_temperature:
          Number(generatorTemperature.toFixed(0)),

        bearing_temperature:
          Number(bearingTemperature.toFixed(0)),


        // Vibrations
        rotor_vibration:
          Number((1 + actualPower * 0.8).toFixed(1)),

        gearbox_vibration:
          Number(gearboxVibration.toFixed(1)),

        generator_vibration:
          Number((1 + actualPower * 0.5).toFixed(1)),


        // Electrical
        generator_voltage:
          generatorVoltage,

        generator_current:
          Number(generatorCurrent.toFixed(1)),

        generator_power:
          Number(actualPower.toFixed(2)),

        grid_voltage:
          gridVoltage,

        grid_current:
          Number(
            actualPower > 0
              ? (
                actualPower * 1000 /
                (Math.sqrt(3) * gridVoltage * powerFactor)
              ).toFixed(1)
              : 0
          ),

        grid_frequency:
          gridFrequency,

        power_factor:
          powerFactor,


        // KPIs
        energy_production:
          Number(actualPower.toFixed(2)),

        today_energy:
          Number(todayEnergy.toFixed(1)),

        month_energy:
          Number(monthEnergy.toFixed(1)),

        total_energy:
          0,

        expected_generation:
          Number(expectedPower.toFixed(2)),

        actual_generation:
          Number(actualPower.toFixed(2)),

        turbine_efficiency:
          Number(turbineEfficiency.toFixed(1)),

        turbine_health:
          94,

        turbine_status:
          "ONLINE",

        maintenance_required:
          false,


        // Charts
        generationHistory,

        powerCurveData,


        // Wind farm
        turbines,

        totalAvailablePower:
          Number(totalAvailablePower.toFixed(2)),

        currentLoad,

        surplusPower:
          Number(surplusPower.toFixed(2)),

      });

    } catch (err) {

      console.error(
        "Wind API error:",
        err
      );

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchWindData();

    // Refresh weather data every 5 minutes
    const interval =
      setInterval(
        fetchWindData,
        5 * 60 * 1000
      );

    return () =>
      clearInterval(interval);

  }, []);


  return {
    data,
    loading,
    error,
  };
}