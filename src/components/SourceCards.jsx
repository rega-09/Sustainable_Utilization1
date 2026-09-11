import { useState } from 'react';
import { useEnergy, SOURCES, getCO2Saved, getEfficiency } from '../store/EnergyContext';
import './SourceCards.css';
import SolarSimulationPanel from './SolarSimulationPanel';

const SOURCE_SVGS = {
  solar: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  wind: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>,
  tidal: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/><path d="M2 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0"/></svg>,
  hydro: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  biomass: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c4-4 8-7.5 8-12a8 8 0 1 0-16 0c0 4.5 4 8 8 12z"/><path d="M12 12V8"/><path d="M9 15c1-2 3-3 3-5"/></svg>,
  geothermal: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c-4 0-8-3-8-8 0-3 2-6 4-8l2 3c1-2 2-4 2-7 0 3 1 5 2 7l2-3c2 2 4 5 4 8 0 5-4 8-8 8z"/></svg>,
};

/* Editable value component */
function EditableValue({ value, max, onChange, unit = 'kW' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(Math.round(value).toString());
    setEditing(true);
  };

  const commit = () => {
    const num = parseFloat(draft);
    if (!isNaN(num) && num >= 0 && num <= max) {
      onChange(num);
    }
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <div className="editable-active">
        <input
          type="number"
          className="editable-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKey}
          autoFocus
          min="0"
          max={max}
        />
        <span className="editable-unit">{unit}</span>
      </div>
    );
  }

  return (
    <span className="editable-value" onClick={startEdit} title="Click to edit">
      {Math.round(value)} {unit}
      <svg className="edit-pencil" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </span>
  );
}

export default function SourceCards({ onOpenModal }) {
  const { state, dispatch } = useEnergy();

  const handleGenChange = (source, value) => {
    dispatch({ type: 'UPDATE_SOURCE', payload: { source, generation: value } });
  };

  return (
    <section className="section" id="sources">
      <div className="section-header">
        <h1>Energy Sources</h1>
        <div className="section-actions">
          <span className="section-hint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Click any generation value to edit
          </span>
          <button className="btn btn-primary" onClick={onOpenModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Generation
          </button>
        </div>
      </div>
      <div className="sources-grid">
        {Object.entries(state.sources).map(([key, src]) => {
          const meta = SOURCES[key];
          const eff = getEfficiency(src.generation, src.capacity);
          const co2 = getCO2Saved(key, src.generation);
          const barPct = (src.generation / src.capacity) * 100;

          return (
            <div className="source-card" key={key}>
              <div className="source-header">
                <div className={`source-icon ${key}-icon`}>
                  {SOURCE_SVGS[key]}
                </div>
                <div>
                  <h3>{meta.label}</h3>
                  <span className="source-status online">Online</span>
                  {key === 'solar' && state.solarSimulation.isPlaying && (
                    <span className="sim-mode-indicator" style={{ marginLeft: '8px', fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: '800' }}>[SIMULATION]</span>
                  )}
                </div>
              </div>

              {/* Generation slider — primary edit control */}
              <div className="source-gen-control">
                <div className="source-gen-header">
                  <span className="stat-label">Generation</span>
                  <EditableValue
                    value={src.generation}
                    max={src.capacity}
                    onChange={(v) => handleGenChange(key, v)}
                  />
                </div>
                <input
                  type="range"
                  className={`source-slider ${key}-slider`}
                  min="0"
                  max={src.capacity}
                  value={Math.round(src.generation)}
                  onChange={e => handleGenChange(key, Number(e.target.value))}
                  disabled={key === 'solar' && state.solarSimulation.isPlaying}
                />
                <div className="source-slider-labels">
                  <span>0 kW</span>
                  <span>{src.capacity} kW</span>
                </div>
              </div>

              <div className="source-stats">
                <div className="source-stat">
                  <span className="stat-label">Capacity</span>
                  <span className="stat-value">{src.capacity} kW</span>
                </div>
                <div className="source-stat">
                  <span className="stat-label">Efficiency</span>
                  <span className="stat-value">{eff}%</span>
                </div>
                <div className="source-stat">
                  <span className="stat-label">CO₂ Saved</span>
                  <span className="stat-value">{co2} kg</span>
                </div>
                <div className="source-stat">
                  <span className="stat-label">Output</span>
                  <span className={`stat-value ${barPct > 80 ? 'stat-high' : barPct > 50 ? 'stat-mid' : 'stat-low'}`}>
                    {barPct.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="source-bar">
                <div
                  className={`source-bar-fill ${key}-bar`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <SolarSimulationPanel />
    </section>
  );
}
