import { useEnergy, getTotalGeneration, getSurplus, SOURCES, HUBS, getHubGeneration } from '../store/EnergyContext';
import { useState, useRef, useEffect, useCallback } from 'react';
import './EnergyHubFlow.css';

export default function EnergyHubFlow({ onHubClick }) {
  const { state } = useEnergy();
  const totalGen = getTotalGeneration(state);
  const surplus = getSurplus(state);

  const powerPlantGen = Math.max(0, state.consumption - totalGen);
  const actualTotalGen = totalGen + powerPlantGen;

  let statusText = 'System Balanced';
  let statusClass = 'balanced';
  if (surplus > 50) {
    statusText = `Surplus of ${surplus.toFixed(0)} kW — Charging Hub Batteries`;
    statusClass = 'surplus';
  } else if (surplus < -50) {
    statusText = `Deficit of ${Math.abs(surplus).toFixed(0)} kW — Discharging / Power Plant Active`;
    statusClass = 'deficit';
  }

  const handleHubClick = (hubId) => {
    if (onHubClick) onHubClick(hubId);
  };

  // Refs for SVG line calculation
  const diagramRef = useRef(null);
  const sourceRefs = useRef({});
  const hubRefs = useRef({});
  const batRefs = useRef({});
  const gridRef = useRef(null);
  const powerPlantRef = useRef(null);
  const loadsRefs = useRef({});
  const [lines, setLines] = useState([]);

  const calcLines = useCallback(() => {
    if (!diagramRef.current) return;
    const box = diagramRef.current.getBoundingClientRect();
    const newLines = [];

    const getRect = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - box.left,
        y: r.top + r.height / 2 - box.top,
        right: r.right - box.left,
        left: r.left - box.left,
        top: r.top - box.top,
        bottom: r.bottom - box.top,
        width: r.width,
        height: r.height,
      };
    };

    // 1. Source → Hub connections
    Object.entries(HUBS).forEach(([hubId, hubDef]) => {
      const hubEl = getRect(hubRefs.current[hubId]);
      if (!hubEl) return;

      hubDef.sources.forEach(sk => {
        const srcEl = getRect(sourceRefs.current[sk]);
        if (!srcEl) return;
        newLines.push({
          id: `src-${sk}-hub-${hubId}`,
          x1: srcEl.right,
          y1: srcEl.y,
          x2: hubEl.left,
          y2: hubEl.y,
          type: 'source-hub',
        });
      });
    });

    // 2. Hub → Battery connections (vertical)
    Object.entries(HUBS).forEach(([hubId]) => {
      const hubEl = getRect(hubRefs.current[hubId]);
      const batEl = getRect(batRefs.current[hubId]);
      if (!hubEl || !batEl) return;
      
      const isDischarging = state.hubs[hubId].batteries.some(b => b.status === 'discharging');

      if (isDischarging) {
        newLines.push({
          id: `hub-${hubId}-bat`,
          x1: batEl.x,
          y1: batEl.top,
          x2: hubEl.x,
          y2: hubEl.bottom,
          type: 'hub-bat',
        });
      } else {
        newLines.push({
          id: `hub-${hubId}-bat`,
          x1: hubEl.x,
          y1: hubEl.bottom,
          x2: batEl.x,
          y2: batEl.top,
          type: 'hub-bat',
        });
      }
    });

    // 3. Hub → Grid connections (direct horizontal)
    const gridEl = getRect(gridRef.current);
    if (gridEl) {
      Object.entries(HUBS).forEach(([hubId]) => {
        const hubEl = getRect(hubRefs.current[hubId]);
        if (!hubEl) return;
        newLines.push({
          id: `hub-${hubId}-grid`,
          x1: hubEl.right,
          y1: hubEl.y,
          x2: gridEl.left,
          y2: gridEl.y,
          type: 'hub-grid',
        });
      });

      // 4. Grid → Loads connection (curved)
      Object.keys(loadsRefs.current).forEach(regionName => {
        const loadEl = getRect(loadsRefs.current[regionName]);
        if (loadEl) {
          newLines.push({
            id: `grid-load-${regionName}`,
            x1: gridEl.right,
            y1: gridEl.y,
            x2: loadEl.left,
            y2: loadEl.y,
            type: 'grid-load',
          });
        }
      });

      // 5. Power Plant → Grid (vertical connection)
      // Flows from Power Plant up to Grid
      const ppEl = getRect(powerPlantRef.current);
      if (ppEl) {
        newLines.push({
          id: 'pp-grid',
          x1: ppEl.x,
          y1: ppEl.top,
          x2: gridEl.x,
          y2: gridEl.bottom,
          type: 'powerplant-grid',
        });
      }
    }

    setLines(newLines);
  }, [state]);

  useEffect(() => {
    calcLines();
    const timer = setTimeout(calcLines, 100);
    window.addEventListener('resize', calcLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calcLines);
    };
  }, [calcLines]);

  useEffect(() => {
    const t = setTimeout(calcLines, 50);
    return () => clearTimeout(t);
  }, [state, calcLines]);

  const renderPath = (line) => {
    // Vertical lines
    if (line.type === 'hub-bat' || line.type === 'powerplant-grid') {
      return (
        <line
          key={line.id}
          x1={line.x1} y1={line.y1}
          x2={line.x2} y2={line.y2}
          className={`hf-svg-line active ${line.type === 'hub-bat' ? 'bat-line' : 'powerplant-line'}`}
        />
      );
    }

    // Horizontal curved bezier
    const dx = Math.abs(line.x2 - line.x1);
    const cpOffset = Math.max(dx * 0.45, 30);
    const path = `M ${line.x1},${line.y1} C ${line.x1 + cpOffset},${line.y1} ${line.x2 - cpOffset},${line.y2} ${line.x2},${line.y2}`;

    return (
      <path
        key={line.id}
        d={path}
        className="hf-svg-line active"
      />
    );
  };

  return (
    <div className="hub-flow-section">
      <div className="card hub-flow-card">
        <div className="card-header">
          <h2>Smart Energy Hub Architecture</h2>
          <span className="card-subtitle">Real-time collection, storage, and distribution grid</span>
        </div>
        <div className="card-body">
          
          <div className="hub-flow-diagram-v3" ref={diagramRef}>

            {/* SVG Overlay */}
            <svg className="hf-svg-overlay">
              {lines.map(renderPath)}
            </svg>

            {/* COL 1: Sources */}
            <div className="hf-col-v3 hf-sources-col">
              {Object.entries(HUBS).map(([hubId, hubDef]) => (
                <div className="hf-source-group-v3" key={hubId}>
                  <div className="hf-group-label-v3">{hubDef.shortName} Sources</div>
                  {hubDef.sources.map(sk => {
                    const src = state.sources[sk];
                    const meta = SOURCES[sk];
                    const hasAlert = src.maintenanceStatus !== 'Normal';
                    return (
                      <div
                        className="hf-source-item-v3"
                        key={sk}
                        ref={el => sourceRefs.current[sk] = el}
                        style={{ borderLeftColor: meta.color }}
                      >
                        <span className="hf-icon-v3">{meta.icon}</span>
                        <div className="hf-info-v3">
                          <span className="hf-name-v3">{meta.label}</span>
                          <span className="hf-val-v3" style={{ color: meta.color }}>
                            {src.generation.toFixed(0)} <small>kW</small>
                          </span>
                        </div>
                        {hasAlert && <span className="hf-alert-icon-v3" title={src.maintenanceStatus}>⚠️</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* COL 2: Collectors + Batteries below */}
            <div className="hf-col-v3 hf-collectors-col">
              {Object.entries(HUBS).map(([hubId, hubDef]) => {
                const hubGen = getHubGeneration(state, hubId);
                const hub = state.hubs[hubId];
                const activeBats = hub.batteries.filter(b => b.status === 'charging' || b.status === 'discharging').length;
                
                return (
                  <div className="hf-collector-wrapper" key={hubId}>
                    <div
                      className="hf-hub-node-v3"
                      ref={el => hubRefs.current[hubId] = el}
                      onClick={() => handleHubClick(hubId)}
                      style={{ borderColor: hubDef.color }}
                    >
                      <div className="hf-hub-icon-v3">⚡</div>
                      <div className="hf-hub-name-v3">{hubDef.name}</div>
                      <div className="hf-hub-val-v3" style={{ color: hubDef.color }}>{hubGen.toFixed(0)} kW</div>
                      <div className="hf-hub-meta-v3">
                        {hub.batteries.length} Batteries ({activeBats} Active)
                      </div>
                    </div>

                    <div
                      className="hf-bat-array-v3"
                      ref={el => batRefs.current[hubId] = el}
                    >
                      {hub.batteries.map(bat => {
                        const pct = (bat.stored / bat.capacity) * 100;
                        return (
                          <div className="hf-bat-mini-v3" key={bat.id} title={`Battery ${bat.id}: ${pct.toFixed(0)}%`}>
                            <div
                              className="hf-bat-mini-fill-v3"
                              style={{
                                height: `${pct}%`,
                                background: pct < 20 ? 'var(--accent-red)' : 'var(--accent-green-light)'
                              }}
                            />
                            <span className="hf-bat-mini-label-v3">{bat.id}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* COL 3: Grid + Power Plant */}
            <div className="hf-col-v3 hf-grid-col">
              
              {/* National Grid */}
              <div className="hf-grid-node-v3" ref={gridRef}>
                <div className="hf-grid-icon-v3">🏗️</div>
                <div className="hf-grid-label-v3">National Grid</div>
                <div className="hf-grid-val-v3">{actualTotalGen.toFixed(0)} kW</div>
                <div className="hf-grid-freq-v3">{state.gridFrequency.toFixed(2)} Hz</div>
              </div>

              {/* Power Plant */}
              <div className="hf-pp-node-v3" ref={powerPlantRef}>
                <div className="hf-pp-icon-v3">🏭</div>
                <div className="hf-pp-label-v3">Power Plant</div>
                <div className="hf-pp-val-v3">{powerPlantGen.toFixed(0)} kW</div>
                <div className={`hf-pp-status-v3 ${powerPlantGen > 0 ? 'active' : 'standby'}`}>
                  {powerPlantGen > 0 ? '● Active' : '○ Standby'}
                </div>
              </div>

            </div>

            {/* COL 4: Local Loads */}
            <div className="hf-col-v3 hf-loads-col">
              {state.regions.map((region, i) => {
                // Map icons based on index for variety
                const icons = ['🏭', '🏢', '🏠', '🏫', '🏥'];
                const labels = ['Industrial Load', 'Commercial Load', 'Residential Load', 'Campus Load', 'Critical Load'];
                return (
                  <div 
                    className="hf-load-node-v3" 
                    key={region.name}
                    ref={el => loadsRefs.current[region.name] = el}
                  >
                    <div className="hf-load-icon-v3">{icons[i % icons.length]}</div>
                    <div className="hf-load-info-v3">
                      <div className="hf-load-label-v3">{labels[i % labels.length]}</div>
                      <div className="hf-load-val-v3">{region.demand} kW</div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <div className={`hf-status ${statusClass}`}>
            <span className="hf-status-dot" />
            <span>{statusText}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
