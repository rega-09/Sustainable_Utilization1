import { useEnergy, getTotalGeneration, getSurplus, getBatteryPercent, HUBS } from '../store/EnergyContext';
import './KPICards.css';

export default function KPICards({ onNavigate }) {
  const { state } = useEnergy();
  const totalGen = getTotalGeneration(state);
  const surplus = getSurplus(state);
  const batPercent = getBatteryPercent(state);
  
  // Calculate Grid Export (Surplus if positive, 0 if deficit)
  const gridExport = Math.max(0, surplus);
  
  // System Efficiency (Total Generation / Total Capacity)
  const totalCap = Object.values(state.sources).reduce((s, v) => s + v.capacity, 0);
  const systemEfficiency = totalCap > 0 ? (totalGen / totalCap) * 100 : 0;

  // Active Hubs (Hubs that are either charging or discharging batteries)
  const activeHubsCount = Object.values(state.hubs).filter(hub => 
    hub.batteries.some(b => b.status === 'charging' || b.status === 'discharging')
  ).length;

  const cards = [
    {
      className: 'kpi-generation',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
      label: 'Total Renewable',
      value: `${totalGen.toFixed(0)} kW`,
      sub: `Cap: ${totalCap.toFixed(0)} kW`,
    },
    {
      className: 'kpi-solar',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>,
      label: 'Solar',
      value: `${state.sources.solar.generation.toFixed(0)} kW`,
      sub: `Cap: ${state.sources.solar.capacity.toFixed(0)} kW`,
      route: 'solar'
    },
    {
      className: 'kpi-wind',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>,
      label: 'Wind',
      value: `${state.sources.wind.generation.toFixed(0)} kW`,
      sub: `Cap: ${state.sources.wind.capacity.toFixed(0)} kW`,
      route: 'wind'
    },
    {
      className: 'kpi-hydro',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
      label: 'Hydro',
      value: `${state.sources.hydro.generation.toFixed(0)} kW`,
      sub: `Cap: ${state.sources.hydro.capacity.toFixed(0)} kW`,
      route: 'hydro'
    },
    {
      className: 'kpi-battery',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="18" height="12" rx="2"/><path d="M22 10v4"/></svg>,
      label: 'Battery Storage',
      value: `${state.battery.stored.toFixed(0)} kWh`,
      sub: `${batPercent.toFixed(1)}% Full`,
    },
    {
      className: 'kpi-grid',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      label: 'Grid Export',
      value: `${gridExport.toFixed(0)} kW`,
      sub: 'To National Grid',
    },
    {
      className: 'kpi-hubs',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
      label: 'Active Hubs',
      value: `${activeHubsCount} / ${Object.keys(HUBS).length}`,
      sub: 'Collectors',
    },
    {
      className: 'kpi-efficiency',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      label: 'System Efficiency',
      value: `${systemEfficiency.toFixed(1)}%`,
      sub: 'Avg Capacity',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => (
        <div 
          className={`kpi-card ${card.className}`} 
          key={i}
          style={{ cursor: card.route ? 'pointer' : 'default' }}
          onClick={() => card.route && onNavigate && onNavigate(card.route)}
          title={card.route ? `Go to ${card.label} Dashboard` : ''}
        >
          <div className="kpi-top-bar" />
          <div className="kpi-content">
            <div className="kpi-icon-wrap">{card.icon}</div>
            <div className="kpi-info">
              <span className="kpi-label">{card.label}</span>
              <span className="kpi-value">{card.value}</span>
              <span className="kpi-sub">{card.sub}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

