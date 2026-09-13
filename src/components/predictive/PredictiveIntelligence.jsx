import React, { useState, useEffect } from 'react';
import { predictionEngine } from '../../services/aiPredictionService';
import './PredictiveIntelligence.css';

// Helper to format timestamp relative to now
const formatTimeAgo = (timestamp) => {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins === 0) return 'Predicted just now';
  return `Predicted ${diffMins} min ago`;
};

const PredictiveAlertCard = ({ alert, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'sev-critical';
      case 'WARNING': return 'sev-warning';
      default: return 'sev-info';
    }
  };

  return (
    <div className={`ai-alert-card ${getSeverityClass(alert.severity)}`} onClick={() => setExpanded(!expanded)}>
      <div className="alert-header">
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="alert-severity">{alert.severity}</div>
          <div className="alert-source">{alert.source} — {alert.unit}</div>
        </div>
        <button 
          className="alert-dismiss-btn" 
          onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
          title="Dismiss notification"
        >
          &times;
        </button>
      </div>
      
      <div className="alert-title">{alert.title}</div>
      
      {!expanded && (
        <div className="alert-footer">
          <span>AI Confidence: {alert.confidence}%</span>
          <span>{formatTimeAgo(alert.timestamp)}</span>
        </div>
      )}

      {expanded && (
        <div className="alert-details">
          <div className="ad-section">
            <div className="ad-label">Sensor Data Analysis</div>
            <div className="ad-data-grid">
              {alert.sensorData.map((data, idx) => (
                <div className="ad-data-row" key={idx}>
                  <span>{data.label}</span>
                  <strong>{data.value}</strong>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ad-section">
            <div className="ad-label">Why this prediction?</div>
            <div className="ad-text">{alert.reason}</div>
          </div>

          <div className="ad-section">
            <div className="ad-label">AI Confidence</div>
            <div className="ad-text highlight">{alert.confidence}%</div>
          </div>

          <div className="ad-section">
            <div className="ad-label">Recommended Action</div>
            <div className="ad-text action">{alert.recommendation}</div>
          </div>
          
          <div className="alert-footer mt-2">
            <span>{formatTimeAgo(alert.timestamp)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function PredictiveIntelligence() {
  const [alerts, setAlerts] = useState([]);
  
  // Update time-ago labels every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Poll for new AI predictions
  useEffect(() => {
    // Initial dummy alert so it's not empty immediately
    const initialAlert = predictionEngine.simulatePrediction();
    if (initialAlert) {
      setAlerts([initialAlert]);
    }

    const interval = setInterval(() => {
      const newAlert = predictionEngine.simulatePrediction();
      if (newAlert) {
        setAlerts(prev => {
          // Keep max 3 alerts to prevent the box from elongating too much
          const updated = [newAlert, ...prev];
          if (updated.length > 3) updated.pop();
          return updated;
        });
      }
    }, 12000); // Poll every 12 seconds

    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="card ai-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>AI Predictive Intelligence</h2>
          <span className="card-subtitle">Smart anomaly detection demo</span>
        </div>
        <div className="ai-status">
          <div className="ai-pulse-indicator"></div>
          <span>Active</span>
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
        <div className="ai-demo-disclaimer">
          <strong>Demo model</strong> • Real ML integration planned
        </div>

        <div className="ai-stats-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>AI Alerts: <strong>{alerts.length}</strong></span>
          {alerts.length > 0 && (
            <button 
              onClick={() => setAlerts([])}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '4px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.background = '#f1f5f9'; e.target.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.target.style.background = '#f8fafc'; e.target.style.color = '#475569'; }}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="ai-alerts-container">
          {alerts.length === 0 ? (
            <div className="ai-empty-state">
              Scanning infrastructure... No anomalies detected.
            </div>
          ) : (
            alerts.map(alert => <PredictiveAlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />)
          )}
        </div>
      </div>
    </div>
  );
}
