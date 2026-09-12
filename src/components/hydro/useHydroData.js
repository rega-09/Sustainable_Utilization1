import { useState, useEffect } from 'react';

const fluctuate = (base, variance) => {
  return base + (Math.random() * variance * 2 - variance);
};

export function useHydroData() {
  const [data, setData] = useState(() => {
    // 1. Generation History (Line/Area chart over time)
    const history = [];
    let currentHour = new Date().getHours();
    
    for (let i = 0; i < 24; i++) {
      let expected = 7.0 + Math.random() * 2.5; 
      let actual = expected * (0.9 + Math.random() * 0.08); 
      
      history.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        expected: Number(expected.toFixed(2)),
        actual: i <= currentHour ? Number(actual.toFixed(2)) : null,
      });
    }

    // 2. 24-Hour Map (288 slots of 5 mins)
    const map24h = [];
    const totalSlots = 288;
    const currentSlot = Math.floor((new Date().getHours() * 60 + new Date().getMinutes()) / 5);
    
    for (let i = 0; i < totalSlots; i++) {
      // Hydro doesn't turn off at night like solar, it varies based on demand and reservoir release
      let baseGen = 6.0 + Math.random() * 3.0; // Between 6 and 9 kW
      
      // Add a demand peak morning (slot 96-120) and evening (slot 216-250)
      if ((i > 96 && i < 120) || (i > 216 && i < 250)) {
        baseGen += 2.0;
      }
      
      map24h.push({
        slot: i,
        time: `${Math.floor((i * 5) / 60).toString().padStart(2, '0')}:${((i * 5) % 60).toString().padStart(2, '0')}`,
        generation: i <= currentSlot ? Number(baseGen.toFixed(2)) : 0,
        isCurrent: i === currentSlot
      });
    }

    return {
      // Seasons: MONSOON, POST-MONSOON, WINTER, SUMMER
      season: 'MONSOON', 
      
      // Environmental / Rainfall
      rainfall: 18.4, // mm
      daily_rainfall: 42.5,
      monthly_rainfall: 315.2,
      temperature: 27.8,
      humidity: 76,
      
      // Water Flow & Reservoir
      water_inflow: 185, // m3/s
      water_outflow: 142,
      river_flow: 160,
      turbine_flow: 142, // m3/s
      
      reservoir_level: 82, // %
      reservoir_volume: 7.6, // million m3
      water_pressure: 8.6, // bar
      
      // Mechanical
      turbine_speed: 312, // RPM
      guide_vane_position: 72, // %
      bearing_temperature: 54, // °C
      generator_temperature: 68, // °C
      shaft_vibration: 2.1, // mm/s
      
      // Electrical (Generator & Grid)
      generator_voltage: 6.6, // kV
      generator_current: 738, // A
      generator_power: 8.42, // kW
      
      grid_voltage: 33, // kV
      grid_current: 145, // A
      grid_frequency: 50.0,
      power_factor: 0.98,
      
      // KPIs
      energy_production: 8.42, // kW
      expected_generation: 9.10, // kW
      actual_generation: 8.42, // kW
      
      hydraulic_efficiency: 94.2, // %
      turbine_efficiency: 92.5, // %
      plant_efficiency: 91.8, // %
      plant_health: 93, // %
      
      // Renewable Coordination (Mocking other sources)
      solar_power: 4.28,
      wind_power: 3.62,
      battery_power: -2.10, // negative means charging
      total_renewable: 16.32,
      current_load: 14.22, // total load demand
      
      generationHistory: history,
      generationMap24h: map24h
    };
  });

  // Live simulation tick every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // Seasonal effects on Rainfall & Inflow
        let newRainfall = prev.rainfall;
        let newInflow = prev.water_inflow;
        
        if (prev.season === 'MONSOON') {
           newRainfall = Math.max(0, fluctuate(prev.rainfall, 2.0));
           newInflow = fluctuate(180, 15) + (newRainfall * 1.5); // Rain strongly affects inflow
        } else if (prev.season === 'WINTER') {
           newRainfall = Math.max(0, fluctuate(prev.rainfall, 0.5));
           newInflow = fluctuate(90, 5) + (newRainfall * 0.5);
        } else if (prev.season === 'SUMMER') {
           newRainfall = Math.max(0, fluctuate(prev.rainfall, 0.1));
           newInflow = fluctuate(40, 5) + (newRainfall * 0.2); // Low base inflow
        } else {
           // POST-MONSOON
           newRainfall = Math.max(0, fluctuate(prev.rainfall, 1.0));
           newInflow = fluctuate(120, 10) + (newRainfall * 1.0);
        }
        
        // Reservoir dynamics
        // Change in volume = Inflow - Outflow
        let levelChange = (newInflow - prev.water_outflow) * 0.005; // Arbitrary scaler
        let newLevel = Math.min(100, Math.max(0, prev.reservoir_level + levelChange));
        
        // Plant Dispatch Logic (How much water to let out)
        // Try to meet demand, but constrained by available water/level
        let targetOutflow = 140; // Default optimal
        if (newLevel > 90) {
           targetOutflow = 180; // Spill / max generate to lower level
        } else if (newLevel < 30) {
           targetOutflow = 60; // Conserve water
        } else if (prev.season === 'SUMMER') {
           targetOutflow = 80; // Conserve through dry season
        }
        
        const newOutflow = fluctuate(targetOutflow, 5);
        const newTurbineFlow = newOutflow; // Simplified: all outflow goes through turbine
        
        // Pressure and Speed tied to Flow
        const newPressure = (newTurbineFlow / 140) * 8.5; 
        const newSpeed = (newTurbineFlow / 140) * 310;
        
        // Generation tied to Turbine Flow and Pressure
        // Expected Generation based on Physics: Power = Efficiency * Density * Gravity * Flow * Head
        // We'll simplify this to a direct scaling relation for the demo
        let expectedGen = (newTurbineFlow / 140) * 8.5; // Base 8.5 kW at 140 m3/s
        let actualGen = expectedGen * (0.92 + Math.random() * 0.05); // Introduce slight inefficiency
        
        // Mechanical parameters
        const newVibration = 1.0 + (newTurbineFlow * 0.008) + (actualGen > 9 ? 0.5 : 0);
        const newBearingTemp = 45 + (newSpeed * 0.03);
        
        // Multi-Renewable Coordination Logic
        // Simulate other sources based on the season/weather
        let mockSolar = fluctuate(prev.solar_power, 0.5);
        let mockWind = fluctuate(prev.wind_power, 0.5);
        
        if (prev.season === 'MONSOON') {
           mockSolar = fluctuate(2.5, 0.5); // Low solar due to clouds
           mockWind = fluctuate(5.0, 1.0);  // High wind
        } else if (prev.season === 'SUMMER') {
           mockSolar = fluctuate(6.5, 0.5); // High solar
           mockWind = fluctuate(2.0, 0.5);  // Low wind
        }
        
        const totalGen = actualGen + mockSolar + mockWind;
        let demand = fluctuate(prev.current_load, 0.5);
        
        // Surplus goes to battery, deficit draws from battery/grid
        let newBattery = demand - totalGen; // Negative = charging battery, Positive = drawing from battery
        
        return {
          ...prev,
          rainfall: Number(newRainfall.toFixed(1)),
          water_inflow: Number(newInflow.toFixed(0)),
          water_outflow: Number(newOutflow.toFixed(0)),
          turbine_flow: Number(newTurbineFlow.toFixed(0)),
          river_flow: Number((newInflow * 0.8).toFixed(0)), // Mock river flow
          
          reservoir_level: Number(newLevel.toFixed(1)),
          water_pressure: Number(newPressure.toFixed(1)),
          
          turbine_speed: Number(newSpeed.toFixed(0)),
          shaft_vibration: Number(newVibration.toFixed(2)),
          bearing_temperature: Number(newBearingTemp.toFixed(1)),
          
          expected_generation: Number(expectedGen.toFixed(2)),
          actual_generation: Number(actualGen.toFixed(2)),
          energy_production: Number(actualGen.toFixed(2)),
          generator_power: Number(actualGen.toFixed(2)),
          
          solar_power: Number(mockSolar.toFixed(2)),
          wind_power: Number(mockWind.toFixed(2)),
          battery_power: Number(newBattery.toFixed(2)),
          total_renewable: Number(totalGen.toFixed(2)),
          current_load: Number(demand.toFixed(2))
        };
      });
    }, 5000); // Updated every 5 seconds as requested

    return () => clearInterval(interval);
  }, []);

  return data;
}

