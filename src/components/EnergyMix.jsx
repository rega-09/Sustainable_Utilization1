import { useEnergy, SOURCES, getTotalGeneration } from '../store/EnergyContext';
import './EnergyMix.css';

export default function EnergyMix() {
  const { state } = useEnergy();
  const totalGen = getTotalGeneration(state);

  const data = Object.entries(state.sources).map(([key, val]) => ({
    key,
    label: SOURCES[key].label,
    color: SOURCES[key].color,
    value: val.generation,
    percent: totalGen > 0 ? (val.generation / totalGen * 100).toFixed(0) : 0,
  }));

  // Build donut chart with SVG
  const radius = 80;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  const arcs = data.map((d) => {
    const pct = totalGen > 0 ? d.value / totalGen : 0;
    const dashArray = `${circumference * pct} ${circumference * (1 - pct)}`;
    const dashOffset = -circumference * accumulated;
    accumulated += pct;
    return { ...d, dashArray, dashOffset };
  });

  return (
    <div className="card energy-mix-card">
      <div className="card-header">
        <h2>Energy Mix</h2>
        <span className="card-subtitle">Current generation breakdown</span>
      </div>
      <div className="card-body mix-body">
        <div className="donut-wrap">
          <svg viewBox="0 0 200 200" className="donut-svg">
            {arcs.map((arc, i) => (
              <circle
                key={arc.key}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth="24"
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
                className="donut-arc"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
            <text x={cx} y={cy - 8} textAnchor="middle" className="donut-center-val">{totalGen.toFixed(0)}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="donut-center-label">kW Total</text>
          </svg>
        </div>
        <div className="mix-legend">
          {data.map(d => (
            <div className="mix-legend-item" key={d.key}>
              <span className="mix-dot" style={{ background: d.color }} />
              <span className="mix-label">{d.label}</span>
              <span className="mix-pct">{d.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

