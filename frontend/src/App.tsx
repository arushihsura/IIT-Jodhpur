import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { ReportIncident } from './pages/ReportIncident';
import { IncidentFeed } from './pages/IncidentFeed';
import { IncidentDetail } from './pages/IncidentDetail';
import { Login } from './pages/Login';
import { ResponderDashboard } from './pages/ResponderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route 
                path="/report" 
                element={
                  <ProtectedRoute requiredRoles={['citizen']}>
                    <ReportIncident />
                  </ProtectedRoute>
                } 
              />
              <Route path="/incidents" element={<IncidentFeed />} />
              <Route path="/incidents/:id" element={<IncidentDetail />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/responder" 
                element={
                  <ProtectedRoute requiredRoles={['responder', 'admin']}>
                    <ResponderDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
