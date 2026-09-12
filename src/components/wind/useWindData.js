import { useState, useEffect } from 'react';

// Utility to add slight random fluctuations
const fluctuate = (base, variance) => {
  return base + (Math.random() * variance * 2 - variance);
};

export function useWindData() {
  const [data, setData] = useState(() => {
    // 1. Generation History (Area chart over time)
    const history = [];
    let currentHour = new Date().getHours();
    
    for (let i = 0; i < 24; i++) {
      let expected = 1.0 + Math.random() * 0.8; // Random expected between 1.0 - 1.8 kW
      let actual = expected * (0.8 + Math.random() * 0.15); 
      
      history.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        expected: Number(expected.toFixed(2)),
        actual: i <= currentHour ? Number(actual.toFixed(2)) : null,
      });
    }

    // 2. Power Curve Data (Expected vs Actual based on wind speed)
    // Cut-in: 3 m/s, Rated: 12 m/s, Cut-out: 25 m/s, Rated Power: 2.0 kW
    const curve = [];
    for (let ws = 0; ws <= 30; ws++) {
      let expectedPower = 0;
      if (ws >= 3 && ws < 12) {
        // Cubic relation
        expectedPower = 2.0 * Math.pow((ws - 3) / (12 - 3), 3);
      } else if (ws >= 12 && ws <= 25) {
        expectedPower = 2.0;
      } else {
        expectedPower = 0;
      }
      
      // Add slight variance for actual power
      let actualPower = expectedPower;
      if (ws === 14 || ws === 15) { // Simulate the current state
        actualPower = expectedPower * 0.9;
      }
      
      curve.push({
        windSpeed: ws,
        expected: Number(expectedPower.toFixed(2)),
        actual: Number((actualPower * (0.9 + Math.random()*0.1)).toFixed(2))
      });
    }

    return {
      // Environmental
      wind_speed: 14.8, // m/s
      wind_direction: 315, // degrees
      temperature: 29.4, // °C
      humidity: 58, // %
      pressure: 1008, // hPa
      rainfall: 1.8, // mm
      air_density: 1.18, // kg/m^3
      
      // Mechanical
      rotor_speed: 18.6, // RPM
      blade_pitch_angle: 7.2, // degrees
      yaw_angle: 302, // degrees (slightly misaligned initially)
      
      // Temperatures
      gearbox_temperature: 68,
      generator_temperature: 71,
      bearing_temperature: 54,
      
      // Vibrations (mm/s)
      rotor_vibration: 2.8,
      gearbox_vibration: 3.4,
      generator_vibration: 1.9,
      
      // Electrical - Generator
      generator_voltage: 690, // V
      generator_current: 1040, // A
      generator_power: 1.24, // kW
      
      // Electrical - Grid
      grid_voltage: 415,
      grid_current: 1720,
      grid_frequency: 50.0,
      power_factor: 0.97,
      
      // KPIs
      energy_production: 1.24, // kW
      today_energy: 18.6, // kWh
      month_energy: 482, // kWh
      total_energy: 12800, // kWh (12.8 GWh)
      
      expected_generation: 1.35, // kW
      actual_generation: 1.24, // kW
      
      turbine_efficiency: 89.7, // %
      turbine_health: 94, // %
      
      turbine_status: 'ONLINE',
      maintenance_required: false,
      
      // History & Curve data
      generationHistory: history,
      powerCurveData: curve,
      
      // Wind Farm Overview
      turbines: [
        { id: 'T01', power: 1.24, status: 'ONLINE', color: '#83f28f' },
        { id: 'T02', power: 1.18, status: 'ONLINE', color: '#83f28f' },
        { id: 'T03', power: 0.94, status: 'WARNING', color: '#F5B942' },
        { id: 'T04', power: 1.27, status: 'ONLINE', color: '#83f28f' },
        { id: 'T05', power: 0.00, status: 'OFFLINE', color: '#E85D5D' }
      ],
      totalAvailablePower: 4.63,
      currentLoad: 3.82,
      surplusPower: 0.81
    };
  });

  // Live simulation tick every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // Simulate wind physics
        const newWindSpeed = Math.max(0, fluctuate(prev.wind_speed, 1.2));
        const newWindDir = (prev.wind_direction + (Math.random() * 10 - 5)) % 360;
        
        // Yaw tries to follow wind but lags
        let newYaw = prev.yaw_angle;
        if (Math.abs(newWindDir - newYaw) > 5) {
           newYaw += (newWindDir > newYaw ? 1 : -1) * 2;
        }
        
        // Calculate Yaw Misalignment
        let diff = Math.abs(newWindDir - newYaw);
        if (diff > 180) diff = 360 - diff;
        const yawLossFactor = Math.max(0, 1 - (diff * 0.005)); // Lose 0.5% efficiency per degree
        
        // Rotor speed logic based on wind speed (simplified)
        // cut-in 3, rated 12, cut-out 25
        let expectedRotorSpeed = 0;
        if (newWindSpeed >= 3 && newWindSpeed <= 25) {
           expectedRotorSpeed = 8 + ((newWindSpeed - 3) / 9) * 12; // 8 to 20 RPM
           if (expectedRotorSpeed > 22) expectedRotorSpeed = 22;
        }
        const actualRotorSpeed = fluctuate(expectedRotorSpeed, 0.5);
        
        // Expected Generation based on wind speed
        let expectedGen = 0;
        if (newWindSpeed >= 3 && newWindSpeed < 12) {
            expectedGen = 2.0 * Math.pow((newWindSpeed - 3) / 9, 3);
        } else if (newWindSpeed >= 12 && newWindSpeed <= 25) {
            expectedGen = 2.0;
        }
        
        // Actual generation factors in yaw loss and random mechanical variance
        const newActualGen = expectedGen * yawLossFactor * (0.95 + Math.random() * 0.05);
        
        // Temperatures and vibrations slightly respond to power
        const newGearboxTemp = 50 + (newActualGen * 15) + (diff > 15 ? 10 : 0); // Yaw error stresses gearbox
        const newVibration = 1.0 + (newActualGen * 1.2) + (newGearboxTemp > 80 ? 1.5 : 0);
        
        // Update turbines mock array to show dynamic changes
        const updatedTurbines = [...prev.turbines];
        updatedTurbines[0].power = Number(newActualGen.toFixed(2));
        updatedTurbines[1].power = Number((newActualGen * 0.95).toFixed(2));
        updatedTurbines[3].power = Number((newActualGen * 1.02).toFixed(2));
        
        const totalAvailable = updatedTurbines.reduce((sum, t) => sum + t.power, 0);
        const currentLoad = fluctuate(3.82, 0.2);
        
        return {
          ...prev,
          wind_speed: Number(newWindSpeed.toFixed(1)),
          wind_direction: Number(newWindDir.toFixed(0)),
          yaw_angle: Number(newYaw.toFixed(0)),
          rotor_speed: Number(actualRotorSpeed.toFixed(1)),
          
          gearbox_temperature: Number(fluctuate(newGearboxTemp, 1).toFixed(0)),
          gearbox_vibration: Number(fluctuate(newVibration, 0.2).toFixed(1)),
          
          expected_generation: Number(expectedGen.toFixed(2)),
          actual_generation: Number(newActualGen.toFixed(2)),
          energy_production: Number(newActualGen.toFixed(2)),
          generator_power: Number(newActualGen.toFixed(2)),
          
          turbine_efficiency: expectedGen > 0 ? Number(((newActualGen / expectedGen) * 100).toFixed(1)) : 0,
          
          turbines: updatedTurbines,
          totalAvailablePower: Number(totalAvailable.toFixed(2)),
          currentLoad: Number(currentLoad.toFixed(2)),
          surplusPower: Number((totalAvailable - currentLoad).toFixed(2))
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return data;
}

