// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    telephone: '',
    specialite: '',
    role: 'medecin'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const specialites = [
    'Pneumologie',
    'Oncologie',
    'Radiologie',
    'Chirurgie thoracique',
    'Médecine générale',
    'Autre'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);
    setErrors({});

    try {
      const { confirmPassword, ...dataToSend } = formData;
      
      console.log('📤 Envoi des données:', dataToSend);
      
      const response = await fetch('http://localhost/lung-cancer-api/api/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('📥 Statut réponse:', response.status);

      // Lire le texte brut d'abord
      const textResponse = await response.text();
      console.log('📄 Réponse brute:', textResponse);

      // Parser en JSON
      let data;
      try {
        data = JSON.parse(textResponse);
        console.log('✅ Données parsées:', data);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        throw new Error('Réponse serveur invalide');
      }

      // Vérifier le succès avec response.ok OU data.success
      if (response.ok && data.success) {
        console.log('🎉 Inscription réussie !');
        setSuccess(true);
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          password: '',
          confirmPassword: '',
          telephone: '',
          specialite: '',
          role: 'medecin'
        });

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Erreur métier (email déjà utilisé, etc.)
        console.log('⚠️ Erreur métier:', data.message);
        setErrors({ submit: data.message || "Erreur lors de l'inscription" });
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setErrors({
        submit: 'Erreur de connexion au serveur. Vérifiez que XAMPP est démarré (Apache + MySQL)'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <div className="register-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="register-title">Inscription Professionnelle</h1>
          <p className="register-subtitle">Système de Classification Cancer du Poumon</p>
        </div>

        {success && (
          <div className="success-message">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p>Inscription réussie ! Redirection vers la connexion...</p>
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            <p>{errors.submit}</p>
          </div>
        )}

        <div className="register-card">
          <div className="form-section">
            <label className="form-label">Type de compte</label>
            <div className="role-selector">
              {['medecin', 'admin', 'patient'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`role-button ${formData.role === role ? 'active' : ''}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Nom <span className="required">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className={`form-input ${errors.nom ? 'error' : ''}`}
                placeholder="Benali"
              />
              {errors.nom && <p className="error-text">{errors.nom}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Prénom <span className="required">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`form-input ${errors.prenom ? 'error' : ''}`}
                placeholder="Ahmed"
              />
              {errors.prenom && <p className="error-text">{errors.prenom}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Email professionnel <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="dr.benali@hopital.ma"
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Téléphone <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className={`form-input ${errors.telephone ? 'error' : ''}`}
              placeholder="+212 6 12 34 56 78"
            />
            {errors.telephone && <p className="error-text">{errors.telephone}</p>}
          </div>

          {formData.role === 'medecin' && (
            <div className="form-group">
              <label className="form-label">Spécialité</label>
              <select
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Sélectionnez une spécialité</option>
                {specialites.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Mot de passe <span className="required">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirmer <span className="required">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-submit"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Inscription en cours...
              </>
            ) : (
              'Créer mon compte'
            )}
          </button>

          <p className="register-footer">
            Déjà inscrit ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>

        <p className="security-note">
          🔒 Vos données sont sécurisées et conformes au RGPD
        </p>
      </div>
    </div>
  );
}