import { useEnergy, HUBS, getHubGeneration } from '../store/EnergyContext';
import './HubDetailsModal.css';

export default function HubDetailsModal({ isOpen, onClose, hubId }) {
  const { state } = useEnergy();

  if (!isOpen || !hubId || !state.hubs[hubId]) return null;

  const hubDef = HUBS[hubId];
  const hub = state.hubs[hubId];
  const hubGen = getHubGeneration(state, hubId);
  const totalCapacity = hub.batteries.reduce((s, b) => s + b.capacity, 0);
  const totalStored = hub.batteries.reduce((s, b) => s + b.stored, 0);
  const aggPercent = totalCapacity > 0 ? (totalStored / totalCapacity) * 100 : 0;
  
  // Calculate local consumption (demo logic: proportion of total consumption based on hub capacity)
  const totalPlantCap = Object.values(state.sources).reduce((s, v) => s + v.capacity, 0);
  const hubPlantCap = hubDef.sources.reduce((s, sk) => s + state.sources[sk].capacity, 0);
  const localConsumption = state.consumption * (hubPlantCap / totalPlantCap);
  
  // Calculate grid export (demo logic)
  const gridExport = Math.max(0, hubGen - localConsumption);

  // Overall hub health
  const avgBatHealth = hub.batteries.reduce((s, b) => s + b.health, 0) / hub.batteries.length;
  const hubHealth = Math.round(avgBatHealth); // simplistic demo logic

  // Battery status
  const isCharging = hub.batteries.some(b => b.status === 'charging');
  const isDischarging = hub.batteries.some(b => b.status === 'discharging');
  const hubBatStatus = isCharging ? 'Charging' : isDischarging ? 'Discharging' : 'Standby';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content hub-modal" onClick={e => e.stopPropagation()} style={{ borderTop: `4px solid ${hubDef.color}` }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="modal-header">
          <h2>Energy {hubDef.name} ({hubDef.shortName})</h2>
          <span className="badge-online">GRID ONLINE</span>
        </div>

        <div className="modal-body">
          <div className="hub-stats-grid">
            
            <div className="hub-stat-card">
              <span className="h-stat-label">Power Input</span>
              <span className="h-stat-val" style={{ color: hubDef.color }}>{hubGen.toFixed(0)} kW</span>
            </div>
            
            <div className="hub-stat-card">
              <span className="h-stat-label">Local Consumption</span>
              <span className="h-stat-val text-orange">{localConsumption.toFixed(0)} kW</span>
            </div>

            <div className="hub-stat-card">
              <span className="h-stat-label">Grid Export</span>
              <span className="h-stat-val text-blue">{gridExport.toFixed(0)} kW</span>
            </div>

            <div className="hub-stat-card">
              <span className="h-stat-label">System Health</span>
              <span className="h-stat-val text-green">{hubHealth}%</span>
            </div>

          </div>

          <div className="hub-modal-section">
            <h3>Connected Sources</h3>
            <ul className="hub-source-list">
              {hubDef.sources.map(sk => {
                const src = state.sources[sk];
                return (
                  <li key={sk}>
                    <span className="h-src-name">{src.label || sk}</span>
                    <span className="h-src-val">{src.generation.toFixed(0)} kW</span>
                    <span className="h-src-status" style={{ color: src.maintenanceStatus === 'Normal' ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                      {src.maintenanceStatus}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="hub-modal-section">
            <h3>Battery Storage ({hubBatStatus})</h3>
            <div className="hub-bat-summary">
              <div className="h-bat-bar-wrap">
                <div className="h-bat-bar">
                  <div className="h-bat-fill" style={{ width: `${aggPercent}%`, background: aggPercent < 20 ? 'var(--accent-red)' : 'var(--accent-green)' }} />
                </div>
              </div>
              <div className="h-bat-text">
                <strong>{totalStored.toFixed(0)} / {totalCapacity} kWh</strong>
                <span>({aggPercent.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

