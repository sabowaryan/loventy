import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import CookieBannerV2 from './components/CookieBannerV2';
import SeoHead from './components/SeoHead';
import ScrollToTop from './components/ScrollToTop';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './components/ProtectedRoute';

import KeyProtectedRoute from './components/KeyProtectedRoute';

import AdminRouteGuard from './components/admin/AdminRouteGuard';

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
import MySpacePage from './pages/myspace';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailConfirmation from './pages/auth/EmailConfirmation';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OAuthCallback from './pages/auth/OAuthCallback';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Invitations from './pages/dashboard/Invitations';
import Guests from './pages/dashboard/Guests';
import Settings from './pages/dashboard/Settings';
import Events from './pages/dashboard/Events';

// Invitation Pages
import InvitationView from './pages/invitation/InvitationView';
import InvPreview from './pages/invitation/InvPreview';

// Error Pages
import ErrorPage from './pages/ErrorPage';
import Error404 from './pages/Error404';
import Error500 from './pages/Error500';
import ConnectionError from './pages/ConnectionError';

// Admin Pages
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';
import UserManagementPage from './pages/dashboard/admin/UserManagementPage';
import SecurityPage from './pages/dashboard/admin/SecurityPage';

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
      <ScrollToTop />
      <AppWithSeo>
        {/* Global connection error banner */}
        <ConnectionErrorBanner />

        {/* Cookie Banner */}
        <CookieBannerV2 />

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
          <Route path="/auth/callback" element={<OAuthCallback />} />

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
            <AdminRouteGuard>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/users" element={
            <AdminRouteGuard requiredPermission="admin.users.read">
              <AdminLayout>
                <UserManagementPage />
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/events" element={
            <AdminRouteGuard requiredPermission="admin.events.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Supervision des événements</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/system" element={
            <AdminRouteGuard requiredPermission="admin.system.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Santé du système</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/security" element={
            <AdminRouteGuard requiredPermission="admin.security.read">
              <AdminLayout>
                <SecurityPage />
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/finances" element={
            <AdminRouteGuard requiredPermission="admin.finances.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Gestion financière</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/support" element={
            <AdminRouteGuard requiredPermission="admin.support.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Support et communication</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/moderation" element={
            <AdminRouteGuard requiredPermission="admin.moderation.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Modération de contenu</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/config" element={
            <AdminRouteGuard requiredPermission="admin.config.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Configuration de la plateforme</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
          } />

          <Route path="/dashboard/admin/stats" element={
            <AdminRouteGuard requiredPermission="admin.stats.read">
              <AdminLayout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4">Statistiques et analyses</h1>
                  <p className="text-gray-600">Cette section sera implémentée dans une tâche future.</p>
                </div>
              </AdminLayout>
            </AdminRouteGuard>
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

          {/* Invitation Preview Route */}
          <Route path="/i/:id" element={<InvPreview />} />

          {/* MySpace Page */}
          <Route path="/me" element={
            <KeyProtectedRoute secretKey="LOV3NTY2025@">
              <PublicLayout>
                <MySpacePage />
              </PublicLayout>
            </KeyProtectedRoute>
          } />

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