import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { SubmitPage } from './pages/SubmitPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { AuthGuard } from './components/AuthGuard';
import { Footer } from './components/Footer';
import { Analytics } from '@vercel/analytics/react';

// Main App Component
const AppContent = () => {
  const location = useLocation();
  
  // Don't show footer on admin page
  const showFooter = location.pathname !== '/admin';
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/agent/:id" element={<AgentDetailPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AuthGuard><AdminPage /></AuthGuard>} />
      </Routes>
      {showFooter && <Footer />}
      <Analytics />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}