import { useState, useRef, useEffect } from 'react';
import { useEnergy, formatTime, calculateSolarIntensity } from '../store/EnergyContext';
import './SolarSimulationPanel.css';

export default function SolarSimulationPanel() {
  const { state, dispatch } = useEnergy();
  const sim = state.solarSimulation;
  const svgRef = useRef(null);
  
  const [hoverSlot, setHoverSlot] = useState(null);
  const [svgWidth, setSvgWidth] = useState(0);

  useEffect(() => {
    if (!svgRef.current) return;
    const obs = new ResizeObserver(entries => {
      setSvgWidth(entries[0].contentRect.width);
    });
    obs.observe(svgRef.current);
    return () => obs.disconnect();
  }, []);

  // Pre-calculate the 288 points for the curve
  const points = [];
  const TOTAL_SLOTS = 288;
  const HEIGHT = 150;
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const intensity = calculateSolarIntensity(i, sim.cloudFactor, sim.maxIntensity, sim.sunrise, sim.sunset);
    points.push(intensity);
  }

  // Construct SVG path
  let pathD = `M 0,${HEIGHT}`;
  points.forEach((val, i) => {
    const x = (i / (TOTAL_SLOTS - 1)) * 100;
    const y = HEIGHT - (val / sim.maxIntensity) * HEIGHT;
    pathD += ` L ${x},${y}`;
  });
  pathD += ` L 100,${HEIGHT} Z`;

  const getStatus = (intensity) => {
    if (intensity === 0) return { label: 'NIGHT', class: 'night' };
    if (intensity <= 250) return { label: 'LOW', class: 'low' };
    if (intensity <= 600) return { label: 'MEDIUM', class: 'medium' };
    if (intensity <= 850) return { label: 'HIGH', class: 'high' };
    return { label: 'PEAK', class: 'peak' };
  };

  const status = getStatus(sim.intensity);
  const solarGen = state.sources.solar.generation;

  const handleMouseMove = (e) => {
    if (!svgRef.current || svgWidth === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const slot = Math.round(pct * (TOTAL_SLOTS - 1));
    setHoverSlot(slot);
  };

  const handleMouseLeave = () => setHoverSlot(null);

  const renderTooltip = () => {
    if (hoverSlot === null) return null;
    const intensity = calculateSolarIntensity(hoverSlot, sim.cloudFactor, sim.maxIntensity, sim.sunrise, sim.sunset);
    const gen = 800 * (intensity / sim.maxIntensity); // using maxCapacity 800
    const x = (hoverSlot / (TOTAL_SLOTS - 1)) * 100;
    const y = HEIGHT - (intensity / sim.maxIntensity) * HEIGHT;

    return (
      <div className="sim-tooltip" style={{ left: `${x}%`, top: `${y}px` }}>
        <div className="st-row">
          <span className="st-label">TIME</span>
          <span className="st-val">{formatTime(hoverSlot)}</span>
        </div>
        <div className="st-row">
          <span className="st-label">INTENSITY</span>
          <span className="st-val">{intensity.toFixed(0)} W/m²</span>
        </div>
        <div className="st-row">
          <span className="st-label">GENERATION</span>
          <span className="st-val">{gen.toFixed(0)} kW</span>
        </div>
      </div>
    );
  };

  const currentX = (sim.currentSlot / (TOTAL_SLOTS - 1)) * 100;
  const currentY = HEIGHT - (sim.intensity / sim.maxIntensity) * HEIGHT;

  return (
    <div className="solar-sim-panel">
      <div className="sim-header">
        <div className="sim-title">
          <h2>24-Hour Solar Generation Simulation</h2>
          <span className="sim-badge">🟢 SIMULATION MODE</span>
        </div>
        <div className="sim-controls">
          <button 
            className={`sim-btn ${sim.isPlaying ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_SOLAR_SIMULATION' })}
          >
            {sim.isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button 
            className="sim-btn"
            onClick={() => dispatch({ type: 'RESET_SOLAR_SIMULATION' })}
          >
            ⏮ RESET
          </button>
          <select 
            className="sim-select" 
            value={sim.cloudFactor} 
            onChange={(e) => dispatch({ type: 'SET_CLOUD_FACTOR', payload: Number(e.target.value) })}
          >
            <option value={1.0}>☀️ Clear Day</option>
            <option value={0.7}>⛅ Cloudy Day</option>
            <option value={0.4}>☁️ Overcast Day</option>
          </select>
        </div>
      </div>

      <div className="sim-info-bar">
        <div className="sim-info-card">
          <span className="si-label">☀️ Current Time</span>
          <span className="si-val">{formatTime(sim.currentSlot)}</span>
        </div>
        <div className="sim-info-card">
          <span className="si-label">Solar Intensity</span>
          <span className="si-val">{sim.intensity.toFixed(0)} W/m²</span>
          <span className={`si-status ${status.class}`}>{status.label} INTENSITY</span>
        </div>
        <div className="sim-info-card">
          <span className="si-label">⚡ Solar Generation</span>
          <span className="si-val" style={{ color: 'var(--accent-green)' }}>{solarGen.toFixed(0)} kW</span>
        </div>
      </div>

      <div 
        className="sim-graph-container" 
        ref={svgRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {renderTooltip()}
        <svg 
          className="sim-svg" 
          viewBox={`0 0 100 ${HEIGHT}`} 
          preserveAspectRatio="none"
        >
          <path d={pathD} className="sim-curve" vectorEffect="non-scaling-stroke" />
          
          <line 
            x1={currentX} y1="0" 
            x2={currentX} y2={HEIGHT} 
            className="sim-indicator-line" 
            vectorEffect="non-scaling-stroke" 
          />
        </svg>
        
        <div 
          className="sim-indicator-dot-html" 
          style={{ left: `${currentX}%`, top: `${currentY}px` }}
        />
        
        {/* Labels */}
        <span className="sim-axis-label" style={{ left: '0%' }}>00:00</span>
        <span className="sim-axis-label" style={{ left: '25%' }}>06:00</span>
        <span className="sim-axis-label" style={{ left: '50%' }}>12:00</span>
        <span className="sim-axis-label" style={{ left: '75%' }}>18:00</span>
        <span className="sim-axis-label" style={{ left: '100%' }}>24:00</span>
      </div>
    </div>
  );
}

