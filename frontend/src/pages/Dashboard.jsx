// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      // Si pas connecté, rediriger vers login
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        alert('❌ Veuillez sélectionner une image valide');
        return;
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ L\'image est trop grande (max 10MB)');
        return;
      }

      setSelectedImage(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Réinitialiser le résultat
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert('❌ Veuillez d\'abord sélectionner une image');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    // Simulation de l'analyse (remplacer par l'API du modèle IA)
    // En production, vous enverrez l'image à votre backend qui utilisera le modèle
    setTimeout(() => {
      // Résultat simulé (à remplacer par la vraie API)
      const mockResults = [
        {
          class: 'Normal',
          confidence: 92.5,
          description: 'Aucune anomalie détectée',
          recommendation: 'Suivi de routine recommandé',
          color: 'success'
        },
        {
          class: 'Adénocarcinome',
          confidence: 87.3,
          description: 'Présence suspectée d\'adénocarcinome pulmonaire',
          recommendation: 'Consultation oncologique urgente recommandée',
          color: 'danger'
        },
        {
          class: 'Carcinome épidermoïde',
          confidence: 84.6,
          description: 'Présence suspectée de carcinome épidermoïde',
          recommendation: 'Biopsie recommandée pour confirmation',
          color: 'warning'
        },
        {
          class: 'Carcinome à grandes cellules',
          confidence: 79.8,
          description: 'Présence suspectée de carcinome à grandes cellules',
          recommendation: 'Examens complémentaires nécessaires',
          color: 'warning'
        }
      ];

      // Sélectionner un résultat aléatoire pour la démo
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setResult(randomResult);
      setAnalyzing(false);
    }, 3000); // 3 secondes de simulation
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    // Réinitialiser l'input file
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
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <h1 className="navbar-logo">🫁 Cancer Poumon AI</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">👤 Dr. {user.nom}</span>
          <Link to="/profile" className="btn-profile">Mon Profil</Link>
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Analyse de Scan Pulmonaire</h2>
          <p className="dashboard-subtitle">
            Téléchargez une image de scan thoracique pour obtenir un diagnostic IA
          </p>
        </div>

        <div className="analysis-container">
          {/* Zone d'upload */}
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

          {/* Zone de résultats */}
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
                    Confiance: {result.confidence}%
                  </span>
                </div>

                <div className="result-body">
                  <div className="result-main">
                    <h4 className="diagnosis-label">Diagnostic :</h4>
                    <h2 className="diagnosis-value">{result.class}</h2>
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
                  </div>

                  {result.color === 'danger' && (
                    <div className="alert alert-danger">
                      ⚠️ <strong>Attention :</strong> Ce résultat nécessite une consultation médicale urgente
                    </div>
                  )}

                  {result.color === 'warning' && (
                    <div className="alert alert-warning">
                      ℹ️ <strong>Information :</strong> Des examens complémentaires sont recommandés
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
                  <button className="btn-export">
                    📄 Exporter le Rapport
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
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