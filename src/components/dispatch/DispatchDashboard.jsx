import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDispatchEngine } from './useDispatchEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DispatchDashboard.css';

// ==========================================
// SVG Flow Line Component
// ==========================================
const FlowConnection = ({ sourceRef, targetRef, containerRef, power, color }) => {
  const [path, setPath] = useState('');

  const updatePath = useCallback(() => {
    if (!sourceRef.current || !targetRef.current || !containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const src = sourceRef.current.getBoundingClientRect();
    const tgt = targetRef.current.getBoundingClientRect();

    const x1 = src.left + src.width / 2 - box.left;
    const y1 = src.top + src.height / 2 - box.top;
    const x2 = tgt.left + tgt.width / 2 - box.left;
    const y2 = tgt.top + tgt.height / 2 - box.top;

    // Create a smooth curve
    const dx = Math.abs(x2 - x1);
    const offset = Math.max(dx * 0.5, 40);
    setPath(`M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`);
  }, [sourceRef, targetRef, containerRef]);

  useEffect(() => {
    updatePath();
    window.addEventListener('resize', updatePath);
    return () => window.removeEventListener('resize', updatePath);
  }, [updatePath]);

  // Visual thickness based on absolute power
  const absPower = Math.abs(power);
  const thickness = Math.max(2, Math.min(12, absPower));
  // Animation speed based on power
  const animDur = absPower > 0 ? Math.max(0.2, 2 - (absPower * 0.15)) : 0;
  const isReverse = power < 0;

  return (
    <g>
      <path d={path} className="flow-line" />
      {absPower > 0 && (
        <path
          d={path}
          className="flow-particles"
          style={{
            stroke: color,
            strokeWidth: thickness,
            animationDuration: `${animDur}s`,
            animationDirection: isReverse ? 'reverse' : 'normal'
          }}
        />
      )}
    </g>
  );
};

export default function DispatchDashboard() {
  const { 
    data, 
    activeScenario, 
    setActiveScenario,
    solarPercent, setSolarPercent,
    windPercent, setWindPercent,
    hydroPercent, setHydroPercent,
    batterySoc, setBatterySoc
  } = useDispatchEngine();

  // Refs for the flow diagram
  const containerRef = useRef(null);
  const solRef = useRef(null);
  const winRef = useRef(null);
  const hydRef = useRef(null);
  const hubRef = useRef(null);
  const batRef = useRef(null);
  const loadRef = useRef(null);
  const gridRef = useRef(null);

  // Force re-render of SVG on mount
  const [, setTick] = useState(0);
  useEffect(() => { setTimeout(() => setTick(1), 100); }, []);

  const scenarios = [
    { id: 'SUNNY', label: '☀️ Sunny Afternoon' },
    { id: 'MONSOON', label: '🌧️ Monsoon Cloud' },
    { id: 'HIGH_WIND', label: '🌬️ High Wind' },
    { id: 'NIGHT', label: '🌙 Night Mode' },
    { id: 'SOLAR_FAIL', label: '🔴 Solar Fail' },
    { id: 'PEAK_DEMAND', label: '⚠️ Peak Demand' },
  ];

  return (
    <div className="dispatch-page">

      {/* 2. HERO SECTION */}
      <div className="d-container" style={{ paddingTop: 0 }}>
        <div className="d-hero">
          <div className="d-hero-titles">
            <h1>SMART RENEWABLE ENERGY CONTROL CENTER</h1>
            <p>AI-Ready Dynamic Load Distribution & Renewable Energy Optimization</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="d-status-badge">
              <span className="d-pulse"></span> {data.grid_import > 0 ? 'GRID IMPORTING' : 'GRID STABLE'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>LIVE • Updated instantly</div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', textAlign: 'left' }}>
              <div>TOTAL RENEWABLE: <strong className="text-cyan">{data.total_renewable.toFixed(0)} kW</strong></div>
              <div>CURRENT LOAD:    <strong>{data.total_demand.toFixed(0)} kW</strong></div>
              <div>BATTERY SOC:     <strong>{data.battery_soc.toFixed(0)}%</strong></div>
              <div>RENEWABLE SHARE: <strong className="text-green">{data.renewable_share.toFixed(0)}%</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4. LIVE ENERGY FLOW & SOURCE NODES */}
      <div className="d-container">
        <h2 className="d-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>LIVE ENERGY FLOW NETWORK</span>
          <div className="scenario-bar" style={{ margin: 0 }}>
            {scenarios.map(sc => (
              <button
                key={sc.id}
                className={`scenario-btn ${activeScenario === sc.id ? 'active' : ''}`}
                onClick={() => setActiveScenario(sc.id)}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </h2>

        <div className="flow-network-container" ref={containerRef} style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          {/* SVG Canvas */}
          <svg className="flow-svg-overlay">
            <FlowConnection sourceRef={solRef} targetRef={hubRef} containerRef={containerRef} power={data.solar_generation / 50} color="#fbbf24" />
            <FlowConnection sourceRef={winRef} targetRef={hubRef} containerRef={containerRef} power={data.wind_generation / 50} color="#22d3ee" />
            <FlowConnection sourceRef={hydRef} targetRef={hubRef} containerRef={containerRef} power={data.hydro_generation / 50} color="#38bdf8" />

            <FlowConnection sourceRef={hubRef} targetRef={loadRef} containerRef={containerRef} power={data.domestic_supplied / 50} color="#83f28f" />

            <FlowConnection
              sourceRef={hubRef}
              targetRef={batRef}
              containerRef={containerRef}
              power={data.battery_power / 50}
              color="#a78bfa"
            />

            <FlowConnection
              sourceRef={hubRef}
              targetRef={gridRef}
              containerRef={containerRef}
              power={(data.grid_import > 0 ? -data.grid_import : data.grid_export) / 50}
              color="#94a3b8"
            />
          </svg>

          {/* Left Column: Generation Sources */}
          <div className="flow-col">
            <div className="flow-node" ref={solRef} style={{ borderColor: '#fbbf24' }}>
              <div className="fn-title">☀️ SOLAR FARM</div>
              <div className="fn-value" style={{ color: '#fbbf24' }}>{data.solar_generation.toFixed(0)} kW</div>
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#94a3b8' }}>Capacity: 800 kW</div>
            </div>

            <div className="flow-node" ref={winRef} style={{ borderColor: '#22d3ee' }}>
              <div className="fn-title">🌬️ WIND FARM</div>
              <div className="fn-value" style={{ color: '#22d3ee' }}>{data.wind_generation.toFixed(0)} kW</div>
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#94a3b8' }}>Capacity: 600 kW</div>
            </div>

            <div className="flow-node" ref={hydRef} style={{ borderColor: '#38bdf8' }}>
              <div className="fn-title">💧 HYDRO PLANT</div>
              <div className="fn-value" style={{ color: '#38bdf8' }}>{data.hydro_generation.toFixed(0)} kW</div>
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#94a3b8' }}>Capacity: 500 kW</div>
            </div>
          </div>

          {/* Center: The Dispatch Hub */}
          <div className="hub-node" ref={hubRef}>
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>ENERGY HUB</h3>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8' }}>{data.total_renewable.toFixed(0)} <span style={{ fontSize: '1rem' }}>kW</span></div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Dynamic Routing Active</div>
          </div>

          {/* Right Column: Sinks / Loads */}
          <div className="flow-col">
            <div className="flow-node" ref={loadRef} style={{ borderColor: '#83f28f' }}>
              <div className="fn-title">🏭 DOMESTIC LOAD</div>
              <div className="fn-value" style={{ color: '#83f28f' }}>
                {data.domestic_supplied.toFixed(0)} kW
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#94a3b8' }}>
                {data.domestic_deficit > 0 ? (
                  <span style={{ color: '#ef4444' }}>Deficit: {data.domestic_deficit.toFixed(0)} kW</span>
                ) : (
                  `${data.total_demand} kW max demand`
                )}
              </div>
            </div>

            <div className="flow-node" ref={batRef} style={{ borderColor: '#a78bfa' }}>
              <div className="fn-title">🔋 BATTERY</div>
              <div className="fn-value" style={{ color: '#a78bfa' }}>
                {data.battery_power === 0 ? 'IDLE' : `${Math.abs(data.battery_power).toFixed(0)} kW`}
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#94a3b8' }}>
                SOC: {data.battery_soc.toFixed(0)}% | {data.battery_power > 0 ? 'Charging' : (data.battery_power < 0 ? 'Discharging' : (data.battery_soc >= 100 ? 'Full' : 'Standby'))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Capacity: 500 kW</div>
            </div>

            <div className="flow-node" ref={gridRef} style={{ borderColor: '#94a3b8' }}>
              <div className="fn-title">⚡ NAT. GRID</div>
              <div className="fn-value" style={{ color: '#e2e8f0', fontSize: '1.2rem', lineHeight: '1.2', marginTop: '8px' }}>
                {data.grid_import > 0 ? (
                  <span style={{ color: '#ef4444' }}>IMPORTING<br/>{data.grid_import.toFixed(0)} kW</span>
                ) : (
                  data.grid_export > 0 ? (
                    <span style={{ color: '#38bdf8' }}>EXPORTING<br/>{data.grid_export.toFixed(0)} kW</span>
                  ) : (
                    'IDLE'
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5, 6, 11, 12. DISPATCH DECISIONS & PRIORITY */}
      <div className="d-container">
        <div className="d-grid-2">

          {/* Smart Dispatch Engine Explanation */}
          <div className="d-card">
            <h3 className="d-title">SMART DISPATCH ENGINE</h3>
            <div className="d-subtitle" style={{ marginBottom: '16px' }}>Why did the system make this decision?</div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #38bdf8', marginBottom: '24px' }}>
              <strong>CURRENT DECISION:</strong>
              <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{data.decision_reason}</p>
            </div>

            <div className="d-subtitle" style={{ marginBottom: '12px' }}>CURRENT SOURCE PRIORITY (LIVE)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data.source_ranks.map((src, i) => (
                <div key={src.name} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {src.name}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div>{src.generation.toFixed(0)} kW</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Capacity: {src.avail.toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Power Flow Summary */}
          <div className="d-card">
            <h3 className="d-title">POWER FLOW SUMMARY</h3>
            <div className="d-subtitle" style={{ marginBottom: '16px' }}>Live Allocation</div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <strong>Total Generation</strong>
              <span className="text-cyan">{data.total_renewable.toFixed(0)} kW</span>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '4px solid #83f28f' }}>
              <strong>Domestic Load</strong>
              <span>{data.domestic_supplied.toFixed(0)} kW</span>
            </div>

            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '4px solid #a78bfa' }}>
              <strong>Battery Allocation</strong>
              <span>{data.battery_power.toFixed(0)} kW</span>
            </div>

            {data.grid_import > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '4px solid #ef4444' }}>
                <strong style={{ color: '#ef4444' }}>Grid Import</strong>
                <span style={{ color: '#ef4444' }}>{data.grid_import.toFixed(0)} kW</span>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderLeft: '4px solid #38bdf8' }}>
                <strong style={{ color: '#38bdf8' }}>Grid Export</strong>
                <span style={{ color: '#38bdf8' }}>{data.grid_export.toFixed(0)} kW</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 16 & 18 & 19. TIMELINE & SCHEDULING */}
      <div className="d-container">
        <h2 className="d-title">24-HOUR ENERGY OPTIMIZATION</h2>

        <div className="d-grid-3">
          <div className="d-card" style={{ gridColumn: 'span 2' }}>
            <div className="d-subtitle" style={{ marginBottom: '16px' }}>Dynamic Energy Flow Timeline</div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline24h} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="Solar" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Wind" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Hydro" stackId="1" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Battery" stackId="1" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="d-card">
            <div className="d-subtitle" style={{ marginBottom: '16px' }}>Flexible Load Scheduler</div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700 }}>🚗 EV Charging Fleet</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Best Time: <strong>12:00 – 15:00</strong></div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reason: Peak Solar availability</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700 }}>🚰 Agricultural Water Pumps</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Best Time: <strong>02:00 – 06:00</strong></div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reason: High Wind availability, low demand</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 700 }}>🏭 Non-Critical Industrial</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Best Time: <strong>18:00 – 21:00</strong></div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Reason: Hydro ramp-up period</div>
            </div>
          </div>
        </div>
      </div>

      {/* 22 & 25. SYSTEM HEALTH & SIH FINAL MESSAGE */}
      {/* 22 & 25. SYSTEM HEALTH & SIH FINAL MESSAGE */}
      <div className="d-container">
        <div className="d-grid-2">

          <div className="d-card">
            <h3 className="d-title">ENVIRONMENTAL & HEALTH IMPACT</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#83f28f' }}>{data.system_health}%</div>
                <div className="d-subtitle">OVERALL SYSTEM HEALTH</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8' }}>{data.renewable_share.toFixed(0)}%</div>
                <div className="d-subtitle">RENEWABLE UTILIZATION</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>ESTIMATED CO₂ AVOIDED</div>
              <div style={{ fontSize: '1.5rem', color: '#83f28f', fontWeight: 900 }}>8.4 tons/day</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>*Calculated values based on simulated parameters</div>
            </div>
          </div>

          <div className="d-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.9))' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '16px', lineHeight: '1.4' }}>
              "Use the renewable source when it is most available — shift flexible demand instead of wasting energy."
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>☀️ Solar</strong> when sunlight is abundant.</li>
              <li><strong>🌬️ Wind</strong> when wind availability is high.</li>
              <li><strong>💧 Hydro</strong> when water availability is favorable.</li>
              <li><strong>🔋 Battery</strong> when supply and demand are mismatched.</li>
              <li><strong>⚡ Grid</strong> only when additional support is required.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* MANUAL OVERRIDE CONTROLS (SLIDERS) */}
      <div className="d-container" style={{ paddingBottom: '80px', marginTop: '40px' }}>
        <h2 className="d-title">MANUAL OVERRIDE CONTROLS</h2>
        <div className="d-grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          
          <div className="d-card">
            <h3 style={{ color: '#fbbf24', marginBottom: '16px' }}>☀️ SOLAR FARM</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Production: {data.solar_generation.toFixed(0)} kW</span>
              <span>Capacity: 800 kW</span>
            </div>
            <input type="range" min="0" max="100" value={solarPercent} onChange={(e) => { setSolarPercent(Number(e.target.value)); setActiveScenario(''); }} style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }} />
            <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{solarPercent}%</div>
          </div>

          <div className="d-card">
            <h3 style={{ color: '#22d3ee', marginBottom: '16px' }}>🌬️ WIND FARM</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Production: {data.wind_generation.toFixed(0)} kW</span>
              <span>Capacity: 600 kW</span>
            </div>
            <input type="range" min="0" max="100" value={windPercent} onChange={(e) => { setWindPercent(Number(e.target.value)); setActiveScenario(''); }} style={{ width: '100%', accentColor: '#22d3ee', cursor: 'pointer' }} />
            <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{windPercent}%</div>
          </div>

          <div className="d-card">
            <h3 style={{ color: '#38bdf8', marginBottom: '16px' }}>💧 HYDRO PLANT</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Production: {data.hydro_generation.toFixed(0)} kW</span>
              <span>Capacity: 500 kW</span>
            </div>
            <input type="range" min="0" max="100" value={hydroPercent} onChange={(e) => { setHydroPercent(Number(e.target.value)); setActiveScenario(''); }} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
            <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{hydroPercent}%</div>
          </div>

          <div className="d-card">
            <h3 style={{ color: '#a78bfa', marginBottom: '16px' }}>🔋 BATTERY SOC</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Current Charge</span>
              <span>Max: 100%</span>
            </div>
            <input type="range" min="0" max="100" value={batterySoc} onChange={(e) => { setBatterySoc(Number(e.target.value)); setActiveScenario(''); }} style={{ width: '100%', accentColor: '#a78bfa', cursor: 'pointer' }} />
            <div style={{ textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem', marginTop: '4px' }}>{batterySoc}%</div>
          </div>

        </div>
      </div>

    </div>
  );
}

