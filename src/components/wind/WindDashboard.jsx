import React from 'react';
import { useWindData } from './useWindData';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine
} from 'recharts';
import './WindDashboard.css';

// ==========================================
// 1. Top Hero Section
// ==========================================
const WindHero = ({ data }) => {
  return (
    <section className="wind-hero">
      <div className="wind-hero-content">
        <h1>WIND POWER PLANT</h1>
        <p>Real-Time Wind Generation & Turbine Health Monitoring</p>
        
        <div className="wind-status-badge">
          <span className="wind-status-dot"></span> SYSTEM OPERATIONAL
        </div>

        <div className="wind-hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-label">Current Generation</span>
            <span className="hero-stat-value animated-number">{data.energy_production} kW</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Wind Speed</span>
            <span className="hero-stat-value animated-number">{data.wind_speed} m/s</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Rotor Speed</span>
            <span className="hero-stat-value animated-number">{data.rotor_speed} RPM</span>
          </div>
          <div className="hero-stat-item" style={{marginTop: '16px'}}>
            <span className="hero-stat-label">Turbine Efficiency</span>
            <span className="hero-stat-value animated-number">{data.turbine_efficiency}%</span>
          </div>
          <div className="hero-stat-item" style={{marginTop: '16px'}}>
            <span className="hero-stat-label">Turbine Health</span>
            <span className="hero-stat-value animated-number">{data.turbine_health}%</span>
          </div>
        </div>
        
        <div style={{ fontSize: '0.75rem', marginTop: '24px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          LIVE • Weather data updated every 3 seconds • {new Date().toLocaleTimeString()}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 2. Environmental Data
// ==========================================
const EnvironmentalConditions = ({ data }) => {
  return (
    <section>
      <h2 className="wind-section-header">Environmental Conditions</h2>
      <div className="wind-grid-5">
        <div className="wind-card" style={{textAlign: 'center'}}>
          <div className="compass-container">
            <div className="compass-label compass-n">N</div>
            <div className="compass-label compass-s">S</div>
            <div className="compass-label compass-e">E</div>
            <div className="compass-label compass-w">W</div>
            <div className="compass-needle" style={{ transform: `rotate(${data.wind_direction}deg)` }}></div>
          </div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>WIND DIR</div>
          <div style={{fontSize: '1.2rem', fontWeight: 800}}>{data.wind_direction}°</div>
        </div>
        
        <div className="wind-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>🌬️</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>WIND SPEED</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800, color: '#0ea5e9'}}>{data.wind_speed} m/s</div>
        </div>
        <div className="wind-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>🌡️</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>TEMPERATURE</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800}}>{data.temperature} °C</div>
        </div>
        <div className="wind-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>💧</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>HUMIDITY</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800}}>{data.humidity} %</div>
        </div>
        <div className="wind-card">
          <div style={{fontSize: '2rem', marginBottom: '8px'}}>🌫️</div>
          <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>AIR DENSITY</div>
          <div style={{fontSize: '1.5rem', fontWeight: 800}}>{data.air_density} kg/m³</div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. Energy Production & 4. Power Curve
// ==========================================
const EnergyProduction = ({ data }) => {
  return (
    <section>
      <h2 className="wind-section-header">Energy Production & Power Curve</h2>
      <div className="wind-grid-2">
        {/* Left: Production Stats & Time Series */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="wind-grid-2">
            <div className="wind-card">
              <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>CURRENT POWER</div>
              <div style={{fontSize: '1.8rem', fontWeight: 800, color: '#0ea5e9'}}>{data.energy_production} kW</div>
            </div>
            <div className="wind-card">
              <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>TODAY (Estimated)</div>
              <div style={{fontSize: '1.8rem', fontWeight: 800}}>{data.today_energy} kWh</div>
            </div>
            <div className="wind-card">
              <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>THIS MONTH (Estimated)</div>
              <div style={{fontSize: '1.8rem', fontWeight: 800}}>{data.month_energy} kWh</div>
            </div>
            <div className="wind-card">
              <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 700}}>TOTAL</div>
              <div style={{fontSize: '1.8rem', fontWeight: 800}}>{(data.total_energy/1000).toFixed(1)} GWh</div>
            </div>
          </div>
          
          <div className="wind-card" style={{ height: '280px' }}>
            <h3 className="wind-title">Generation vs Time (Today)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.generationHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorWind)" name="Actual kW" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Power Curve */}
        <div className="wind-card" style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 className="wind-title">Wind Turbine Power Curve</h3>
          <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '16px'}}>
            Demonstrates mechanical power generated relative to wind speed.
          </p>
          <div style={{ flex: 1, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.powerCurveData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="windSpeed" type="number" tick={{fontSize: 12, fill: '#64748b'}} label={{ value: 'Wind Speed (m/s)', position: 'bottom', fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} label={{ value: 'Power (MW)', angle: -90, position: 'left', fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <ReferenceLine x={3} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Cut-in (3)', fill: '#94a3b8', fontSize: 10 }} />
                <ReferenceLine x={12} stroke="#35B866" strokeDasharray="3 3" label={{ position: 'top', value: 'Rated (12)', fill: '#35B866', fontSize: 10 }} />
                <ReferenceLine x={25} stroke="#E53E3E" strokeDasharray="3 3" label={{ position: 'top', value: 'Cut-out (25)', fill: '#E53E3E', fontSize: 10 }} />
                
                <Line type="monotone" dataKey="expected" stroke="#cbd5e0" strokeWidth={2} dot={false} name="Expected kW" />
                <Line type="monotone" dataKey="actual" stroke="#0ea5e9" strokeWidth={3} dot={false} name="Actual kW" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. Live Turbine Vis & 6. Mechanical Health
// ==========================================
const TurbineAndMechanical = ({ data }) => {
  // Map rotor speed to css animation duration (faster speed = lower duration)
  // e.g. 20 RPM = 3 seconds per revolution. RPM = 60/duration -> duration = 60/RPM
  const animDuration = data.rotor_speed > 0 ? (60 / data.rotor_speed).toFixed(2) : 0;
  
  return (
    <section>
      <h2 className="wind-section-header">Live Turbine & Mechanical Health</h2>
      <div className="wind-grid-3">
        {/* Live Visual */}
        <div className="wind-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="wind-title">Live Visualization</h3>
          <div className="turbine-vis-container" style={{ '--rotor-speed': animDuration > 0 ? `${animDuration}s` : '0s' }}>
            {data.rotor_speed === 0 && <div style={{position:'absolute', top: '10px', color: '#E53E3E', fontWeight: 800}}>TURBINE STOPPED</div>}
            <div className="turbine-rotor">
              <div className="turbine-blade blade-1"></div>
              <div className="turbine-blade blade-2"></div>
              <div className="turbine-blade blade-3"></div>
            </div>
            <div className="turbine-nacelle"></div>
            <div className="turbine-tower"></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
            <span style={{fontSize: '0.85rem', color: '#64748b'}}>Wind Speed</span>
            <strong className="text-cyan">{data.wind_speed} m/s</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #f1f5f9' }}>
            <span style={{fontSize: '0.85rem', color: '#64748b'}}>Rotor Speed</span>
            <strong>{data.rotor_speed} RPM</strong>
          </div>
        </div>

        {/* Mechanical Health */}
        <div className="wind-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="wind-title">Mechanical Parameters</h3>
          <div className="wind-grid-2" style={{ gap: '16px', marginTop: '24px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>ROTOR SPEED</div>
              <div style={{fontSize: '1.4rem', fontWeight: 800}}>{data.rotor_speed} RPM</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>BLADE PITCH</div>
              <div style={{fontSize: '1.4rem', fontWeight: 800}}>{data.blade_pitch_angle}°</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>GEARBOX TEMP</div>
              <div style={{fontSize: '1.4rem', fontWeight: 800, color: data.gearbox_temperature > 75 ? '#F59E0B' : '#35B866'}}>{data.gearbox_temperature} °C</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>GENERATOR TEMP</div>
              <div style={{fontSize: '1.4rem', fontWeight: 800}}>{data.generator_temperature} °C</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>VIBRATION</div>
              <div style={{fontSize: '1.4rem', fontWeight: 800, color: data.gearbox_vibration > 3.0 ? '#F59E0B' : '#35B866'}}>{data.gearbox_vibration} mm/s</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>BRAKE STATUS</div>
              <div style={{fontSize: '1.4rem', fontWeight: 800, color: '#35B866'}}>● RELEASED</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 7. Electrical & 8. Faults (Yaw Misalignment)
// ==========================================
const ElectricalAndFaults = ({ data }) => {
  const yawDiff = Math.abs(data.wind_direction - data.yaw_angle);
  const yawDiffNormalized = yawDiff > 180 ? 360 - yawDiff : yawDiff;
  const isYawMisaligned = yawDiffNormalized > 8;
  const isGearboxHot = data.gearbox_temperature > 75;
  const isPerformanceLow = data.actual_generation < data.expected_generation * 0.9;

  return (
    <section>
      <h2 className="wind-section-header">Electrical & Anomaly Detection</h2>
      <div className="wind-grid-2">
        {/* Electrical */}
        <div className="wind-card">
          <h3 className="wind-title">Electrical Parameters</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{color: '#64748b'}}>Generator Voltage</span>
            <strong>{data.generator_voltage} V</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{color: '#64748b'}}>Generator Current</span>
            <strong>{data.generator_current} A</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{color: '#64748b'}}>Grid Voltage</span>
            <strong className="text-cyan">{data.grid_voltage} V</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{color: '#64748b'}}>Grid Frequency</span>
            <strong className="text-cyan">{data.grid_frequency} Hz</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{color: '#64748b'}}>Power Factor</span>
            <strong>{data.power_factor}</strong>
          </div>
        </div>

        {/* Faults */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Yaw Misalignment Visualizer */}
          <div className="wind-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #f1f5f9' }}>
              {/* Wind Direction (Cyan) */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '4px', background: '#0ea5e9', transform: `translateX(-50%) rotate(${data.wind_direction}deg)`, transition: '0.5s', zIndex: 2 }}></div>
              {/* Turbine Yaw (Gray) */}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '8px', background: '#94a3b8', transform: `translateX(-50%) rotate(${data.yaw_angle}deg)`, transition: '0.5s', zIndex: 1, opacity: 0.5 }}></div>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{fontSize: '1rem', fontWeight: 700, marginBottom: '8px'}}>Yaw Alignment</h4>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b'}}>
                <span>Wind: {data.wind_direction}°</span>
                <span>Turbine: {data.yaw_angle}°</span>
              </div>
              <div style={{marginTop: '8px'}}>
                {isYawMisaligned ? (
                  <span className="w-badge w-badge-yellow">⚠ MISALIGNMENT ({yawDiffNormalized.toFixed(1)}°)</span>
                ) : (
                  <span className="w-badge w-badge-green">✓ OPTIMAL</span>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Fault Alerts */}
          {isGearboxHot && (
            <div className="wind-alert">
              <div style={{ fontWeight: 800, color: '#C53030' }}>⚠ GEARBOX TEMPERATURE HIGH</div>
              <div style={{ fontSize: '0.85rem' }}>Actual: {data.gearbox_temperature}°C (Expected &lt; 75°C)<br/><br/>Recommended: Inspect lubrication system.</div>
            </div>
          )}
          {isPerformanceLow && (
            <div className="wind-alert" style={{ borderLeftColor: '#F59E0B', background: '#FFFBEB' }}>
              <div style={{ fontWeight: 800, color: '#D97706' }}>⚠ GENERATION UNDERPERFORMANCE</div>
              <div style={{ fontSize: '0.85rem', color: '#92400E' }}>Expected: {data.expected_generation} kW | Actual: {data.actual_generation} kW<br/>Possible cause: Yaw misalignment or low wind efficiency.</div>
            </div>
          )}
          {!isGearboxHot && !isPerformanceLow && !isYawMisaligned && (
            <div className="wind-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#35B866', fontWeight: 700 }}>
              ✓ All systems operating normally
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 9. Wind Farm Overview & Dispatch
// ==========================================
const WindFarmAndDispatch = ({ data }) => {
  const onlineCount = data.turbines.filter(t => t.status === 'ONLINE').length;
  const warningCount = data.turbines.filter(t => t.status === 'WARNING').length;
  const offlineCount = data.turbines.filter(t => t.status === 'OFFLINE').length;
  const availability = ((onlineCount / data.turbines.length) * 100).toFixed(1);

  return (
    <section style={{marginBottom: '60px'}}>
      <h2 className="wind-section-header">Dynamic Energy Dispatch & Farm Overview</h2>
      
      <div className="wind-grid-3" style={{ marginBottom: '24px' }}>
        <div className="wind-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 className="wind-title">Farm Availability</h3>
          <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0ea5e9' }}>{availability}%</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '8px', background: '#f8fafc' }}>
            <span>Online</span> <strong className="text-green">{onlineCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '8px', background: '#f8fafc' }}>
            <span>Warning</span> <strong className="text-yellow">{warningCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '8px', background: '#f8fafc' }}>
            <span>Maintenance</span> <strong className="text-red">{offlineCount}</strong>
          </div>
        </div>

        <div className="wind-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="wind-title">Dynamic Energy Dispatch</h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '100%' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>AVAILABLE WIND POWER</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0ea5e9' }}>{data.totalAvailablePower} kW</div>
            </div>
            <div style={{ fontSize: '2rem', color: '#cbd5e1' }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>CURRENT LOAD</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data.currentLoad} kW</div>
            </div>
            <div style={{ fontSize: '2rem', color: '#cbd5e1' }}>=</div>
            <div style={{ flex: 1, padding: '16px', background: data.surplusPower >= 0 ? '#F0FFF4' : '#FFF5F5', borderRadius: '8px', borderLeft: `4px solid ${data.surplusPower >= 0 ? '#35B866' : '#E53E3E'}` }}>
              <div style={{ color: data.surplusPower >= 0 ? '#276749' : '#C53030', fontSize: '0.8rem', fontWeight: 700 }}>
                {data.surplusPower >= 0 ? 'SURPLUS' : 'DEFICIT'}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: data.surplusPower >= 0 ? '#2F855A' : '#C53030' }}>
                {Math.abs(data.surplusPower)} kW
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#64748b' }}>
                {data.surplusPower >= 0 ? '→ Routing to Battery / Grid' : '→ Drawing from Battery Support'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="wind-flow-diagram">
        {data.turbines.map(t => (
          <React.Fragment key={t.id}>
            <div className="wf-node">
              <div className="wf-icon" style={{ borderColor: t.color }}>🌬️</div>
              <span className="wf-label">{t.id}</span>
              <span className="wf-value" style={{ color: t.color }}>{t.power.toFixed(2)} kW</span>
            </div>
            <div className="wf-connector">
              {t.power > 0 && <div className="wf-particle"></div>}
            </div>
          </React.Fragment>
        ))}
        
        <div className="wf-node" style={{ minWidth: '120px' }}>
          <div className="wf-icon" style={{ background: '#f8fafc', borderColor: '#cbd5e1' }}>🏭</div>
          <span className="wf-label">Collection Hub</span>
          <span className="wf-value text-cyan">{data.totalAvailablePower} kW</span>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// Main Dashboard Container
// ==========================================
export default function WindDashboard() {
  const { data: windData, loading, error } = useWindData();

  if (loading || !windData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          fontWeight: 700,
        }}
      >
        Loading live wind data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C53030",
          fontWeight: 700,
        }}
      >
        Unable to load wind data: {error}
      </div>
    );
  }
  return (
    <div className="wind-page">
      <WindHero data={windData} />
      
      <div className="wind-container">
        <EnvironmentalConditions data={windData} />
        <EnergyProduction data={windData} />
        <TurbineAndMechanical data={windData} />
        <ElectricalAndFaults data={windData} />
        <WindFarmAndDispatch data={windData} />
      </div>

      <footer className="wind-footer">
        <div><strong>EcoGrid Wind Monitor v2.1</strong></div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#35B866'}}></span> WIND TURBINES ONLINE</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#35B866'}}></span> GENERATOR ONLINE</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{width: 8, height: 8, borderRadius: '50%', background: '#35B866'}}></span> GRID CONNECTED</div>
        </div>
        <div>Last Updated: {new Date().toLocaleTimeString()}</div>
      </footer>
    </div>
  );
}

