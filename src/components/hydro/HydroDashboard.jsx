import React from 'react';
import { useHydroData } from './useHydroData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import './HydroDashboard.css';

// ==========================================
// 1. Top Hero Section
// ==========================================
const HydroHero = ({ data }) => {
  return (
    <section className="hydro-hero">
      <div className="hydro-hero-content">
        <h1>HYDRO POWER PLANT</h1>
        <p>Real-Time Water Flow, Generation & Seasonal Monitoring</p>
        
        <div className="hydro-status-badge">
          <span className="hydro-status-dot"></span> SYSTEM OPERATIONAL
        </div>

        <div className="hydro-hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-label">Current Generation</span>
            <span className="hero-stat-value">{data.energy_production} kW</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Water Flow</span>
            <span className="hero-stat-value">{data.turbine_flow} m³/s</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Reservoir Level</span>
            <span className="hero-stat-value">{data.reservoir_level}%</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Rainfall</span>
            <span className="hero-stat-value">{data.rainfall} mm</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Plant Efficiency</span>
            <span className="hero-stat-value">{data.plant_efficiency}%</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Season Mode</span>
            <span className="hero-stat-value" style={{color: '#38bdf8'}}>{data.season}</span>
          </div>
        </div>
        
        <div style={{ fontSize: '0.75rem', marginTop: '24px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          LIVE • Updated every 5 seconds • {new Date().toLocaleTimeString()}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 2. Real-Time Environmental Data
// ==========================================
const EnvironmentalData = ({ data }) => {
  return (
    <section>
      <h2 className="hydro-section-header">Environmental & Water Conditions</h2>
      <div className="hydro-grid-4">
        <div className="hydro-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>🌧️</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>CURRENT RAINFALL</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800, color: '#0ea5e9'}}>{data.rainfall} mm</div>
          <div style={{fontSize: '0.75rem', marginTop: '4px', color: '#64748b'}}>Month: {data.monthly_rainfall} mm</div>
        </div>
        <div className="hydro-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>🌊</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>WATER INFLOW</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800, color: '#0ea5e9'}}>{data.water_inflow} m³/s</div>
        </div>
        <div className="hydro-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>💧</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>WATER OUTFLOW</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800}}>{data.water_outflow} m³/s</div>
        </div>
        <div className="hydro-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>🌊</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>RIVER FLOW</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800}}>{data.river_flow} m³/s</div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. Energy Production & Seasonal Charts
// ==========================================
const EnergyProduction = ({ data }) => {
  const seasonalData = [
    { name: 'MONSOON', generation: 92, color: '#0ea5e9' },
    { name: 'POST-MONSOON', generation: 78, color: '#38bdf8' },
    { name: 'WINTER', generation: 61, color: '#94a3b8' },
    { name: 'SUMMER', generation: 42, color: '#F59E0B' },
  ];

  return (
    <section>
      <h2 className="hydro-section-header">Energy Production & Seasonal Analysis</h2>
      <div className="hydro-grid-2">
        {/* Left: Production Stats & Time Series */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="hydro-grid-2">
            <div className="hydro-card">
              <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>CURRENT POWER</div>
              <div style={{fontSize: '1.8rem', fontWeight: 800, color: '#0ea5e9'}}>{data.energy_production} kW</div>
            </div>
            <div className="hydro-card">
              <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>TODAY</div>
              <div style={{fontSize: '1.8rem', fontWeight: 800}}>142.6 kWh</div>
            </div>
          </div>
          
          <div className="hydro-card" style={{ height: '300px' }}>
            <h3 className="hydro-title">Hydro Generation vs Time (Today)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.generationHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHydro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorHydro)" name="Actual kW" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Seasonal Analysis */}
        <div className="hydro-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="hydro-title">Seasonal Generation Profile</h3>
          <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '16px'}}>
            Demonstrates historical generation potential based on seasonal water availability.
          </p>
          <div style={{ flex: 1, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="generation" radius={[0, 4, 4, 0]}>
                  {seasonalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={data.season === entry.name ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{fontSize: '0.75rem', textAlign: 'center', marginTop: '12px', color: '#0ea5e9', fontWeight: 700}}>
            ACTIVE SEASON: {data.season}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. Rainfall -> Generation Impact Flow
// ==========================================
const RainfallImpact = ({ data }) => {
  return (
    <section>
      <div className="hydro-grid-2">
        <div className="hydro-card" style={{background: '#f8fafc'}}>
          <h3 className="hydro-title">Rainfall Impact on Hydro Generation</h3>
          <div className="hydro-flow-diagram">
            <div className="hf-node">
              <div className="hf-icon">🌧️</div>
              <div style={{fontWeight: 700, fontSize: '0.8rem'}}>RAINFALL</div>
              <div className="text-cyan font-bold">{data.rainfall} mm</div>
            </div>
            <div className="hf-pipe"><div className="hf-water"></div></div>
            <div className="hf-node">
              <div className="hf-icon">🌊</div>
              <div style={{fontWeight: 700, fontSize: '0.8rem'}}>INFLOW</div>
              <div className="text-cyan font-bold">{data.water_inflow} m³/s</div>
            </div>
            <div className="hf-pipe"><div className="hf-water"></div></div>
            <div className="hf-node">
              <div className="hf-icon">🛢️</div>
              <div style={{fontWeight: 700, fontSize: '0.8rem'}}>RESERVOIR</div>
              <div className="text-cyan font-bold">{data.reservoir_level}%</div>
            </div>
            <div className="hf-pipe"><div className="hf-water"></div></div>
            <div className="hf-node">
              <div className="hf-icon">⚙️</div>
              <div style={{fontWeight: 700, fontSize: '0.8rem'}}>GENERATION</div>
              <div className="text-cyan font-bold">{data.actual_generation} kW</div>
            </div>
          </div>
        </div>

        <div className="hydro-card">
          <h3 className="hydro-title">Rainfall-Based Generation Forecast</h3>
          {data.rainfall > 15 ? (
             <div style={{padding: '16px', background: '#EBF8FF', borderLeft: '4px solid #3182CE', borderRadius: '8px'}}>
               <strong style={{color: '#2B6CB0'}}>🌧️ Heavy rainfall detected</strong>
               <p style={{marginTop: '8px', fontSize: '0.9rem', color: '#2C5282'}}>
                 Recent rainfall is increasing water inflow. Higher water availability allows increased hydroelectric generation, subject to reservoir operating limits and turbine capacity.
               </p>
             </div>
          ) : (
             <div style={{padding: '16px', background: '#FFFBEB', borderLeft: '4px solid #F6E05E', borderRadius: '8px'}}>
               <strong style={{color: '#975A16'}}>☀️ Low rainfall period</strong>
               <p style={{marginTop: '8px', fontSize: '0.9rem', color: '#744210'}}>
                 Reduced rainfall may decrease future water inflow. Generation should be optimized to conserve available water.
               </p>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. Reservoir & 24-Hour Map
// ==========================================
const ReservoirAndMap = ({ data }) => {
  const isHighLevel = data.reservoir_level > 90;

  return (
    <section>
      <h2 className="hydro-section-header">Reservoir & 24-Hour Operations</h2>
      <div className="hydro-grid-3">
        {/* Reservoir Visualization */}
        <div className="hydro-card" style={{ textAlign: 'center' }}>
          <h3 className="hydro-title" style={{justifyContent: 'center'}}>Reservoir Status</h3>
          <div className="reservoir-container">
            <div className="reservoir-water" style={{ height: `${data.reservoir_level}%`, background: isHighLevel ? 'linear-gradient(to bottom, #f87171, #ef4444)' : '' }}></div>
            {/* Overlay Text inside tank */}
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: data.reservoir_level > 50 ? '#fff' : '#000', fontWeight: 800, fontSize: '1.5rem', zIndex: 10, textShadow: data.reservoir_level > 50 ? '0 1px 4px rgba(0,0,0,0.5)' : 'none'}}>
              {data.reservoir_level}%
            </div>
          </div>
          <div style={{marginTop: '16px', fontSize: '0.85rem', color: '#64748b'}}>
            <div>Current Level: 182.4 m</div>
            <div>Available Storage: {data.reservoir_volume}M m³</div>
          </div>
          {isHighLevel && (
            <div className="hydro-alert hydro-alert-critical" style={{marginTop: '12px', fontSize: '0.75rem'}}>
              <strong>⚠ HIGH RESERVOIR LEVEL</strong>
              Controlled spill release recommended.
            </div>
          )}
        </div>

        {/* 24-Hour Heatmap */}
        <div className="hydro-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="hydro-title">24-Hour Hydro Generation Map</h3>
          <p style={{fontSize: '0.85rem', color: '#64748b'}}>
            Unlike solar, hydro operates continuously depending on water dispatch. Shows 288 x 5-min intervals.
          </p>
          <div className="heatmap-grid">
            {data.generationMap24h.map((slot, i) => {
              // Calculate opacity based on generation (0 to ~10 kW)
              const intensity = slot.generation > 0 ? 0.3 + (slot.generation / 10) * 0.7 : 0.05;
              return (
                <div 
                  key={i} 
                  className="heatmap-cell"
                  style={{
                    background: slot.isCurrent ? '#F59E0B' : (slot.generation > 0 ? '#0ea5e9' : '#e2e8f0'),
                    opacity: slot.isCurrent ? 1 : intensity,
                    transform: slot.isCurrent ? 'scale(1.2)' : 'none',
                    border: slot.isCurrent ? '1px solid #000' : 'none'
                  }}
                  title={`${slot.time} - ${slot.generation} kW`}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px', padding: '0 4px' }}>
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:55</span>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. Live Turbine & Mechanical/Electrical
// ==========================================
const TurbineHealth = ({ data }) => {
  // Animation duration based on turbine speed (e.g., 300 RPM = 5 RPS = 0.2s duration)
  const animDuration = data.turbine_speed > 0 ? (60 / data.turbine_speed).toFixed(0) : 0;
  
  // Anomaly logic
  const isVibrationHigh = data.shaft_vibration > 3.0;
  const isFlowLow = data.turbine_flow < 100 && data.reservoir_level > 50;

  return (
    <section>
      <h2 className="hydro-section-header">Live Turbine & Mechanical Health</h2>
      <div className="hydro-grid-3">
        
        {/* Live Turbine Animation */}
        <div className="hydro-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="hydro-title">Hydro Turbine Visualization</h3>
          <div className="hydro-turbine-container" style={{ '--turbine-speed': animDuration > 0 ? `${animDuration}s` : '0s' }}>
             <div className="hydro-rotor">
               <div className="hydro-blade hb-1"></div>
               <div className="hydro-blade hb-2"></div>
               <div className="hydro-blade hb-3"></div>
               <div className="hydro-blade hb-4"></div>
               <div className="hydro-blade hb-5"></div>
               <div className="hydro-blade hb-6"></div>
             </div>
          </div>
          <div style={{marginTop: '16px', width: '100%', fontSize: '0.85rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '4px 0'}}>
              <span style={{color: '#64748b'}}>Turbine Speed</span> <strong>{data.turbine_speed} RPM</strong>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '4px 0'}}>
              <span style={{color: '#64748b'}}>Water Flow</span> <strong className="text-cyan">{data.turbine_flow} m³/s</strong>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '4px 0'}}>
              <span style={{color: '#64748b'}}>Water Pressure</span> <strong>{data.water_pressure} bar</strong>
            </div>
          </div>
        </div>

        {/* Mechanical Health */}
        <div className="hydro-card">
          <h3 className="hydro-title">Mechanical Parameters</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
             <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px'}}>
               <div style={{fontSize: '0.75rem', color: '#64748b'}}>BEARING TEMP</div>
               <div style={{fontSize: '1.2rem', fontWeight: 800}}>{data.bearing_temperature}°C</div>
             </div>
             <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px'}}>
               <div style={{fontSize: '0.75rem', color: '#64748b'}}>GENERATOR TEMP</div>
               <div style={{fontSize: '1.2rem', fontWeight: 800}}>{data.generator_temperature}°C</div>
             </div>
             <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: isVibrationHigh ? '4px solid #E53E3E' : 'none'}}>
               <div style={{fontSize: '0.75rem', color: '#64748b'}}>SHAFT VIBRATION</div>
               <div style={{fontSize: '1.2rem', fontWeight: 800, color: isVibrationHigh ? '#E53E3E' : 'inherit'}}>{data.shaft_vibration} mm/s</div>
             </div>
             <div style={{background: '#f8fafc', padding: '12px', borderRadius: '8px'}}>
               <div style={{fontSize: '0.75rem', color: '#64748b'}}>GUIDE VANE POSITION</div>
               <div style={{fontSize: '1.2rem', fontWeight: 800}}>{data.guide_vane_position}%</div>
             </div>
          </div>
        </div>

        {/* Alerts & Faults */}
        <div className="hydro-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="hydro-title">Fault Detection</h3>
          
          {isVibrationHigh && (
            <div className="hydro-alert hydro-alert-critical">
              <div style={{ fontWeight: 800 }}>⚠ ABNORMAL TURBINE VIBRATION</div>
              <div style={{ fontSize: '0.8rem' }}>Actual: {data.shaft_vibration} mm/s (Expected &lt; 3 mm/s)<br/><br/>Possible Cause: Mechanical imbalance.<br/>Action: Schedule turbine inspection.</div>
            </div>
          )}
          
          {isFlowLow && (
            <div className="hydro-alert hydro-alert-warning">
              <div style={{ fontWeight: 800 }}>⚠ LOW WATER FLOW DETECTED</div>
              <div style={{ fontSize: '0.8rem' }}>Deviation detected. Reservoir is full but flow is low.<br/>Possible Cause: Intake restriction.</div>
            </div>
          )}

          {!isVibrationHigh && !isFlowLow && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#35B866', fontWeight: 700, padding: '20px', background: '#F0FFF4', borderRadius: '8px' }}>
              ✓ Mechanical systems operating normally
            </div>
          )}
        </div>
      </div>
    </section>
  );
};


// ==========================================
// 7. Efficiency & Three-Renewable Coordination
// ==========================================
const EfficiencyAndCoordination = ({ data }) => {
  return (
    <section style={{marginBottom: '60px'}}>
      <h2 className="hydro-section-header">Performance & Renewable Coordination</h2>
      <div className="hydro-grid-3">
        
        {/* Plant Efficiency */}
        <div className="hydro-card">
          <h3 className="hydro-title">Plant Health & Efficiency</h3>
          <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#35B866' }}>{data.plant_health}%</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>EXCELLENT</div>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Hydraulic Efficiency</span> <strong>{data.hydraulic_efficiency}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Turbine Efficiency</span> <strong>{data.turbine_efficiency}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Overall Plant Efficiency</span> <strong>{data.plant_efficiency}%</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Renewable Coordination */}
        <div className="hydro-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="hydro-title">Dynamic Renewable Coordination (SIH Logic)</h3>
          <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '16px'}}>
            The system dynamically adjusts load contribution across Solar, Wind, and Hydro based on environmental conditions (Rainfall, Sun, Wind).
          </p>
          
          <div className="coordination-hub">
             <div style={{fontSize: '1.8rem', fontWeight: 800}}>{data.total_renewable.toFixed(0)} kW</div>
             <div style={{fontSize: '0.8rem', opacity: 0.8}}>TOTAL RENEWABLE POWER AVAILABLE</div>
             
             <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', marginTop: '32px' }}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2rem'}}>💧</div>
                  <div style={{fontWeight: 700, color: '#38bdf8'}}>{data.energy_production} kW</div>
                  <div style={{fontSize: '0.7rem'}}>HYDRO (Active: {data.season})</div>
                </div>
                <div style={{fontSize: '1.5rem', opacity: 0.5, alignSelf: 'center'}}>+</div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2rem'}}>☀️</div>
                  <div style={{fontWeight: 700, color: '#F5B942'}}>{data.solar_power} kW</div>
                  <div style={{fontSize: '0.7rem'}}>SOLAR</div>
                </div>
                <div style={{fontSize: '1.5rem', opacity: 0.5, alignSelf: 'center'}}>+</div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2rem'}}>🌬️</div>
                  <div style={{fontWeight: 700, color: '#83f28f'}}>{data.wind_power} kW</div>
                  <div style={{fontSize: '0.7rem'}}>WIND</div>
                </div>
             </div>
             
             <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.2)', margin: '24px 0' }}></div>
             
             <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{fontSize: '0.8rem', opacity: 0.8}}>CURRENT LOAD</div>
                 <div style={{fontSize: '1.5rem', fontWeight: 800}}>{data.current_load} kW</div>
               </div>
               
               <div style={{ padding: '8px 16px', borderRadius: '20px', background: data.battery_power < 0 ? 'rgba(53, 184, 102, 0.2)' : 'rgba(229, 62, 62, 0.2)', color: data.battery_power < 0 ? '#83f28f' : '#FC8181', border: `1px solid ${data.battery_power < 0 ? '#35B866' : '#E53E3E'}` }}>
                 {data.battery_power < 0 ? '🔋 CHARGING BATTERY' : '⚡ DRAWING FROM BATTERY'} ({Math.abs(data.battery_power)} kW)
               </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};


// ==========================================
// Main Dashboard Container
// ==========================================
export default function HydroDashboard() {
  const hydroData = useHydroData();

  return (
    <div className="hydro-page">
      <HydroHero data={hydroData} />
      
      <div className="hydro-container">
        <EnvironmentalData data={hydroData} />
        <EnergyProduction data={hydroData} />
        <RainfallImpact data={hydroData} />
        <ReservoirAndMap data={hydroData} />
        <TurbineHealth data={hydroData} />
        <EfficiencyAndCoordination data={hydroData} />
      </div>

      <footer className="hydro-footer" style={{ background: '#083344', color: '#e2e8f0', padding: '24px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', flexWrap: 'wrap', gap: '16px' }}>
        <div><strong>EcoGrid Hydro Monitor v2.1</strong></div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#35B866'}}></span> RESERVOIR NORMAL</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#35B866'}}></span> TURBINE ONLINE</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#35B866'}}></span> GRID CONNECTED</div>
        </div>
        <div>Last Updated: {new Date().toLocaleTimeString()}</div>
      </footer>
    </div>
  );
}

