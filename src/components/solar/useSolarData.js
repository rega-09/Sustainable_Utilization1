import { useState, useEffect } from 'react';

// Utility to add slight random fluctuations
const fluctuate = (base, variance) => {
  return base + (Math.random() * variance * 2 - variance);
};

export function useSolarData() {
  const [data, setData] = useState(() => {
    // Generate realistic daily curve for chart
    const history = [];
    let currentHour = new Date().getHours();
    
    for (let i = 0; i < 24; i++) {
      let expected = 0;
      let actual = 0;
      
      if (i > 5 && i < 19) {
        // Simple bell curve for solar generation
        const x = (i - 12) / 3.5;
        const factor = Math.exp(-(x * x));
        expected = factor * 500; // max 500kW
        actual = expected * (0.85 + Math.random() * 0.1); // slightly less
        
        // Add a dip if it's afternoon to simulate clouds
        if (i === 14 || i === 15) {
            actual *= 0.7;
        }
      }
      
      history.push({
        time: `${i.toString().padStart(2, '0')}:00`,
        expected: Math.max(0, Math.round(expected)),
        actual: i <= currentHour ? Math.max(0, Math.round(actual)) : null,
      });
    }
    
    // Generate 288 5-min slots for map
    const mapSlots = [];
    for(let i=0; i<288; i++) {
        let intensity = 0;
        const hour = i * 5 / 60;
        if(hour > 6 && hour < 18) {
            const x = (hour - 12) / 3;
            intensity = Math.exp(-(x * x)) * 100; // 0 to 100
            // add some cloud noise
            if(hour > 13 && hour < 15) intensity -= 20; 
        }
        mapSlots.push(Math.max(0, intensity));
    }

    return {
      // Environmental
      temperature: 32.6,
      humidity: 64,
      cloud_cover: 18,
      sunlight_intensity: 782, // W/m^2
      wind_speed: 14.2,
      rainfall: 2.4, // mm
      
      // Panel condition
      panel_temperature: 46.1,
      days_since_cleaning: 24,
      cleaning_required: true,
      
      // Electrical DC
      dc_voltage: 812.5,
      dc_current: 526.4,
      dc_power: 427.6, // kW
      
      // Electrical AC
      ac_voltage: 415.2,
      ac_current: 596.1,
      ac_power: 421.3, // kW
      frequency: 50.01,
      power_factor: 0.98,
      
      // String Monitoring
      string_voltage: 810.2,
      string_current: 8.5,
      active_strings: 62,
      faulty_strings: 2, // e.g. String #04 issue
      
      // Generation
      energy_production: 428, // kW current
      today_energy: 3.82, // kWh
      month_energy: 86.4,
      total_energy: 2840, // kWh (2.84 GWh)
      
      expected_generation: 445, // kW
      actual_generation: 428, // kW
      
      plant_efficiency: 91.4,
      plant_health: 92,
      
      // Arrays for charts
      generationHistory: history,
      generationMap: mapSlots
    };
  });

  // Tick every 3 seconds to fluctuate live values
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newSunlight = Math.max(0, fluctuate(prev.sunlight_intensity, 15));
        // Cloud cover fluctuates slightly
        const newCloud = Math.max(0, Math.min(100, fluctuate(prev.cloud_cover, 2)));
        
        // DC Power depends on sunlight and clouds
        const baseExpected = newSunlight * 0.55; 
        const newActual = baseExpected * (1 - newCloud/200) * (prev.cleaning_required ? 0.92 : 1);
        
        const dc_v = fluctuate(812, 5);
        const dc_p = newActual;
        const dc_c = (dc_p * 1000) / dc_v;
        
        const ac_p = dc_p * 0.98; // inverter efficiency
        const ac_v = fluctuate(415, 2);
        const ac_c = (ac_p * 1000) / (ac_v * Math.sqrt(3));
        const freq = fluctuate(50, 0.05);

        return {
          ...prev,
          sunlight_intensity: Number(newSunlight.toFixed(0)),
          cloud_cover: Number(newCloud.toFixed(1)),
          wind_speed: Number(fluctuate(prev.wind_speed, 1.5).toFixed(1)),
          
          dc_voltage: Number(dc_v.toFixed(1)),
          dc_current: Number(dc_c.toFixed(1)),
          dc_power: Number(dc_p.toFixed(1)),
          
          ac_voltage: Number(ac_v.toFixed(1)),
          ac_current: Number(ac_c.toFixed(1)),
          ac_power: Number(ac_p.toFixed(1)),
          frequency: Number(freq.toFixed(2)),
          
          expected_generation: Number(baseExpected.toFixed(0)),
          actual_generation: Number(dc_p.toFixed(0)),
          energy_production: Number(dc_p.toFixed(0)), // main KPI
          
          plant_efficiency: Number(( (dc_p / baseExpected) * 100 ).toFixed(1))
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return data;
}

