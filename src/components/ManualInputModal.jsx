import { useState } from 'react';
import { useEnergy, SOURCES } from '../store/EnergyContext';
import './ManualInputModal.css';

export default function ManualInputModal({ isOpen, onClose }) {
  const { dispatch } = useEnergy();
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState('grid');
  const [priority, setPriority] = useState('normal');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source || !amount || Number(amount) <= 0) return;

    dispatch({
      type: 'ADD_GENERATION',
      payload: {
        source,
        amount: Number(amount),
        direction,
      },
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        title: `Generation Added`,
        msg: `+${amount} MW from ${SOURCES[source].label} → ${direction === 'battery' ? 'Battery' : direction === 'grid' ? 'Grid' : 'Auto'}`,
        time: 'Just now',
        read: false,
      },
    });

    setSource('');
    setAmount('');
    setDirection('grid');
    setPriority('normal');
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Electricity Generation</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="genSource">Energy Source</label>
              <select id="genSource" value={source} onChange={e => setSource(e.target.value)} required>
                <option value="">Select Source</option>
                {Object.entries(SOURCES).map(([key, src]) => (
                  <option key={key} value={key}>{src.icon} {src.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="genAmount">Amount (MW)</label>
              <input
                type="number" id="genAmount"
                min="1" max="10000" step="1"
                placeholder="Enter MW"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Transfer Direction</label>
              <div className="radio-group">
                {[
                  { value: 'grid', label: 'Send to National Grid' },
                  { value: 'battery', label: 'Store in Battery' },
                  { value: 'auto', label: 'Auto (Smart Routing)' },
                ].map(opt => (
                  <label className={`radio-label ${direction === opt.value ? 'selected' : ''}`} key={opt.value}>
                    <input
                      type="radio" name="transferDir"
                      value={opt.value}
                      checked={direction === opt.value}
                      onChange={e => setDirection(e.target.value)}
                    />
                    <span className="radio-custom" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="genPriority">Priority</label>
              <select id="genPriority" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="normal">Normal</option>
                <option value="high">High — Peak Demand</option>
                <option value="low">Low — Off-Peak</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Add Generation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
