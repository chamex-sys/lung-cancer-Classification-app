// src/pages/Dashboard.jsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Dashboard.css';
import ReportGenerator from '../components/ReportGenerator';
import ElectronicSignature from '../components/ElectronicSignature';
import ReportEditor from '../components/ReportEditor';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  const [diagnosticId, setDiagnosticId] = useState(null);
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    if (parsedUser.role === 'medecin') {
      loadPatients(parsedUser.id);
    }
  }, [navigate]);
  // ✅ AJOUT : Charger le médecin assigné au patient
useEffect(() => {
  if (user?.role === 'patient' && user?.id) {
    loadAssignedDoctor(user.id);
  }
}, [user]);

const loadAssignedDoctor = async (patientId) => {
  try {
    const res = await axios.get(
      `http://localhost/lung-cancer-api/api/patients.php?id=${patientId}`
    );

    if (res.data.success && res.data.patient) {
      setUser(prev => ({
        ...prev,
        medecin_id: res.data.patient.medecin_id,
        medecin_nom: res.data.patient.medecin_nom,
        medecin_specialite: res.data.patient.medecin_specialite
      }));
    }
  } catch (err) {
    console.error('❌ Erreur médecin:', err);
  }
};

  const loadPatients = async (medecinId) => {
    setLoadingPatients(true);
    try {
      const response = await axios.get(
        `http://localhost/lung-cancer-api/api/patients.php?medecin_id=${medecinId}`
      );
      
      if (response.data.success) {
        setPatients(response.data.patients);
      }
    } catch (error) {
      console.error('❌ Erreur chargement patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

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
      
      if (user?.role === 'medecin') {
        setShowPatientSelector(true);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert('❌ Veuillez d\'abord sélectionner une image');
      return;
    }

    if (user.role === 'medecin' && !selectedPatient) {
      alert('❌ Veuillez sélectionner un patient');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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

  const saveDiagnostic = async (diagnosticData) => {
  setSaving(true);
  
  try {
    let patientId = user.id;
    let medecinId = null;
    
    if (user.role === 'medecin') {
      patientId = selectedPatient.id;
      medecinId = user.id;
    } else if (user.role === 'patient') {
      patientId = user.id;
      medecinId = user.medecin_id;
    }
    
    if (!medecinId) {
      alert('❌ Aucun médecin assigné. Contactez l\'administration.');
      setSaving(false);
      return;
    }
    
    const dataToSave = {
      patient_id: patientId,
      medecin_id: medecinId,
      resultat: diagnosticData.class,
      confiance: diagnosticData.confidence,
      prob_cancer: diagnosticData.probabilities.cancer,
      prob_normal: diagnosticData.probabilities.normal,
      description: diagnosticData.description,
      recommendation: diagnosticData.recommendation,
      risk_level: diagnosticData.risk_level,
      image_path: selectedImage.name
    };

    console.log('📤 Données envoyées:', dataToSave);

    const response = await axios.post(
      'http://localhost/lung-cancer-api/api/diagnostics.php',
      dataToSave
    );

    console.log('📥 Réponse API:', response.data);

    if (response.data.success) {
      setDiagnosticId(response.data.diagnostic_id);
      console.log('✅ Diagnostic sauvegardé avec ID:', response.data.diagnostic_id);
      console.log('✅ Médecin associé:', medecinId);
    } else {
      // ✅ CORRECTION : Gérer le message d'erreur correctement
      const errorMsg = response.data.message || 'Erreur inconnue';
      console.error('❌ Erreur API:', errorMsg);
      alert('❌ Erreur: ' + errorMsg);
    }

  } catch (err) {
    console.error('❌ Erreur sauvegarde:', err);
    alert('❌ Erreur lors de la sauvegarde du diagnostic');
  } finally {
    setSaving(false);
  }
};
  const handleSignatureComplete = (signature) => {
    setSignatureData(signature);
  };

  const handleDiagnosticSaved = (updatedDiagnostic) => {
    setResult({
      ...result,
      class: updatedDiagnostic.resultat,
      confidence: parseFloat(updatedDiagnostic.confiance),
      description: updatedDiagnostic.description,
      recommendation: updatedDiagnostic.recommendation
    });
    setShowReportEditor(false);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setSelectedPatient(null);
    setShowPatientSelector(false);
    setDiagnosticId(null);
    setShowReportEditor(false);
    setShowSignature(false);
    setSignatureData(null);
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
          <h1 className="navbar-logo">🏥 MediScan Pro</h1>
        </div>
        <div className="navbar-right">
          <span className="user-name">
            {user.role === 'medecin' ? '👨‍⚕️ Dr.' : '👤'} {user.prenom} {user.nom}
          </span>
          {/* <Link to="/historique" className="btn-historique">📊 Historique</Link> */}
          <Link to="/profile" className="btn-profile-icon" title="Mon Profil">
            👤
          </Link>
           {user.role === 'medecin' && (
  <Link to="/signatures" className="btn-signatures">
    ✍️ Gestion des Signatures
  </Link>
)}
          <button onClick={handleLogout} className="btn-logout">Déconnexion</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2 className="dashboard-title">🔬 Analyse de Scan Pulmonaire</h2>
          <p className="dashboard-subtitle">
            Diagnostic assisté par Intelligence Artificielle
          </p>
          {user.medecin_nom && user.role === 'patient' && (
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '10px' }}>
              👨‍⚕️ Votre médecin : <strong>{user.medecin_nom}</strong> ({user.medecin_specialite})
            </p>
          )}
          {user.role === 'medecin' && (
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginTop: '10px',
              padding: '10px',
              background: '#f3f4f6',
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              👥 Vous avez <strong>{patients.length}</strong> patient{patients.length > 1 ? 's' : ''} assigné{patients.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <strong>❌ Erreur:</strong> {error}
          </div>
        )}

        {saving && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px',
            color: '#1e40af',
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
                  
                  {user.role === 'medecin' && showPatientSelector && (
                    <div style={{
                      marginTop: '20px',
                      marginBottom: '20px',
                      padding: '20px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '12px',
                      border: '2px solid #3b82f6'
                    }}>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '12px',
                        fontWeight: 700,
                        color: '#1e3a8a',
                        fontSize: '15px'
                      }}>
                        👤 Sélectionner le patient concerné :
                      </label>
                      
                      {loadingPatients ? (
                        <p style={{ color: '#6b7280', textAlign: 'center', padding: '10px' }}>
                          Chargement des patients...
                        </p>
                      ) : patients.length === 0 ? (
                        <div style={{
                          padding: '20px',
                          backgroundColor: '#fef3c7',
                          borderRadius: '8px',
                          border: '1px solid #fbbf24',
                          color: '#92400e',
                          textAlign: 'center'
                        }}>
                          <p style={{ margin: 0, fontWeight: 600 }}>
                            ⚠️ Aucun patient assigné
                          </p>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedPatient?.id?.toString() || ''}
                            onChange={(e) => {
                              const patientId = e.target.value;
                              if (patientId) {
                                const patient = patients.find(p => p.id.toString() === patientId);
                                setSelectedPatient(patient);
                              } else {
                                setSelectedPatient(null);
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 15px',
                              border: '2px solid #3b82f6',
                              borderRadius: '8px',
                              fontSize: '15px',
                              backgroundColor: '#ffffff',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            <option value="">-- Choisir un patient --</option>
                            {patients.map(patient => (
                              <option key={patient.id} value={patient.id.toString()}>
                                {patient.prenom} {patient.nom} - {patient.email}
                              </option>
                            ))}
                          </select>
                          
                          {selectedPatient && (
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '12px',
                              backgroundColor: '#d1fae5',
                              borderRadius: '8px',
                              border: '1px solid #6ee7b7'
                            }}>
                              <p style={{ 
                                margin: 0,
                                fontSize: '14px', 
                                color: '#065f46',
                                fontWeight: 600
                              }}>
                                ✅ Patient sélectionné : {selectedPatient.prenom} {selectedPatient.nom}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className="image-actions">
                    <button onClick={handleReset} className="btn-reset">
                      🔄 Changer l'image 
                    </button>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing || (user.role === 'medecin' && !selectedPatient)}
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

                  <div className="result-probabilities">
                    <div style={{
                      backgroundColor: '#fee2e2',
                      border: '1px solid #fca5a5'
                    }}>
                      <p style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>Probabilité Cancer</p>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626', margin: '5px 0' }}>
                        {(result.probabilities.cancer * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#d1fae5',
                      border: '1px solid #6ee7b7'
                    }}>
                      <p style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>Probabilité Normal</p>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: '#059669', margin: '5px 0' }}>
                        {(result.probabilities.normal * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="result-details">
                    <div className="detail-item">
                      <span className="detail-icon">📋</span>
                      <div style={{ flex: 1 }}>
                        <p className="detail-label">Description</p>
                        <p className="detail-text">{result.description}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">💡</span>
                      <div style={{ flex: 1 }}>
                        <p className="detail-label">Recommandation</p>
                        <p className="detail-text">{result.recommendation}</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">⚠️</span>
                      <div style={{ flex: 1 }}>
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

                {/* ✅ CORRECTION 1 : Boutons pour médecins AVANT le générateur */}
                {user.role === 'medecin' && diagnosticId && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <button
                      onClick={() => setShowReportEditor(!showReportEditor)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ {showReportEditor ? 'Masquer' : 'Éditer le Rapport'}
                    </button>
                    <button
                      onClick={() => setShowSignature(!showSignature)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: signatureData ? '#27ae60' : '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {signatureData ? '✅ Signature Ajoutée' : '✍️ Ajouter Signature'}
                    </button>
                  </div>
                )}

                {/* Éditeur de rapport */}
                {showReportEditor && diagnosticId && (
                  <ReportEditor
                    diagnostic={{
                      id: diagnosticId,
                      resultat: result.class,
                      confiance: result.confidence,
                      description: result.description,
                      recommendation: result.recommendation
                    }}
                    onSaved={handleDiagnosticSaved}
                    onCancel={() => setShowReportEditor(false)}
                  />
                )}

                {/* Signature électronique */}
                {showSignature && (
                  <ElectronicSignature
                    onSignatureComplete={handleSignatureComplete}
                    doctorName={user.role === 'medecin' ? `Dr. ${user.prenom} ${user.nom}` : ''}
                  />
                )}

                {/* ✅ CORRECTION 2 : UN SEUL générateur de rapports */}
                <ReportGenerator
                  result={result}
                  user={user}
                  selectedPatient={selectedPatient}
                  diagnosticId={diagnosticId}
                  signature={signatureData}
                  onReportGenerated={(data) => {
                    console.log('✅ Rapport généré:', data);
                  }}
                />

                {/* ✅ CORRECTION 3 : Bouton "Nouvelle Analyse" seulement */}
                <div className="result-actions">
                  <button onClick={handleReset} className="btn-new-analysis">
                    🔄 Nouvelle Analyse
                  </button>
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