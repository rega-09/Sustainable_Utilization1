import React from 'react';
import { useSolarData } from './useSolarData';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import './SolarDashboard.css';

// ==========================================
// 1. Top Hero Section
// ==========================================
const SolarHero = ({ data }) => {
  return (
    <section className="solar-hero">
      <div className="solar-hero-content">
        <h1>SOLAR POWER PLANT</h1>
        <p>Real-Time Generation & Predictive Maintenance</p>
        
        <div className="solar-status-badge">
          <span className="solar-status-dot"></span> SYSTEM OPERATIONAL
        </div>

        <div className="solar-hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-label">Current Generation</span>
            <span className="hero-stat-value animated-number">{data.energy_production} kW</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Sunlight Intensity</span>
            <span className="hero-stat-value animated-number">{data.sunlight_intensity} W/m²</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Panel Temperature</span>
            <span className="hero-stat-value animated-number">{data.panel_temperature}°C</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-label">Plant Efficiency</span>
            <span className="hero-stat-value animated-number">{data.plant_efficiency}%</span>
          </div>
        </div>
        
        <div className="hero-live-text">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Live • Updated every 3 seconds
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 2. Environmental Data
// ==========================================
const EnvironmentalData = ({ data }) => {
  return (
    <section className="solar-section">
      <h2 className="solar-section-header">Environmental Conditions</h2>
      <div className="solar-grid-6">
        <div className="solar-card env-card">
          <div className="env-icon">🌡️</div>
          <span className="env-label">Temperature</span>
          <span className="env-value">{data.temperature} °C</span>
          <span className="badge badge-green">Optimal</span>
        </div>
        <div className="solar-card env-card">
          <div className="env-icon">💧</div>
          <span className="env-label">Humidity</span>
          <span className="env-value">{data.humidity} %</span>
        </div>
        <div className="solar-card env-card">
          <div className="env-icon">☁️</div>
          <span className="env-label">Cloud Cover</span>
          <span className="env-value">{data.cloud_cover} %</span>
          {data.cloud_cover > 50 ? <span className="badge badge-yellow">High</span> : <span className="badge badge-green">Low</span>}
        </div>
        <div className="solar-card env-card">
          <div className="env-icon">☀️</div>
          <span className="env-label">Sunlight</span>
          <span className="env-value">{data.sunlight_intensity} W/m²</span>
        </div>
        <div className="solar-card env-card">
          <div className="env-icon">💨</div>
          <span className="env-label">Wind Speed</span>
          <span className="env-value">{data.wind_speed} km/h</span>
        </div>
        <div className="solar-card env-card">
          <div className="env-icon">🌧️</div>
          <span className="env-label">Rainfall</span>
          <span className="env-value">{data.rainfall} mm</span>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 3. Energy Production
// ==========================================
const EnergyProduction = ({ data }) => {
  return (
    <section className="solar-section">
      <h2 className="solar-section-header">Energy Production</h2>
      <div className="solar-grid-2">
        <div className="solar-grid-2">
          <div className="solar-card">
            <div className="env-label">CURRENT POWER</div>
            <div className="env-value text-green">{data.energy_production} kW</div>
          </div>
          <div className="solar-card">
            <div className="env-label">TODAY</div>
            <div className="env-value">{data.today_energy} kWh</div>
          </div>
          <div className="solar-card">
            <div className="env-label">THIS MONTH</div>
            <div className="env-value">{data.month_energy} kWh</div>
          </div>
          <div className="solar-card">
            <div className="env-label">TOTAL</div>
            <div className="env-value">{data.total_energy / 1000} GWh</div>
          </div>
        </div>
        <div className="solar-card" style={{ height: '300px' }}>
          <h3 className="solar-title">Generation vs Time (Today)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.generationHistory}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#35B866" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#35B866" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{fontSize: 12, fill: '#718096'}} />
              <YAxis tick={{fontSize: 12, fill: '#718096'}} />
              <Tooltip />
              <Area type="monotone" dataKey="actual" stroke="#35B866" fillOpacity={1} fill="url(#colorActual)" name="Actual kW" />
              <Area type="monotone" dataKey="expected" stroke="#cbd5e0" fillOpacity={0} strokeDasharray="5 5" name="Expected kW" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 4. Generation Map
// ==========================================
const GenerationMap = ({ data }) => {
  const currentSlotIndex = Math.floor((new Date().getHours() * 60 + new Date().getMinutes()) / 5);
  return (
    <section className="solar-section">
      <h2 className="solar-section-header">24-Hour Solar Generation Map</h2>
      <div className="solar-card">
        <p style={{marginBottom: '16px', fontSize: '0.9rem', color: '#718096'}}>5-minute interval heatmap of solar intensity based on weather conditions.</p>
        <div className="heatmap-container">
          {data.generationMap.map((intensity, idx) => (
            <div 
              key={idx} 
              className="heatmap-slot" 
              style={{ backgroundColor: `rgba(245, 185, 66, ${intensity / 100})` }}
              title={`Intensity: ${intensity.toFixed(0)}%`}
            ></div>
          ))}
          <div className="heatmap-current-time" style={{ left: `${(currentSlotIndex / 288) * 100}%` }}></div>
        </div>
        <div className="heatmap-time-labels">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:55</span>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 5. Panel & Electrical Health
// ==========================================
const HealthAndElectrical = ({ data }) => {
  return (
    <section className="solar-section">
      <h2 className="solar-section-header">Infrastructure Monitoring</h2>
      <div className="solar-grid-3">
        {/* Panel Health */}
        <div className="solar-card">
          <h3 className="solar-title">Solar Panel Health</h3>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>Temperature</span>
            <strong>{data.panel_temperature} °C</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>Days Since Cleaning</span>
            <strong>{data.days_since_cleaning} Days</strong>
          </div>
          <div style={{marginTop: '20px', padding: '12px', borderRadius: '8px', background: data.cleaning_required ? '#FFF5F5' : '#F0FFF4', borderLeft: `4px solid ${data.cleaning_required ? '#E53E3E' : '#35B866'}`}}>
            <strong style={{color: data.cleaning_required ? '#C53030' : '#276749'}}>
              {data.cleaning_required ? '⚠ CLEANING REQUIRED' : '✓ CLEANING NOT REQUIRED'}
            </strong>
            {data.cleaning_required && <p style={{fontSize: '0.8rem', marginTop: '4px', color: '#C53030'}}>Dust accumulation may be reducing efficiency by ~8.2%.</p>}
          </div>
        </div>

        {/* DC Side */}
        <div className="solar-card">
          <h3 className="solar-title">DC Electrical Parameters</h3>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>DC Voltage</span>
            <strong className="text-blue animated-number">{data.dc_voltage} V</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>DC Current</span>
            <strong className="text-blue animated-number">{data.dc_current} A</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>DC Power</span>
            <strong className="text-blue animated-number">{data.dc_power} kW</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #edf2f7'}}>
            <span style={{color: '#718096'}}>Active Strings</span>
            <strong>{data.active_strings}</strong>
          </div>
        </div>

        {/* AC Side */}
        <div className="solar-card">
          <h3 className="solar-title">AC Output Parameters</h3>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>AC Voltage</span>
            <strong className="text-green animated-number">{data.ac_voltage} V</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>AC Current</span>
            <strong className="text-green animated-number">{data.ac_current} A</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
            <span style={{color: '#718096'}}>Frequency</span>
            <strong className="text-green animated-number">{data.frequency} Hz</strong>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #edf2f7'}}>
            <span style={{color: '#718096'}}>Power Factor</span>
            <strong>{data.power_factor}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 6. Fault & Anomaly Detection
// ==========================================
const IntelligentMonitoring = ({ data }) => {
  const isVoltageDrop = data.faulty_strings > 0;
  
  return (
    <section className="solar-section">
      <h2 className="solar-section-header">Intelligent Analysis</h2>
      <div className="solar-grid-2">
        <div className="solar-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <h3 className="solar-title">Anomaly Detection System</h3>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{fontSize: '3rem', fontWeight: '800', color: '#35B866'}}>{data.plant_health}%</div>
            <div>
              <div style={{fontSize: '1.2rem', fontWeight: '700'}}>Plant Health Score</div>
              <div style={{color: '#718096'}}>Calculated based on 45+ sensor data points</div>
            </div>
          </div>
          
          <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px'}}>
            <span>Generation Efficiency</span>
            <span className="badge badge-green">✓ NORMAL</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px'}}>
            <span>Electrical Systems</span>
            {isVoltageDrop ? <span className="badge badge-yellow">⚠ WARNING</span> : <span className="badge badge-green">✓ NORMAL</span>}
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px'}}>
            <span>Maintenance Status</span>
            {data.cleaning_required ? <span className="badge badge-yellow">⚠ CLEANING DUE</span> : <span className="badge badge-green">✓ NORMAL</span>}
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          {isVoltageDrop && (
            <div className="fault-alert">
              <div className="fault-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                VOLTAGE DROP DETECTED
              </div>
              <p>String #04 shows abnormal voltage deviation.</p>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem'}}>
                <div>Expected: 812 V</div>
                <div style={{color: '#C53030'}}>Actual: 684 V</div>
                <div>Deviation: 15.8%</div>
                <div>Status: INVESTIGATION REQ.</div>
              </div>
            </div>
          )}

          <div className="solar-card" style={{flex: 1}}>
            <h3 className="solar-title">Weather Impact</h3>
            <div style={{marginBottom: '12px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px'}}>
                <span>Sunlight Impact</span>
                <span>Positive</span>
              </div>
              <div style={{width: '100%', height: '8px', background: '#edf2f7', borderRadius: '4px'}}>
                <div style={{width: '85%', height: '100%', background: '#F5B942', borderRadius: '4px'}}></div>
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px'}}>
                <span>Cloud Cover Impact</span>
                <span>Low Reduction</span>
              </div>
              <div style={{width: '100%', height: '8px', background: '#edf2f7', borderRadius: '4px'}}>
                <div style={{width: '18%', height: '100%', background: '#3182ce', borderRadius: '4px'}}></div>
              </div>
            </div>
            <p style={{fontSize: '0.85rem', marginTop: '16px', color: '#718096'}}>
              Current environmental conditions are favorable. Expected Generation: {data.expected_generation} kW.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// 7. System Overview Diagram
// ==========================================
const SystemOverviewVisual = ({ data }) => {
  return (
    <section className="solar-section" style={{marginBottom: '60px'}}>
      <h2 className="solar-section-header">Live Flow Architecture</h2>
      <div className="flow-diagram">
        <div className="flow-node">
          <div className="flow-icon">☀️</div>
          <span className="flow-label">Solar Array</span>
          <span className="flow-value animated-number">{data.dc_power} kW</span>
        </div>
        
        <div className="flow-connector"><div className="flow-particle"></div></div>
        
        <div className="flow-node">
          <div className="flow-icon">⚡</div>
          <span className="flow-label">Inverter</span>
          <span className="flow-value animated-number">{data.ac_power} kW</span>
        </div>
        
        <div className="flow-connector"><div className="flow-particle" style={{animationDelay: '0.5s'}}></div></div>
        
        <div className="flow-node">
          <div className="flow-icon">🏭</div>
          <span className="flow-label">Transformer</span>
          <span className="flow-value animated-number">{(data.ac_power * 0.99).toFixed(1)} kW</span>
        </div>
        
        <div className="flow-connector"><div className="flow-particle" style={{animationDelay: '1s'}}></div></div>
        
        <div className="flow-node">
          <div className="flow-icon">🔌</div>
          <span className="flow-label">Grid Connect</span>
          <span className="flow-value animated-number">{(data.ac_power * 0.98).toFixed(1)} kW</span>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// Main Dashboard Container
// ==========================================
export default function SolarDashboard() {
  const solarData = useSolarData();

  return (
    <div className="solar-page">
      <SolarHero data={solarData} />
      
      <div className="solar-container">
        <EnvironmentalData data={solarData} />
        <EnergyProduction data={solarData} />
        <GenerationMap data={solarData} />
        <HealthAndElectrical data={solarData} />
        <IntelligentMonitoring data={solarData} />
        <SystemOverviewVisual data={solarData} />
      </div>

      <footer className="status-footer">
        <div><strong>EcoGrid Solar Monitor v2.1</strong></div>
        <div className="status-list">
          <div className="status-item"><span className="status-dot-green"></span> Panels Online</div>
          <div className="status-item"><span className="status-dot-green"></span> Inverters Online</div>
          <div className="status-item"><span className="status-dot-green"></span> Sensors Online</div>
          <div className="status-item"><span className="status-dot-green"></span> Data Stream Active</div>
        </div>
        <div>Last Updated: {new Date().toLocaleTimeString()}</div>
      </footer>
    </div>
  );
}

