import { useState, useEffect } from 'react';
import { useEnergy } from '../store/EnergyContext';
import './Navbar.css';

export default function Navbar({ activeSection, onNavigate, onToggleNotifications, theme, toggleTheme }) {
  const { state } = useEnergy();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
    { 
      id: 'farms', 
      label: 'Farms', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      subLinks: [
        { id: 'solar', label: 'Solar Plant', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg> },
        { id: 'wind', label: 'Wind Plant', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg> },
        { id: 'hydro', label: 'Hydro Plant', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
      ]
    },
    { 
      id: 'dispatch', 
      label: 'Dispatch Center', 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> 
    },
    { id: 'sources', label: 'Energy Sources', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> },
    { id: 'grid', label: 'National Grid', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
    { id: 'battery', label: 'Battery', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="18" height="12" rx="2" /><path d="M22 10v4" /><path d="M6 10v4M10 10v4M14 10v4" /></svg> },
    { id: 'analytics', label: 'Analytics', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
  ];

  const activeAlertCount = state.maintenanceAlerts.filter(a => !a.resolved).length;
  const unreadCount = state.notifications.filter(n => !n.read).length + activeAlertCount;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-brand">
        <div className="nav-logo">
          <img src="/Logo.jpg" alt="EcoGrid Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <div>
          <span className="nav-title">Eco<span className="accent">Grid</span></span>
          <span className="nav-subtitle">Ministry of New & Renewable Energy</span>
        </div>
      </div>

      <ul className={`nav-links ${mobileOpen ? 'open' : ''}`}>
        {links.map(link => (
          <li key={link.id} className={link.subLinks ? 'nav-dropdown' : ''}>
            {link.subLinks ? (
              <>
                <div className={`nav-link ${['solar', 'wind', 'hydro'].includes(activeSection) ? 'active' : ''}`} style={{cursor: 'pointer'}}>
                  {link.icon} {link.label}
                  <svg className="dropdown-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                <ul className="dropdown-menu">
                  {link.subLinks.map(sub => (
                    <li key={sub.id}>
                      <a
                        href={`#${sub.id}`}
                        className={`dropdown-link ${activeSection === sub.id ? 'active' : ''}`}
                        onClick={e => {
                          e.preventDefault();
                          onNavigate(sub.id);
                          setMobileOpen(false);
                        }}
                      >
                        {sub.icon} {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <a
                href={`#${link.id}`}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
                onClick={e => {
                  e.preventDefault();
                  onNavigate(link.id);
                  setMobileOpen(false);
                }}
              >
                {link.icon} {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>
        <button className="btn-icon" onClick={onToggleNotifications} title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </button>
        <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

