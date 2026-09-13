import { useState } from 'react';
import { useEnergy, getTotalGeneration, getSurplus } from '../store/EnergyContext';
import './NationalGrid.css';

export default function NationalGrid() {
  const { state, dispatch } = useEnergy();
  const totalGen = getTotalGeneration(state);
  const surplus = getSurplus(state);
  const maxCapacity = 2500;

  const genPct = Math.min((totalGen / maxCapacity) * 100, 100);
  const conPct = Math.min((state.consumption / maxCapacity) * 100, 100);

  const circumference = 2 * Math.PI * 54;
  const genOffset = circumference - (circumference * genPct / 100);
  const conOffset = circumference - (circumference * conPct / 100);

  let transferArrow = '⇌';
  let transferText = 'Balanced';
  let transferClass = 'balanced';

  if (surplus > 50) {
    transferArrow = '→';
    transferText = 'Surplus → Battery / Export';
    transferClass = 'surplus';
  } else if (surplus < -50) {
    transferArrow = '←';
    transferText = 'Deficit ← Battery / Import';
    transferClass = 'deficit';
  }

  /* ── Consumption direct input ── */
  const [conEdit, setConEdit] = useState(false);
  const [conDraft, setConDraft] = useState('');

  const startConEdit = () => {
    setConDraft(state.consumption.toString());
    setConEdit(true);
  };
  const commitConEdit = () => {
    const n = parseInt(conDraft, 10);
    if (!isNaN(n) && n >= 0 && n <= 5000) {
      dispatch({ type: 'SET_CONSUMPTION', payload: n });
    }
    setConEdit(false);
  };

  return (
    <section className="section" id="grid">
      <div className="section-header">
        <h1>National Grid</h1>
        <div className="grid-freq">
          <span className="freq-label">Grid Frequency</span>
          <span className="freq-value">{state.gridFrequency.toFixed(0)} Hz</span>
        </div>
      </div>

      <div className="grid-layout">
        <div className="card grid-overview-card">
          <div className="card-header"><h2>Grid Status</h2></div>
          <div className="card-body">
            <div className="grid-meters">
              <div className="grid-meter">
                <div className="meter-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" className="meter-bg"/>
                    <circle cx="60" cy="60" r="54" className="meter-fill gen-fill"
                      style={{ strokeDasharray: circumference, strokeDashoffset: genOffset }}/>
                  </svg>
                  <div className="meter-center">
                    <span className="meter-value">{totalGen.toFixed(0)}</span>
                    <span className="meter-unit">kW</span>
                  </div>
                </div>
                <span className="meter-label">Generation</span>
              </div>
              <div className="grid-meter">
                <div className="meter-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" className="meter-bg"/>
                    <circle cx="60" cy="60" r="54" className="meter-fill con-fill"
                      style={{ strokeDasharray: circumference, strokeDashoffset: conOffset }}/>
                  </svg>
                  <div className="meter-center">
                    <span className="meter-value">{state.consumption}</span>
                    <span className="meter-unit">kW</span>
                  </div>
                </div>
                <span className="meter-label">Consumption</span>
              </div>
            </div>

            <div className="grid-transfer">
              <h3>Transfer Direction</h3>
              <div className={`transfer-indicator ${transferClass}`}>
                <div className="transfer-arrow">{transferArrow}</div>
                <div className="transfer-text">{transferText}</div>
                <div className="transfer-value">{Math.abs(surplus).toFixed(0)} kW</div>
              </div>
              <div className="transfer-actions">
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'SEND_SURPLUS_TO_GRID' })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Send to Grid
                </button>
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'SEND_SURPLUS_TO_BATTERY' })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="18" height="12" rx="2"/><path d="M22 10v4"/></svg>
                  Store in Battery
                </button>
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'AUTO_BALANCE' })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  Auto Balance
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card grid-demand-card">
          <div className="card-header"><h2>Regional Demand</h2></div>
          <div className="card-body">
            <div className="demand-list">
              {state.regions.map((region, i) => (
                <div className="demand-item" key={i}>
                  <span className="demand-region">{region.name}</span>
                  <div className="demand-bar-wrap">
                    <div className="demand-bar" style={{ width: `${(region.demand / 400) * 100}%` }}/>
                  </div>
                  <span className="demand-val">{region.demand} kW</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card grid-consumption-card">
          <div className="card-header">
            <h2>Set Consumption</h2>
            <span className="card-subtitle">Adjust grid demand</span>
          </div>
          <div className="card-body">
            <div className="consumption-control">
              <label>Total Grid Consumption (kW)</label>
              <div className="consumption-input-wrap">
                <input
                  type="range"
                  min="200"
                  max="2500"
                  value={state.consumption}
                  onChange={e => dispatch({ type: 'SET_CONSUMPTION', payload: Number(e.target.value) })}
                  className="consumption-slider"
                />
                {conEdit ? (
                  <div className="con-edit-wrap">
                    <input
                      type="number"
                      className="con-direct-input"
                      value={conDraft}
                      onChange={e => setConDraft(e.target.value)}
                      onBlur={commitConEdit}
                      onKeyDown={e => { if (e.key === 'Enter') commitConEdit(); if (e.key === 'Escape') setConEdit(false); }}
                      autoFocus
                      min="0" max="5000"
                    />
                    <span className="con-edit-unit">kW</span>
                  </div>
                ) : (
                  <span className="consumption-val" onClick={startConEdit} title="Click to type a value">
                    {state.consumption} kW
                    <svg className="edit-icon-sm" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </span>
                )}
              </div>
              <div className="consumption-presets">
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'SET_CONSUMPTION', payload: 800 })}>🌙 Low</button>
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'SET_CONSUMPTION', payload: 1200 })}>☀️ Normal</button>
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'SET_CONSUMPTION', payload: 1800 })}>🔥 Peak</button>
                <button className="btn btn-outline" onClick={() => dispatch({ type: 'SET_CONSUMPTION', payload: 2200 })}>⚠️ Critical</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

