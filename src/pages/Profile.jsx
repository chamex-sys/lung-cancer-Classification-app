// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      nom: parsedUser.nom || '',
      prenom: parsedUser.prenom || '',
      email: parsedUser.email || '',
      telephone: parsedUser.telephone || '',
      specialite: parsedUser.specialite || ''
    });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulation de mise à jour (à remplacer par API)
    setTimeout(() => {
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      setLoading(false);
    }, 1000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulation (à remplacer par API)
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Mot de passe changé avec succès !' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Navbar */}
      <nav className="profile-navbar">
        <div className="navbar-left">
          <h1 className="navbar-logo">🫁 Cancer Poumon AI</h1>
        </div>
        <div className="navbar-right">
          <Link to="/dashboard" className="btn-back">← Retour au Dashboard</Link>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-header">
          <h2 className="profile-title">Mon Profil</h2>
          <p className="profile-subtitle">Gérez vos informations personnelles</p>
        </div>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
            {message.text}
          </div>
        )}

        <div className="profile-grid">
          {/* Carte d'informations */}
          <div className="profile-card info-card">
            <div className="card-header">
              <h3>Informations personnelles</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn-edit">
                  ✏️ Modifier
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    disabled
                  />
                  <p className="help-text">L'email ne peut pas être modifié</p>
                </div>

                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                {user.role === 'medecin' && (
                  <div className="form-group">
                    <label>Spécialité</label>
                    <input
                      type="text"
                      name="specialite"
                      value={formData.specialite}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" disabled={loading} className="btn-save">
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        telephone: user.telephone,
                        specialite: user.specialite
                      });
                    }}
                    className="btn-cancel"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <span className="info-label">Nom complet</span>
                  <span className="info-value">{user.prenom} {user.nom}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Téléphone</span>
                  <span className="info-value">{user.telephone}</span>
                </div>
                {user.role === 'medecin' && (
                  <div className="info-item">
                    <span className="info-label">Spécialité</span>
                    <span className="info-value">{user.specialite || 'Non spécifié'}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Rôle</span>
                  <span className="info-value badge-role">{user.role}</span>
                </div>
              </div>
            )}
          </div>

          {/* Carte de changement de mot de passe */}
          <div className="profile-card password-card">
            <h3>Changer le mot de passe</h3>
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-save">
                {loading ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </form>
          </div>

          {/* Carte de statistiques personnelles */}
          <div className="profile-card stats-card">
            <h3>Mes statistiques</h3>
            <div className="mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-icon">📊</div>
                <div>
                  <p className="mini-stat-value">128</p>
                  <p className="mini-stat-label">Analyses effectuées</p>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-icon">👥</div>
                <div>
                  <p className="mini-stat-value">45</p>
                  <p className="mini-stat-label">Patients suivis</p>
                </div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-icon">⏱️</div>
                <div>
                  <p className="mini-stat-value">3h 24m</p>
                  <p className="mini-stat-label">Temps moyen/analyse</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}