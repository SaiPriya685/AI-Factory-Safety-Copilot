import React from 'react';
import { SafetyProvider, useSafety } from './context/SafetyContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Cameras from './pages/Cameras';
import Telemetry from './pages/Telemetry';
import Copilot from './pages/Copilot';

import './styles/global.css';
import './styles/dashboard.css';
import './styles/modules.css';

function AppContent() {
  const { activePage, setActivePage } = useSafety();

  const renderContent = () => {
    switch (activePage) {
      case 'overview':
        return <Overview />;
      case 'cameras':
        return <Cameras />;
      case 'telemetry':
        return <Telemetry />;
      case 'copilot':
        return <Copilot />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="main-area">
        <Header />
        <main className="content-viewport">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <SafetyProvider>
      <AppContent />
    </SafetyProvider>
  );
}

export default App;










