import { useState, useEffect } from 'react';

// Fluctuation helper
const fluctuate = (base, variance) => base + (Math.random() * variance * 2 - variance);

const initialState = {
  scenarioName: 'SUNNY AFTERNOON (NORMAL)',
  timestamp: Date.now(),

  // Base capacities
  capacity_solar: 8.0,
  capacity_wind: 10.0,
  capacity_hydro: 12.0,

  // Generation (MW)
  solar_generation: 6.4,
  wind_generation: 4.1,
  hydro_generation: 5.2,

  // Availability (0 - 100%)
  solar_availability: 80,
  wind_availability: 41,
  hydro_availability: 88,

  // Environment
  sunlight_intensity: 800, // W/m2
  cloud_cover: 12, // %
  wind_speed: 6.2, // m/s
  rainfall: 0, // mm
  water_inflow: 120, // m3/s
  reservoir_level: 85, // %

  // Demand breakdown (MW)
  residential_load: 4.8,
  industrial_load: 5.6,
  water_pump_load: 2.4, // Flexible
  agricultural_load: 1.8, // Flexible
  ev_charging_load: 2.1, // Flexible
  commercial_load: 1.1,

  // Calculated totals
  total_demand: 17.8,
  total_renewable: 15.7,

  // Priority categories
  critical_load: 6.5,
  normal_load: 6.0,
  flexible_load: 5.3,

  // Dispatch allocation
  flexible_load_supplied: 5.3,

  // Battery (MWh / kW)
  battery_soc: 72,
  battery_power: 2.1, // Negative means charging, positive discharging
  battery_capacity: 20,

  // Grid (MW)
  grid_import: 0,
  grid_export: 0,
  grid_frequency: 50.01,
  grid_voltage: 415,

  // System metrics
  renewable_share: 88.2, // %
  energy_surplus: 0,
  energy_deficit: 2.1,
  system_health: 94,

  // Scenario explanation
  decision_reason: 'Normal afternoon operation. Solar output is high. Flexible loads are fully supplied.',

  // Dispatch Array for rankings
  source_ranks: [
    { name: 'SOLAR', type: 'solar', generation: 6.4, avail: 80 },
    { name: 'HYDRO', type: 'hydro', generation: 5.2, avail: 88 },
    { name: 'WIND', type: 'wind', generation: 4.1, avail: 41 },
  ],

  // Timeline Data
  timeline24h: []
};

// Generate 24-hour mock data
const generateTimeline = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    let sol = (i > 6 && i < 18) ? Math.sin((i - 6) / 12 * Math.PI) * 7 : 0;
    let win = 2 + Math.random() * 6;
    let hyd = 4 + Math.random() * 4;
    let dem = 10 + (i > 8 && i < 22 ? 5 : 0) + Math.random() * 3;
    let totalR = sol + win + hyd;
    let bat = totalR > dem ? (totalR - dem) * 0.8 : (dem - totalR > 0 ? dem - totalR : 0);

    data.push({
      time,
      Solar: Number(sol.toFixed(1)),
      Wind: Number(win.toFixed(1)),
      Hydro: Number(hyd.toFixed(1)),
      Demand: Number(dem.toFixed(1)),
      Battery: Number(bat.toFixed(1))
    });
  }
  return data;
};
initialState.timeline24h = generateTimeline();

export function useDispatchEngine() {
  const [data, setData] = useState(initialState);
  const [activeScenario, setActiveScenario] = useState('SUNNY');

  // Master Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        let newState = { ...prev, timestamp: Date.now() };

        // 1. Base Environment based on Scenario
        if (activeScenario === 'SUNNY') {
          newState.scenarioName = 'SUNNY AFTERNOON (NORMAL)';
          newState.sunlight_intensity = fluctuate(850, 50);
          newState.cloud_cover = fluctuate(10, 5);
          newState.wind_speed = fluctuate(5.0, 1.0);
          newState.water_inflow = fluctuate(120, 10);
          newState.decision_reason = 'High solar availability detected. Flexible loads (EVs, Water Pumps) are scheduled to absorb peak solar generation.';
        }
        else if (activeScenario === 'MONSOON') {
          newState.scenarioName = 'MONSOON CONDITIONS';
          newState.sunlight_intensity = fluctuate(250, 50);
          newState.cloud_cover = fluctuate(85, 10);
          newState.wind_speed = fluctuate(7.0, 2.0);
          newState.water_inflow = fluctuate(250, 30);
          newState.rainfall = fluctuate(45, 5);
          newState.decision_reason = 'Cloud cover has reduced solar output. High water inflow detected. Shifting primary generation and flexible loads to Hydro priority.';
        }
        else if (activeScenario === 'HIGH_WIND') {
          newState.scenarioName = 'HIGH WIND CONDITIONS';
          newState.sunlight_intensity = fluctuate(600, 50);
          newState.cloud_cover = fluctuate(40, 10);
          newState.wind_speed = fluctuate(18.5, 2.0);
          newState.water_inflow = fluctuate(100, 10);
          newState.decision_reason = 'High wind availability. Wind generation maximized. Surplus power routed to battery charging.';
        }
        else if (activeScenario === 'NIGHT') {
          newState.scenarioName = 'NIGHT OPERATIONS';
          newState.sunlight_intensity = 0;
          newState.cloud_cover = 20;
          newState.wind_speed = fluctuate(6.0, 1.0);
          newState.water_inflow = fluctuate(120, 10);
          newState.decision_reason = 'Solar generation zero. Relying on Hydro and Wind base load. Discharging battery to meet peak evening demand.';
        }
        else if (activeScenario === 'SOLAR_FAIL') {
          newState.scenarioName = 'ANOMALY: SOLAR FARM OFFLINE';
          newState.sunlight_intensity = fluctuate(850, 50); // It's sunny, but...
          newState.cloud_cover = 10;
          newState.wind_speed = fluctuate(5.0, 1.0);
          newState.water_inflow = fluctuate(120, 10);
          newState.decision_reason = 'CRITICAL: Solar farm unexpectedly offline. Hydro and Battery immediately dispatched to compensate. Non-essential flexible loads shed to maintain grid stability.';
        }

        // 2. Calculate Generation Based on Physics & Availability
        // Solar
        if (activeScenario === 'SOLAR_FAIL' || activeScenario === 'NIGHT') {
          newState.solar_availability = 0;
          newState.solar_generation = 0;
        } else {
          newState.solar_availability = Math.max(0, 100 - newState.cloud_cover);
          newState.solar_generation = newState.capacity_solar * (newState.sunlight_intensity / 1000);
        }

        // Wind (Cut in = 3, Rated = 12, Cut out = 25)
        let w_avail = 0, w_gen = 0;
        if (newState.wind_speed > 3 && newState.wind_speed < 25) {
          w_avail = Math.min(100, (newState.wind_speed / 12) * 100);
          w_gen = newState.capacity_wind * Math.min(1.0, (newState.wind_speed - 3) / 9);
        }
        newState.wind_availability = w_avail;
        newState.wind_generation = w_gen;

        // Hydro (Based on water inflow and reservoir)
        let h_avail = Math.min(100, (newState.water_inflow / 150) * 100);
        let h_gen = newState.capacity_hydro * (h_avail / 100);
        newState.hydro_availability = h_avail;
        newState.hydro_generation = h_gen;

        // 3. Load & Demand
        // Some base fluctuation
        newState.residential_load = fluctuate(5.0, 0.5);
        newState.industrial_load = fluctuate(6.0, 0.5);
        newState.commercial_load = fluctuate(2.0, 0.2);

        newState.critical_load = newState.residential_load * 0.4 + newState.industrial_load * 0.3 + newState.commercial_load * 0.5;
        newState.normal_load = newState.residential_load * 0.6 + newState.industrial_load * 0.5 + newState.commercial_load * 0.5;

        let desired_flexible_load = 6.0; // max EVs and Pumps we want to run

        // 4. Dispatch Algorithm (Balancing)
        let total_gen = newState.solar_generation + newState.wind_generation + newState.hydro_generation;
        let base_demand = newState.critical_load + newState.normal_load;

        let available_for_flexible = total_gen - base_demand;
        let flexible_supplied = 0;
        let battery_pwr = 0;
        let grid_imp = 0;
        let grid_exp = 0;

        if (available_for_flexible > 0) {
          // We have surplus beyond base load
          flexible_supplied = Math.min(available_for_flexible, desired_flexible_load);
          let remaining_surplus = available_for_flexible - flexible_supplied;

          if (remaining_surplus > 0) {
            // Charge battery
            let charge = Math.min(remaining_surplus, 5.0); // max charge rate 5 kW
            battery_pwr = -charge; // negative = charging
            remaining_surplus -= charge;

            // Export rest to grid
            grid_exp = remaining_surplus;
          }
        } else {
          // Deficit even for base load!
          flexible_supplied = 0;
          let deficit = base_demand - total_gen;

          // Discharge battery to meet deficit
          let available_energy = (newState.battery_capacity * newState.battery_soc / 100);
          let discharge = Math.min(deficit, 5.0, available_energy);
          battery_pwr = discharge;
          deficit -= discharge;

          // Import rest from grid
          grid_imp = deficit;
        }

        newState.flexible_load_supplied = flexible_supplied;
        newState.flexible_load = flexible_supplied; // actual running
        newState.total_demand = base_demand + flexible_supplied;
        newState.total_renewable = total_gen;

        // Battery SOC update
        let newSoc = newState.battery_soc - (battery_pwr / newState.battery_capacity) * 0.1; // small multiplier for visual
        newState.battery_soc = Math.max(0, Math.min(100, newSoc));
        newState.battery_power = battery_pwr;

        newState.grid_import = grid_imp;
        newState.grid_export = grid_exp;

        newState.renewable_share = ((total_gen / newState.total_demand) * 100);
        if (newState.renewable_share > 100) newState.renewable_share = 100;

        // Rank sources by availability
        newState.source_ranks = [
          { name: 'SOLAR', type: 'solar', generation: newState.solar_generation, avail: newState.solar_availability },
          { name: 'HYDRO', type: 'hydro', generation: newState.hydro_generation, avail: newState.hydro_availability },
          { name: 'WIND', type: 'wind', generation: newState.wind_generation, avail: newState.wind_availability },
        ].sort((a, b) => b.avail - a.avail);

        return newState;
      });
    }, 3000); // update every 3s
    return () => clearInterval(interval);
  }, [activeScenario]);

  return { data, activeScenario, setActiveScenario };
}

