// src/pages/Dashboard.jsx - VERSION COMPLÈTE AVEC SAUVEGARDE
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [navigate]);
  // Dans Dashboard.jsx, après useEffect
useEffect(() => {
  const userData = localStorage.getItem('user');
  
  if (!userData) {
    navigate('/login');
    return;
  }

  const parsedUser = JSON.parse(userData);
  setUser(parsedUser);
  
  // ⭐ NOUVEAU : Rediriger admin vers son panneau
  if (parsedUser.role === 'admin') {
    navigate('/admin');
    return;
  }
}, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('❌ Veuillez sélectionner une image valide');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('❌ L\'image est trop grande (max 10MB)');
        return;
      }

      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert('❌ Veuillez d\'abord sélectionner une image');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      console.log('🔄 Envoi de l\'image à l\'API IA...');
      
      // Étape 1 : Analyse par l'IA
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Réponse IA reçue:', response.data);

      if (response.data.success) {
        const apiResult = response.data;
        
        const transformedResult = {
          class: apiResult.result,
          confidence: parseFloat(apiResult.confidence) * 100,
          description: apiResult.interpretation.message,
          recommendation: apiResult.interpretation.recommendation,
          color: apiResult.result === 'Normal' ? 'success' : 'danger',
          probabilities: apiResult.probabilities,
          risk_level: apiResult.interpretation.risk_level
        };

        setResult(transformedResult);
        console.log('📊 Résultat transformé:', transformedResult);

        // Étape 2 : Sauvegarder dans la base de données
        await saveDiagnostic(transformedResult);

      } else {
        throw new Error('Erreur dans la réponse de l\'API IA');
      }

    } catch (err) {
      console.error('❌ Erreur lors de l\'analyse:', err);
      
      let errorMessage = 'Erreur lors de l\'analyse';
      
      if (err.response) {
        errorMessage = err.response.data.error || 'Erreur du serveur backend';
      } else if (err.request) {
        errorMessage = 'Le serveur backend ne répond pas. Vérifiez qu\'il est lancé (python app.py)';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      alert('❌ ' + errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  // ⭐ NOUVELLE FONCTION : Sauvegarder le diagnostic
  const saveDiagnostic = async (diagnosticData) => {
    setSaving(true);
    
    try {
      console.log('💾 Sauvegarde du diagnostic...');
      
      const dataToSave = {
        patient_id: user.id,
        medecin_id: user.medecin_id || null,
        resultat: diagnosticData.class,
        confiance: diagnosticData.confidence,
        prob_cancer: diagnosticData.probabilities.cancer,
        prob_normal: diagnosticData.probabilities.normal,
        description: diagnosticData.description,
        recommendation: diagnosticData.recommendation,
        risk_level: diagnosticData.risk_level,
        image_path: selectedImage.name
      };

      const response = await axios.post(
        'http://localhost/lung-cancer-api/api/diagnostics.php',
        dataToSave
      );

      console.log('✅ Diagnostic sauvegardé:', response.data);

      if (response.data.success) {
        console.log('💾 Sauvegarde réussie ! ID:', response.data.diagnostic_id);
      } else {
        console.warn('⚠️ Erreur sauvegarde:', response.data.message);
      }

    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
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
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <h1 className="navbar-logo">🫁 Cancer Poumon AI</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">
            👤 {user.role === 'medecin' ? 'Dr.' : ''} {user.prenom} {user.nom}
          </span>
          <Link to="/historique" className="btn-historique">📊 Historique</Link>
          <Link to="/profile" className="btn-profile">Mon Profil</Link>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Analyse de Scan Pulmonaire</h2>
          <p className="dashboard-subtitle">
            Téléchargez une image de scan thoracique pour obtenir un diagnostic IA
          </p>
          {user.medecin_nom && (
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              👨‍⚕️ Votre médecin : <strong>{user.medecin_nom}</strong> ({user.medecin_specialite})
            </p>
          )}
        </div>

        {error && (
          <div className="error-banner" style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#c00'
          }}>
            <strong>❌ Erreur:</strong> {error}
          </div>
        )}

        {saving && (
          <div style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div className="spinner-small"></div>
            <span>💾 Sauvegarde du diagnostic en cours...</span>
          </div>
        )}

        <div className="analysis-container">
          <div className="upload-section">
            <div className="upload-card">
              <h3 className="section-title">📤 Télécharger un scan</h3>
              
              {!imagePreview ? (
                <label htmlFor="file-input" className="upload-zone">
                  <div className="upload-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="upload-text">Cliquez pour sélectionner une image</p>
                  <p className="upload-hint">PNG, JPG, JPEG (max 10MB)</p>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input-hidden"
                  />
                </label>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Scan preview" className="image-preview" />
                  <div className="image-actions">
                    <button onClick={handleReset} className="btn-reset">
                      🔄 Changer l'image 
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="btn-analyze"
                    >
                      {analyzing ? (
                        <>
                          <div className="spinner-small"></div>
                          Analyse en cours...
                        </>
                      ) : (
                        '🔬 Analyser'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {analyzing && (
            <div className="result-section">
              <div className="analyzing-card">
                <div className="analyzing-animation">
                  <div className="pulse-circle"></div>
                  <div className="pulse-circle pulse-delay-1"></div>
                  <div className="pulse-circle pulse-delay-2"></div>
                </div>
                <h3>🤖 Intelligence Artificielle en action</h3>
                <p>Analyse du scan pulmonaire en cours...</p>
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
              </div>
            </div>
          )}

          {result && !analyzing && (
            <div className="result-section">
              <div className={`result-card result-${result.color}`}>
                <div className="result-header">
                  <h3 className="result-title">📊 Résultat du Diagnostic</h3>
                  <span className={`confidence-badge badge-${result.color}`}>
                    Confiance: {result.confidence.toFixed(2)}%
                  </span>
                </div>

                <div className="result-body">
                  <div className="result-main">
                    <h4 className="diagnosis-label">Diagnostic :</h4>
                    <h2 className="diagnosis-value">{result.class}</h2>
                  </div>

                  <div className="result-probabilities" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      backgroundColor: '#ffebee',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#666' }}>Probabilité Cancer</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
                        {(result.probabilities.cancer * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#e8f5e9',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#666' }}>Probabilité Normal</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
                        {(result.probabilities.normal * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="result-details">
                    <div className="detail-item">
                      <span className="detail-icon">📋</span>
                      <div>
                        <p className="detail-label">Description</p>
                        <p className="detail-text">{result.description}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">💡</span>
                      <div>
                        <p className="detail-label">Recommandation</p>
                        <p className="detail-text">{result.recommendation}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">⚠️</span>
                      <div>
                        <p className="detail-label">Niveau de risque</p>
                        <p className="detail-text">{result.risk_level}</p>
                      </div>
                    </div>
                  </div>

                  {result.color === 'danger' && (
                    <div className="alert alert-danger">
                      ⚠️ <strong>Attention :</strong> Ce résultat nécessite une consultation médicale urgente
                    </div>
                  )}

                  {result.color === 'success' && (
                    <div className="alert alert-success">
                      ✅ <strong>Bonne nouvelle :</strong> Aucune anomalie majeure détectée
                    </div>
                  )}
                </div>

                <div className="result-actions">
                  <button onClick={handleReset} className="btn-new-analysis">
                    🔄 Nouvelle Analyse
                  </button>
                  <Link to="/historique" className="btn-export">
                    📊 Voir l'Historique
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="disclaimer">
          <p>
            ⚠️ <strong>Avertissement :</strong> Ce système d'intelligence artificielle est un outil d'aide au diagnostic. 
            Les résultats doivent toujours être validés par un professionnel de santé qualifié. 
            Ne jamais utiliser ce système comme seul moyen de diagnostic.
          </p>
        </div>
      </div>
    </div>
  );
}