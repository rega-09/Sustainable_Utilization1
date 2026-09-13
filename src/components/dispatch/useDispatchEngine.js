import { useState, useEffect } from 'react';

export const CAPACITY_SOLAR = 800;
export const CAPACITY_WIND = 600;
export const CAPACITY_HYDRO = 500;
export const MAX_DOMESTIC_LOAD = 600;
export const MAX_BATTERY_CHARGE = 500;

const initialState = {
  scenarioName: 'SUNNY AFTERNOON (NORMAL)',
  timestamp: Date.now(),

  capacity_solar: CAPACITY_SOLAR,
  capacity_wind: CAPACITY_WIND,
  capacity_hydro: CAPACITY_HYDRO,

  solar_percent: 100,
  wind_percent: 60,
  hydro_percent: 80,

  solar_generation: 800,
  wind_generation: 360,
  hydro_generation: 400,

  total_renewable: 1560,
  total_demand: MAX_DOMESTIC_LOAD,

  domestic_supplied: MAX_DOMESTIC_LOAD,
  domestic_deficit: 0,

  battery_soc: 72,
  battery_power: 500, // >0 means charging

  grid_import: 0,
  grid_export: 460,

  renewable_share: 100,
  system_health: 98,

  decision_reason: '',
  source_ranks: [],
  timeline24h: []
};

// Generate 24-hour mock data for the timeline chart
const generateTimeline = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    let sol = (i > 6 && i < 18) ? Math.sin((i - 6) / 12 * Math.PI) * 700 : 0;
    let win = 200 + Math.random() * 400;
    let hyd = 300 + Math.random() * 200;
    let dem = 400 + (i > 8 && i < 22 ? 200 : 0);
    let totalR = sol + win + hyd;
    let bat = totalR > dem ? Math.min((totalR - dem), MAX_BATTERY_CHARGE) : 0;

    data.push({
      time,
      Solar: Number(sol.toFixed(0)),
      Wind: Number(win.toFixed(0)),
      Hydro: Number(hyd.toFixed(0)),
      Demand: Number(dem.toFixed(0)),
      Battery: Number(bat.toFixed(0))
    });
  }
  return data;
};
initialState.timeline24h = generateTimeline();

export function useDispatchEngine() {
  const [data, setData] = useState(initialState);
  const [activeScenario, setActiveScenario] = useState('SUNNY');

  const [solarPercent, setSolarPercent] = useState(100);
  const [windPercent, setWindPercent] = useState(50);
  const [hydroPercent, setHydroPercent] = useState(50);
  const [batterySoc, setBatterySoc] = useState(72);

  // Apply scenarios when they change
  useEffect(() => {
    switch (activeScenario) {
      case 'SUNNY':
        setSolarPercent(100);
        setWindPercent(50);
        setHydroPercent(50);
        break;
      case 'MONSOON':
        setSolarPercent(10);
        setWindPercent(80);
        setHydroPercent(100);
        break;
      case 'HIGH_WIND':
        setSolarPercent(40);
        setWindPercent(100);
        setHydroPercent(40);
        break;
      case 'NIGHT':
        setSolarPercent(0);
        setWindPercent(40);
        setHydroPercent(60);
        break;
      case 'SOLAR_FAIL':
        setSolarPercent(0);
        setWindPercent(60);
        setHydroPercent(90);
        break;
      case 'PEAK_DEMAND':
        setSolarPercent(60);
        setWindPercent(40);
        setHydroPercent(100);
        break;
      default:
        break;
    }
  }, [activeScenario]);

  // Master logic: recalculate on any slider change
  useEffect(() => {
    setData(prev => {
      let newState = { ...prev, timestamp: Date.now() };

      if (activeScenario === 'SUNNY') {
        newState.scenarioName = '☀️ SUNNY AFTERNOON (NORMAL)';
        newState.decision_reason = 'High solar availability detected. Domestic load fully supplied. Surplus charging battery and exporting to grid.';
      } else if (activeScenario === 'MONSOON') {
        newState.scenarioName = '🌧️ MONSOON CONDITIONS';
        newState.decision_reason = 'Cloud cover reduced solar. High water inflow. Hydro and Wind prioritized to supply domestic load.';
      } else if (activeScenario === 'HIGH_WIND') {
        newState.scenarioName = '🌬️ HIGH WIND CONDITIONS';
        newState.decision_reason = 'High wind availability. Wind generation maximized. Surplus power routed to battery charging.';
      } else if (activeScenario === 'NIGHT') {
        newState.scenarioName = '🌙 NIGHT OPERATIONS';
        newState.decision_reason = 'Solar generation zero. Relying on Hydro and Wind base load to meet domestic demand.';
      } else if (activeScenario === 'SOLAR_FAIL') {
        newState.scenarioName = '🔴 ANOMALY: SOLAR FARM OFFLINE';
        newState.decision_reason = 'CRITICAL: Solar farm unexpectedly offline. Hydro and Wind are compensating to maintain stability.';
      } else if (activeScenario === 'PEAK_DEMAND') {
        newState.scenarioName = '⚠️ PEAK DEMAND';
        newState.decision_reason = 'High demand period. All available generation routed to Domestic Load. Import may be required if deficit occurs.';
      }

      // 1. Calculate absolute generation
      const solar_gen = (solarPercent / 100) * CAPACITY_SOLAR;
      const wind_gen = (windPercent / 100) * CAPACITY_WIND;
      const hydro_gen = (hydroPercent / 100) * CAPACITY_HYDRO;
      const total_gen = solar_gen + wind_gen + hydro_gen;

      newState.solar_percent = solarPercent;
      newState.wind_percent = windPercent;
      newState.hydro_percent = hydroPercent;
      
      newState.solar_generation = solar_gen;
      newState.wind_generation = wind_gen;
      newState.hydro_generation = hydro_gen;
      newState.total_renewable = total_gen;

      // 2. Priority Logic
      // STEP 1 - Domestic Load
      const currentDomesticDemand = activeScenario === 'PEAK_DEMAND' ? 900 : MAX_DOMESTIC_LOAD;
      newState.total_demand = currentDomesticDemand;
      
      const domesticSupplied = Math.min(total_gen, currentDomesticDemand);
      const domesticDeficit = Math.max(0, currentDomesticDemand - total_gen);
      
      newState.domestic_supplied = domesticSupplied;
      newState.domestic_deficit = domesticDeficit;

      // STEP 2 - Battery
      let remainingPower = total_gen - currentDomesticDemand;
      
      let batteryPower = 0;
      let actualGridImport = 0;
      let actualGridExport = 0;

      if (remainingPower > 0) {
        // Surplus: Charge Battery
        if (batterySoc < 100) {
          batteryPower = Math.min(remainingPower, MAX_BATTERY_CHARGE);
        }
        actualGridExport = Math.max(0, remainingPower - batteryPower);
      } else if (remainingPower < 0) {
        // Deficit: Discharge Battery
        const deficit = Math.abs(remainingPower);
        // Assuming battery can discharge up to 500kW if it has charge
        if (batterySoc > 0) {
          const dischargeAmount = Math.min(deficit, MAX_BATTERY_CHARGE);
          batteryPower = -dischargeAmount; // Negative means discharging
          actualGridImport = Math.max(0, deficit - dischargeAmount);
        } else {
          actualGridImport = deficit;
        }
      }
      
      newState.battery_soc = batterySoc;
      newState.battery_power = batteryPower;

      // STEP 3 - National Grid
      newState.grid_export = actualGridExport;
      newState.grid_import = actualGridImport;

      newState.renewable_share = currentDomesticDemand > 0 ? Math.min(100, (domesticSupplied / currentDomesticDemand) * 100) : 100;

      newState.source_ranks = [
        { name: 'SOLAR', type: 'solar', generation: solar_gen, avail: solarPercent },
        { name: 'HYDRO', type: 'hydro', generation: hydro_gen, avail: hydroPercent },
        { name: 'WIND', type: 'wind', generation: wind_gen, avail: windPercent },
      ].sort((a, b) => b.avail - a.avail);

      return newState;
    });
  }, [solarPercent, windPercent, hydroPercent, activeScenario, batterySoc]);

  return { 
    data, 
    activeScenario, 
    setActiveScenario,
    solarPercent, setSolarPercent,
    windPercent, setWindPercent,
    hydroPercent, setHydroPercent,
    batterySoc, setBatterySoc
  };
}

