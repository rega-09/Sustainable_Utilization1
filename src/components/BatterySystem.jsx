import { useEnergy, HUBS, getHubGeneration } from '../store/EnergyContext';
import './BatterySystem.css';

export default function BatterySystem() {
  const { state, dispatch } = useEnergy();
  const hubEntries = Object.entries(HUBS);

  const renderBatteryRow = (bat) => {
    const percent = bat.capacity > 0 ? (bat.stored / bat.capacity) * 100 : 0;
    
    let statusClass = 'bat-status-idle';
    if (bat.status === 'charging') statusClass = 'bat-status-charging';
    if (bat.status === 'discharging') statusClass = 'bat-status-discharging';
    if (bat.status === 'standby') statusClass = 'bat-status-standby';

    let levelColor = 'var(--accent-green)';
    if (percent < 20) levelColor = 'var(--accent-red)';
    else if (percent < 50) levelColor = 'var(--accent-orange)';

    return (
      <div className="bat-row" key={bat.id}>
        <div className="bat-row-id">
          <div className="bat-icon">🔋</div>
          <div>
            <strong>Battery {bat.id}</strong>
            <div className={`bat-status-badge ${statusClass}`}>{bat.status}</div>
          </div>
        </div>
        
        <div className="bat-row-bar-wrap">
          <div className="bat-row-bar">
            <div 
              className="bat-row-fill" 
              style={{ width: `${percent}%`, background: levelColor }} 
            />
          </div>
          <div className="bat-row-pct">{percent.toFixed(0)}%</div>
        </div>

        <div className="bat-row-stats">
          <span>{bat.stored.toFixed(0)} / {bat.capacity} kWh</span>
          <span className="bat-row-health" title="Health">H: {bat.health}%</span>
          <span className="bat-row-temp" title="Temperature">T: {bat.temperature}°C</span>
        </div>
      </div>
    );
  };

  return (
    <section className="section" id="battery">
      <div className="section-header">
        <h1>Battery Storage System</h1>
        <span className="card-subtitle">Decentralized storage across {hubEntries.length} regional hubs</span>
      </div>

      <div className="battery-hub-grid">
        {hubEntries.map(([hubId, hubDef]) => {
          const hub = state.hubs[hubId];
          const hubGen = getHubGeneration(state, hubId);
          const totalCapacity = hub.batteries.reduce((s, b) => s + b.capacity, 0);
          const totalStored = hub.batteries.reduce((s, b) => s + b.stored, 0);
          const aggPercent = totalCapacity > 0 ? (totalStored / totalCapacity) * 100 : 0;

          return (
            <div className="card battery-hub-card" key={hubId}>
              <div className="card-header bat-hub-header">
                <div>
                  <h2>{hubDef.name}</h2>
                  <span className="card-subtitle">Input: {hubGen.toFixed(0)} kW | Storage: {totalStored.toFixed(0)} / {totalCapacity} kWh</span>
                </div>
                <div className="bat-agg-circle" style={{ borderColor: aggPercent > 50 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                  {aggPercent.toFixed(0)}%
                </div>
              </div>
              
              <div className="card-body">
                <div className="bat-list">
                  {hub.batteries.map(renderBatteryRow)}
                </div>

                <div className="battery-controls mt-3">
                  <div className="bat-actions">
                    <button className="btn btn-charge" onClick={() => dispatch({ type: 'HUB_CHARGE', payload: hubId })}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                      Charge Hub
                    </button>
                    <button className="btn btn-discharge" onClick={() => dispatch({ type: 'HUB_DISCHARGE', payload: hubId })}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
                      Discharge Hub
                    </button>
                    <button className="btn btn-stop" onClick={() => dispatch({ type: 'HUB_STOP', payload: hubId })}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="12" height="12"/></svg>
                      Standby
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

