import { useEnergy } from '../store/EnergyContext';
import './MaintenanceAlerts.css';

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: '#c62828', bg: 'rgba(198,40,40,0.08)', icon: '🚨' },
  warning:  { label: 'Warning',  color: '#e65100', bg: 'rgba(230,81,0,0.08)',  icon: '⚠️' },
  info:     { label: 'Info',     color: '#1565c0', bg: 'rgba(21,101,192,0.08)', icon: 'ℹ️' },
};

export default function MaintenanceAlerts() {
  const { state, dispatch } = useEnergy();

  const activeAlerts = state.maintenanceAlerts.filter(a => !a.resolved);
  const resolvedAlerts = state.maintenanceAlerts.filter(a => a.resolved);

  // Sort by severity: critical → warning → info
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  const sorted = [...activeAlerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  if (state.maintenanceAlerts.length === 0) {
    return (
      <div className="card maint-card">
        <div className="card-header">
          <h2>🔧 Maintenance Alerts</h2>
          <span className="maint-badge maint-badge-ok">✓ All Systems Normal</span>
        </div>
        <div className="card-body maint-empty">
          <p>No maintenance alerts at this time. All energy sources are operating within normal parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card maint-card">
      <div className="card-header">
        <div className="maint-header-left">
          <h2>🔧 Maintenance Alerts</h2>
          <div className="maint-summary">
            {criticalCount > 0 && (
              <span className="maint-badge maint-badge-critical">{criticalCount} Critical</span>
            )}
            {warningCount > 0 && (
              <span className="maint-badge maint-badge-warning">{warningCount} Warning</span>
            )}
            <span className="maint-badge maint-badge-total">{activeAlerts.length} Active</span>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="maint-list">
          {sorted.map(alert => {
            const sev = SEVERITY_CONFIG[alert.severity];
            return (
              <div
                className={`maint-item maint-${alert.severity}`}
                key={alert.id}
                style={{ borderLeftColor: sev.color }}
              >
                <div className="maint-item-top">
                  <span className="maint-sev-icon">{sev.icon}</span>
                  <span className="maint-item-label">{alert.label}</span>
                  <span className="maint-sev-badge" style={{ color: sev.color, background: sev.bg }}>
                    {sev.label}
                  </span>
                </div>
                <p className="maint-item-desc">{alert.desc}</p>
                <div className="maint-item-footer">
                  <span className="maint-item-meta">
                    Efficiency: <strong>{alert.efficiency}%</strong> • {alert.time}
                  </span>
                  <div className="maint-item-actions">
                    <button
                      className="maint-btn maint-btn-resolve"
                      onClick={() => dispatch({ type: 'RESOLVE_ALERT', payload: alert.id })}
                    >
                      ✓ Mark Resolved
                    </button>
                    <button
                      className="maint-btn maint-btn-dismiss"
                      onClick={() => dispatch({ type: 'DISMISS_ALERT', payload: alert.id })}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {resolvedAlerts.length > 0 && (
          <details className="maint-resolved-section">
            <summary className="maint-resolved-toggle">
              {resolvedAlerts.length} Resolved Alert{resolvedAlerts.length > 1 ? 's' : ''}
            </summary>
            <div className="maint-list maint-resolved-list">
              {resolvedAlerts.map(alert => (
                <div className="maint-item maint-resolved" key={alert.id}>
                  <div className="maint-item-top">
                    <span className="maint-sev-icon">✅</span>
                    <span className="maint-item-label">{alert.label}</span>
                    <span className="maint-item-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

