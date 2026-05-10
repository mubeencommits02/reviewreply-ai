import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CompetitorInsight from './pages/CompetitorInsight';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import SEO from './components/SEO';
import { Loader2 } from 'lucide-react';
import './App.css';

// Marketing Pages
import AmazonLanding from './pages/marketing/AmazonLanding';
import EtsyLanding from './pages/marketing/EtsyLanding';
import ShopifyLanding from './pages/marketing/ShopifyLanding';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 size={40} className="animate-spin text-indigo-600" strokeWidth={1.75} />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

// Root Redirect Component
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SEO /> {/* Global default SEO */}
      <Router>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Public Marketing Pages */}
          <Route path="/amazon-review-assistant" element={<AmazonLanding />} />
          <Route path="/etsy-customer-service-ai" element={<EtsyLanding />} />
          <Route path="/shopify-reputation-management" element={<ShopifyLanding />} />
          
          {/* Unified Auth Route */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/signup" element={<Navigate to="/auth" replace />} />

          {/* Protected Routes inside Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/competitor" element={<CompetitorInsight />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

