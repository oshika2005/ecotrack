import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ActivitiesPage from './pages/ActivitiesPage';
import CalculatorPage from './pages/CalculatorPage';
import ChallengesPage from './pages/ChallengesPage';
import CommunityPage from './pages/CommunityPage';
import GlobePage from './pages/GlobePage';
import MarketplacePage from './pages/MarketplacePage';
import './index.css';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div className="animate-pulse-glow" style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }} />
    </div>
  );
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="activities" element={<ActivitiesPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="challenges" element={<ChallengesPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="globe" element={<GlobePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
