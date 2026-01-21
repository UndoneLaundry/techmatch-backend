import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import RoleSelection from './pages/public/RoleSelection';
import TechnicianSignup from './pages/public/TechnicianSignup';
import BusinessSignup from './pages/public/BusinessSignup';
import VerificationUpload from './pages/public/VerificationUpload';
import PendingPage from './pages/public/PendingPage';

// Authenticated pages
import TechnicianDashboard from './pages/authenticated/TechnicianDashboard';
import BusinessDashboard from './pages/authenticated/BusinessDashboard';
import ProfilePage from './pages/authenticated/ProfilePage';
import EditProfile from './pages/authenticated/EditProfile';
import SkillsCertifications from './pages/authenticated/SkillsCertifications';
import SettingsPage from './pages/authenticated/SettingsPage';
import ForceChangePassword from './pages/authenticated/ForceChangePassword';

// Internal pages
import AdminDashboard from './pages/internal/AdminDashboard';
import AgencyDashboard from './pages/internal/AgencyDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>

            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/select-role" element={<RoleSelection />} />
            <Route path="/signup/technician" element={<TechnicianSignup />} />
            <Route path="/signup/business" element={<BusinessSignup />} />
            <Route path="/verify" element={<VerificationUpload />} />
            <Route path="/pending" element={<PendingPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/change-password" element={<ForceChangePassword />} />

              <Route
                path="/dashboard"
                element={
                  <RoleBasedRoute
                    technician={<TechnicianDashboard />}
                    business={<BusinessDashboard />}
                    admin={<AdminDashboard />}
                    agency={<AgencyDashboard />}
                  />
                }
              />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/skills" element={<SkillsCertifications />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
