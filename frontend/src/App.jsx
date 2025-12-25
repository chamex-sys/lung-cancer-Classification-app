// src/App.jsx - VERSION COMPLÈTE AVEC ADMIN
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HistoriqueMedecin from './pages/HistoriqueMedecin';
import HistoriquePatient from './pages/HistoriquePatient';
import AdminPanel from './pages/AdminPanel'; // ⭐ NOUVEAU

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Composant pour router l'historique selon le rôle
function HistoriqueRouter() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // ⭐ AJOUT : Admin vers panneau admin
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  // Rediriger selon le rôle
  if (user.role === 'medecin') {
    return <HistoriqueMedecin />;
  } else if (user.role === 'patient') {
    return <HistoriquePatient />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
}

// ⭐ NOUVEAU : Protéger la route Admin
function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes protégées */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Route historique avec routage automatique selon le rôle */}
        <Route 
          path="/historique" 
          element={<HistoriqueRouter />} 
        />
        
        {/* ⭐ NOUVEAU : Route Admin */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          } 
        />
        
        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}