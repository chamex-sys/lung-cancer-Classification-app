// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('📤 Tentative de connexion:', { email: formData.email });
      
      const response = await fetch('http://localhost/lung-cancer-api/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📥 Statut réponse:', response.status);

      const textResponse = await response.text();
      console.log('📄 Réponse brute:', textResponse);

      let data;
      try {
        data = JSON.parse(textResponse);
        console.log('✅ Données parsées:', data);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        throw new Error('Réponse serveur invalide');
      }

      if (response.ok && data.success) {
        console.log('🎉 Connexion réussie !');
        console.log('👤 Utilisateur:', data.user);
        
        // Sauvegarder l'utilisateur dans localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Rediriger vers le dashboard
        navigate('/dashboard');
      } else {
        console.log('⚠️ Erreur métier:', data.message);
        setError(data.message || 'Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setError('Erreur de connexion au serveur. Vérifiez que XAMPP est démarré (Apache + MySQL)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="login-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="login-title">Bon retour !</h1>
          <p className="login-subtitle">Connectez-vous à votre compte</p>
        </div>

        <div className="login-card">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-submit"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>

          <p className="login-footer">
            Pas encore de compte ?{' '}
            <Link to="/register">S'inscrire</Link>
          </p>
        </div>

        <Link to="/" className="back-link">
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}