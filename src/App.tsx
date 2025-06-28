import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CookieBanner from './components/CookieBanner';
import SeoHead from './components/SeoHead';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Public Pages
import Home from './pages/Home';
import Templates from './pages/Templates';
import Pricing from './pages/Pricing';
import SuccessPage from './pages/SuccessPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailConfirmation from './pages/auth/EmailConfirmation';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Invitations from './pages/dashboard/Invitations';
import Guests from './pages/dashboard/Guests';
import Settings from './pages/dashboard/Settings';
import Events from './pages/Events';

// Invitation Pages
import InvitationView from './pages/invitation/InvitationView';

// Error Pages
import ErrorPage from './pages/ErrorPage';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';
import ConnectionError from './pages/ConnectionError';

// Global error handling component
import ConnectionErrorBanner from './components/ConnectionErrorBanner';
import { useRedirects } from './hooks/useRedirects';

// SEO wrapper component
const AppWithSeo: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  // Handle redirects
  useRedirects();
  
  return (
    <>
      <SeoHead pagePath={location.pathname} />
      {children}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppWithSeo>
        {/* Global connection error banner */}
        <ConnectionErrorBanner />
        
        {/* Cookie Banner */}
        <CookieBanner />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          
          <Route path="/templates" element={
            <PublicLayout>
              <Templates />
            </PublicLayout>
          } />
          
          <Route path="/pricing" element={
            <PublicLayout>
              <Pricing />
            </PublicLayout>
          } />

          <Route path="/testimonials" element={
            <PublicLayout>
              <Testimonials />
            </PublicLayout>
          } />

          <Route path="/contact" element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          } />

          {/* Legal Pages */}
          <Route path="/privacy" element={
            <PublicLayout>
              <Privacy />
            </PublicLayout>
          } />
          
          <Route path="/terms" element={
            <PublicLayout>
              <Terms />
            </PublicLayout>
          } />
          
          <Route path="/cookies" element={
            <PublicLayout>
              <Cookies />
            </PublicLayout>
          } />

          {/* Success Page */}
          <Route path="/success" element={
            <ProtectedRoute>
              <SuccessPage />
            </ProtectedRoute>
          } />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/confirm" element={<EmailConfirmation />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/invitations" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Invitations />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/guests" element={
            <ProtectedRoute requiredPermission="guests.read">
              <DashboardLayout>
                <Guests />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/dashboard/settings" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/events" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/events/:eventId" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/events/edit/:eventId" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Events />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/editor/:templateId?" element={
            <ProtectedRoute requiredPermission="invitations.create">
              <Editor />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Administration</h1>
                  <p>Panel d'administration réservé aux administrateurs.</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Premium Routes */}
          <Route path="/dashboard/premium-features" element={
            <ProtectedRoute requiredRole="premium">
              <DashboardLayout>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Fonctionnalités Premium</h1>
                  <p>Contenu exclusif aux utilisateurs premium.</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Invitation View Routes (Public but with specific access) */}
          <Route path="/invitation/:invitationId" element={<InvitationView />} />

          {/* Error Pages */}
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/error/connection" element={<ConnectionError />} />
          <Route path="/500" element={<Error500 />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </AppWithSeo>
    </Router>
  );
}

export default App;