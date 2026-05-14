import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TrafficMonitoring from './pages/TrafficMonitoring';
import SignalControl from './pages/SignalControl';
import EmergencyCorridor from './pages/EmergencyCorridor';
import Sustainability from './pages/Sustainability';
import IncidentReports from './pages/IncidentReports';
import Analytics from './pages/Analytics';
import SensorHealth from './pages/SensorHealth';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/traffic-monitoring" element={<TrafficMonitoring />} />
          <Route path="/signal-control" element={<SignalControl />} />
          <Route path="/emergency-corridor" element={<EmergencyCorridor />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/incident-reports" element={<IncidentReports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sensor-health" element={<SensorHealth />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
