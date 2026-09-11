import { useEnergy, getTotalGeneration, getSurplus } from '../store/EnergyContext';
import './Analytics.css';

export default function Analytics() {
  const { state } = useEnergy();
  const totalGen = getTotalGeneration(state);
  const surplus = getSurplus(state);
  
  // 1. Renewable Contribution (Percentage)
  const sourcesData = Object.entries(state.sources).map(([key, src]) => ({
    key,
    label: src.label,
    gen: src.generation,
    pct: totalGen > 0 ? (src.generation / totalGen) * 100 : 0,
    color: src.color || '#ccc'
  })).sort((a, b) => b.gen - a.gen);

  // 2. Energy Distribution Flow
  const totalStored = Object.values(state.hubs).reduce((s, hub) => 
    s + hub.batteries.reduce((sb, b) => sb + (b.status === 'charging' ? (Math.min(b.capacity - b.stored, b.rate)) : 0), 0)
  , 0);
  
  const gridExport = Math.max(0, surplus - totalStored);
  
  return (
    <section className="section" id="analytics">
      <div className="section-header">
        <h1>Analytics & Reporting</h1>
      </div>
      
      <div className="analytics-grid">
        
        {/* Renewable Contribution */}
        <div className="card">
          <div className="card-header">
            <h2>Renewable Contribution</h2>
          </div>
          <div className="card-body">
            <div className="contrib-bars">
              {sourcesData.map(src => (
                <div className="contrib-row" key={src.key}>
                  <div className="contrib-label-row">
                    <span className="contrib-name">{src.label}</span>
                    <span className="contrib-val">{src.pct.toFixed(1)}%</span>
                  </div>
                  <div className="contrib-track">
                    <div 
                      className="contrib-fill" 
                      style={{ width: `${src.pct}%`, background: src.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Energy Distribution */}
        <div className="card">
          <div className="card-header">
            <h2>Live Energy Distribution</h2>
          </div>
          <div className="card-body">
            <div className="dist-flow">
              <div className="dist-node gen-node">
                <span className="dist-val">{totalGen.toFixed(0)} kW</span>
                <span className="dist-label">Total Generation</span>
              </div>
              <div className="dist-arrows">
                <span className="dist-arrow">↘</span>
                <span className="dist-arrow">→</span>
                <span className="dist-arrow">↗</span>
              </div>
              <div className="dist-targets">
                <div className="dist-node target-node">
                  <span className="dist-val">{totalStored.toFixed(0)} kW</span>
                  <span className="dist-label">Battery Storage (Charging)</span>
                </div>
                <div className="dist-node target-node">
                  <span className="dist-val">{state.consumption.toFixed(0)} kW</span>
                  <span className="dist-label">Local Consumption</span>
                </div>
                <div className="dist-node target-node">
                  <span className="dist-val text-blue">{gridExport.toFixed(0)} kW</span>
                  <span className="dist-label">Grid Export</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
