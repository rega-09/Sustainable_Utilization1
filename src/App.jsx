import { useState, useEffect } from 'react';
import { EnergyProvider, useEnergy } from './store/EnergyContext';
import Navbar from './components/Navbar';
import NotificationPanel from './components/NotificationPanel';
import KPICards from './components/KPICards';
// MaintenanceAlerts removed — alerts shown in navbar notification popup only
import EnergyMix from './components/EnergyMix';
import EnergyHubFlow from './components/EnergyHubFlow';
import SourceCards from './components/SourceCards';
import NationalGrid from './components/NationalGrid';
import BatterySystem from './components/BatterySystem';
import Analytics from './components/Analytics';
import ManualInputModal from './components/ManualInputModal';
import HubDetailsModal from './components/HubDetailsModal';
import './App.css';

function Dashboard() {
  const { state, dispatch } = useEnergy();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Hub Details Modal State
  const [hubModalOpen, setHubModalOpen] = useState(false);
  const [selectedHubId, setSelectedHubId] = useState(null);

  // Simulate live data ticks
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'SIMULATE_TICK' });
      dispatch({ type: 'RECORD_HISTORY' });
    }, 3000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Solar Simulation Tick
  useEffect(() => {
    if (!state.solarSimulation.isPlaying) return;
    const interval = setInterval(() => {
      dispatch({ type: 'ADVANCE_SOLAR_SIMULATION' });
    }, state.solarSimulation.speedMs);
    return () => clearInterval(interval);
  }, [state.solarSimulation.isPlaying, state.solarSimulation.speedMs, dispatch]);

  const handleNavigate = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenHubModal = (hubId) => {
    setSelectedHubId(hubId);
    setHubModalOpen(true);
  };

  // Track active section on scroll
  useEffect(() => {
    const sections = ['dashboard', 'sources', 'grid', 'battery', 'analytics'];
    const handler = () => {
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onToggleNotifications={() => setNotifOpen(!notifOpen)}
      />
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      <main className="main-content">
        {/* Dashboard Overview */}
        <section className="section" id="dashboard">
          <div className="section-header">
            <h1>Smart Renewable Energy Management</h1>
            <div className="live-indicator">
              <span className="pulse" /> Live Data
            </div>
          </div>
          <p className="dashboard-intro">An integrated platform for monitoring renewable energy generation, centralized collection, battery storage, grid distribution, infrastructure health, and intelligent maintenance.</p>
          
          <KPICards />

          
          <div className="dashboard-grid">
            <EnergyMix />
          </div>
          <EnergyHubFlow onHubClick={handleOpenHubModal} />
        </section>

        {/* Energy Sources */}
        <SourceCards onOpenModal={() => setModalOpen(true)} />

        {/* National Grid */}
        <NationalGrid />

        {/* Battery */}
        <BatterySystem />

        {/* Analytics */}
        <Analytics />
      </main>

      {/* Government-style Footer */}
      <footer className="govt-footer">
        <div className="govt-footer-line">
          <strong>EcoGrid — Sustainable Energy Management Dashboard</strong>
        </div>
        <div className="govt-footer-line">
          Ministry of New and Renewable Energy, Government of India
        </div>
        <div className="govt-footer-line">
          © {new Date().getFullYear()} All Rights Reserved | Designed & Developed for Smart India Hackathon
        </div>
      </footer>

      <ManualInputModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <HubDetailsModal isOpen={hubModalOpen} onClose={() => setHubModalOpen(false)} hubId={selectedHubId} />
    </>
  );
}

export default function App() {
  return (
    <EnergyProvider>
      <Dashboard />
    </EnergyProvider>
  );
}
