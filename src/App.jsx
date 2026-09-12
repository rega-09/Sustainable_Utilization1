import { useState, useEffect, lazy, Suspense } from 'react';
import { EnergyProvider, useEnergy } from './store/EnergyContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import NotificationPanel from './components/NotificationPanel';
import KPICards from './components/KPICards';
import EnergyMix from './components/EnergyMix';
import EnergyHubFlow from './components/EnergyHubFlow';
import SourceCards from './components/SourceCards';
import NationalGrid from './components/NationalGrid';
import BatterySystem from './components/BatterySystem';
import Analytics from './components/Analytics';
import ManualInputModal from './components/ManualInputModal';
import HubDetailsModal from './components/HubDetailsModal';
const SolarDashboard = lazy(() => import('./components/solar/SolarDashboard'));
const WindDashboard = lazy(() => import('./components/wind/WindDashboard'));
const HydroDashboard = lazy(() => import('./components/hydro/HydroDashboard'));
const DispatchDashboard = lazy(() => import('./components/dispatch/DispatchDashboard'));
import './App.css';

function MainDashboard({
  modalOpen,
  setModalOpen,
  hubModalOpen,
  setHubModalOpen,
  selectedHubId,
  setSelectedHubId,
  onNavigate
}) {
  const handleOpenHubModal = (hubId) => {
    setSelectedHubId(hubId);
    setHubModalOpen(true);
  };

  return (
    <>
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
          
          <KPICards onNavigate={onNavigate} />

          
          <div className="dashboard-grid">
            <EnergyMix />
          </div>
          <EnergyHubFlow onHubClick={handleOpenHubModal} onNavigate={onNavigate} />
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

function AppContent() {
  const { dispatch } = useEnergy();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'solar' | 'wind' | 'hydro'
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
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

  const handleNavigate = (section) => {
    if (section === 'solar') {
      setCurrentView('solar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'wind') {
      setCurrentView('wind');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'hydro') {
      setCurrentView('hydro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'dispatch') {
      setCurrentView('dispatch');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('dashboard');
      setActiveSection(section);
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Track active section on scroll for main dashboard
  useEffect(() => {
    if (currentView !== 'dashboard') return;
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
  }, [currentView]);

  let renderedView;
  if (currentView === 'dashboard') {
    renderedView = (
      <MainDashboard
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        hubModalOpen={hubModalOpen}
        setHubModalOpen={setHubModalOpen}
        selectedHubId={selectedHubId}
        setSelectedHubId={setSelectedHubId}
        onNavigate={handleNavigate}
      />
    );
  } else if (currentView === 'solar') {
    renderedView = <SolarDashboard />;
  } else if (currentView === 'wind') {
    renderedView = <WindDashboard />;
  } else if (currentView === 'hydro') {
    renderedView = <HydroDashboard />;
  } else if (currentView === 'dispatch') {
    renderedView = <DispatchDashboard />;
  }

  return (
    <>
      <Navbar
        activeSection={currentView === 'dashboard' ? activeSection : currentView}
        onNavigate={handleNavigate}
        onToggleNotifications={() => setNotifOpen(!notifOpen)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      <Suspense fallback={<div className="loading-fallback">Loading dashboard view...</div>}>
        {renderedView}
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <EnergyProvider>
        <AppContent />
      </EnergyProvider>
    </ErrorBoundary>
  );
}
