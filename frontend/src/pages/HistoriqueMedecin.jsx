// src/pages/HistoriqueMedecin.jsx - AVEC SYSTÈME DE SIGNATURE
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Historique.css';
import ReportGenerator from '../components/ReportGenerator';
import ElectronicSignature from '../components/ElectronicSignature';

export default function HistoriqueMedecin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [diagnosticsEnAttente, setDiagnosticsEnAttente] = useState([]);
  const [diagnosticsSignes, setDiagnosticsSignes] = useState([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [signatureData, setSignatureData] = useState(null);
  const [showSignatureFor, setShowSignatureFor] = useState(null);
  const [activeTab, setActiveTab] = useState('en_attente'); // 'en_attente' ou 'signes'

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData || userData.role !== 'medecin') {
      navigate('/dashboard');
      return;
    }
    setUser(userData);
    loadDiagnostics(userData.id);
  }, [navigate]);

  const loadDiagnostics = async (medecinId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/lung-cancer-api/api/diagnostics.php?medecin_id=${medecinId}`
      );

      if (response.data.success) {
        setDiagnostics(response.data.diagnostics);
        setDiagnosticsEnAttente(response.data.en_attente || []);
        setDiagnosticsSignes(response.data.signes || []);
      }
    } catch (error) {
      console.error('Erreur chargement diagnostics:', error);
      alert('Erreur lors du chargement des diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSignatureComplete = (signature, diagnosticId) => {
    setSignatureData(signature);
    // Sauvegarder la signature dans la BDD
    saveDiagnosticSignature(diagnosticId, signature);
  };

  const saveDiagnosticSignature = async (diagnosticId, signature) => {
    try {
      const response = await axios.put(
        'http://localhost/lung-cancer-api/api/diagnostics.php',
        {
          id: diagnosticId,
          signature_medecin: signature
        }
      );

      if (response.data.success) {
        alert('✅ Signature enregistrée avec succès !');
        setShowSignatureFor(null);
        // Recharger les diagnostics
        loadDiagnostics(user.id);
      } else {
        alert('❌ Erreur lors de la sauvegarde de la signature');
      }
    } catch (error) {
      console.error('Erreur sauvegarde signature:', error);
      alert('❌ Erreur lors de la sauvegarde de la signature');
    }
  };

  const prepareResultForReport = (diag) => {
    return {
      class: diag.resultat,
      confidence: parseFloat(diag.confiance),
      description: diag.description,
      recommendation: diag.recommendation,
      color: diag.resultat === 'Normal' ? 'success' : 'danger',
      probabilities: {
        cancer: diag.resultat === 'Cancer' ? parseFloat(diag.confiance) / 100 : 1 - (parseFloat(diag.confiance) / 100),
        normal: diag.resultat === 'Normal' ? parseFloat(diag.confiance) / 100 : 1 - (parseFloat(diag.confiance) / 100)
      },
      risk_level: diag.resultat === 'Cancer' ? 'Élevé' : 'Faible'
    };
  };

  if (!user) return <div className="loading">Chargement...</div>;

  const currentDiagnostics = activeTab === 'en_attente' ? diagnosticsEnAttente : diagnosticsSignes;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <nav style={{
        backgroundColor: 'white',
        padding: '15px 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>
              🏥 MediCare Diagnostics
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
              Système de Gestion des Signatures
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', marginRight: '15px' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                Dr. {user.prenom} {user.nom}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>
                {user.specialite || 'Médecin'}
              </p>
            </div>
            <Link to="/dashboard" style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              ← Dashboard
            </Link>
            <button onClick={handleLogout} style={{
              padding: '8px 16px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', color: '#2c3e50', marginBottom: '10px' }}>
            📋 Gestion des Signatures
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            Signez les diagnostics de vos patients
          </p>
        </div>

        {/* Statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid #f39c12'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              En Attente de Signature
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f39c12' }}>
              {diagnosticsEnAttente.length}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              ⏳ Diagnostics à signer
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid #27ae60'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Diagnostics Signés
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
              {diagnosticsSignes.length}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              ✅ Signés et validés
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid #3498db'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Total Diagnostics
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>
              {diagnostics.length}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              📊 Tous vos diagnostics
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <button
            onClick={() => setActiveTab('en_attente')}
            style={{
              padding: '15px 30px',
              backgroundColor: activeTab === 'en_attente' ? '#f39c12' : 'transparent',
              color: activeTab === 'en_attente' ? 'white' : '#7f8c8d',
              border: 'none',
              borderBottom: activeTab === 'en_attente' ? '3px solid #f39c12' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            ⏳ En Attente ({diagnosticsEnAttente.length})
          </button>
          <button
            onClick={() => setActiveTab('signes')}
            style={{
              padding: '15px 30px',
              backgroundColor: activeTab === 'signes' ? '#27ae60' : 'transparent',
              color: activeTab === 'signes' ? 'white' : '#7f8c8d',
              border: 'none',
              borderBottom: activeTab === 'signes' ? '3px solid #27ae60' : 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            ✅ Signés ({diagnosticsSignes.length})
          </button>
        </div>

        {/* Liste des diagnostics */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '25px',
          marginBottom: '50px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
              Chargement...
            </div>
          ) : currentDiagnostics.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '18px', color: '#7f8c8d', margin: 0 }}>
                {activeTab === 'en_attente' 
                  ? '📭 Aucun diagnostic en attente de signature' 
                  : '📭 Aucun diagnostic signé'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {currentDiagnostics.map((diag) => (
                <div key={diag.id}>
                  <div
                    style={{
                      border: `2px solid ${diag.resultat === 'Normal' ? '#27ae60' : '#e74c3c'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      backgroundColor: diag.resultat === 'Normal' ? '#f0fdf4' : '#fef2f2'
                    }}
                  >
                    {/* En-tête du diagnostic */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom: '1px solid #ddd'
                    }}>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '18px',
                          color: diag.resultat === 'Normal' ? '#27ae60' : '#e74c3c'
                        }}>
                          {diag.resultat === 'Normal' ? '✅' : '⚠️'} {diag.resultat}
                        </h4>
                        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                          👤 Patient: <strong>{diag.patient_nom}</strong> ({diag.patient_email})
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '13px' }}>
                          📅 {new Date(diag.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          backgroundColor: diag.resultat === 'Normal' ? '#dcfce7' : '#fee2e2',
                          color: diag.resultat === 'Normal' ? '#166534' : '#991b1b',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '10px'
                        }}>
                          {diag.confiance}% confiance
                        </div>
                        
                        {diag.statut_signature === 'signe' && (
                          <div style={{
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            padding: '5px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ✅ Signé le {new Date(diag.date_signature).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        
                        {diag.statut_signature === 'en_attente' && (
                          <div style={{
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            padding: '5px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ⏳ En attente
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contenu du diagnostic */}
                    <div style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      borderRadius: '8px',
                      marginBottom: '15px'
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
                        📋 Description :
                      </p>
                      <p style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>
                        {diag.description}
                      </p>
                      
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
                        💡 Recommandation :
                      </p>
                      <p style={{ margin: 0, color: '#2c3e50' }}>
                        {diag.recommendation}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Bouton Signer (uniquement si en attente) */}
                      {diag.statut_signature === 'en_attente' && (
                        <button
                          onClick={() => setShowSignatureFor(showSignatureFor === diag.id ? null : diag.id)}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#f39c12',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            minWidth: '200px'
                          }}
                        >
                          ✍️ {showSignatureFor === diag.id ? 'Masquer la signature' : 'Signer ce diagnostic'}
                        </button>
                      )}
                      
                      {/* Bouton Télécharger le rapport */}
                      <button
                        onClick={() => setSelectedDiagnostic(selectedDiagnostic?.id === diag.id ? null : diag)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          backgroundColor: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          minWidth: '200px'
                        }}
                      >
                        📄 {selectedDiagnostic?.id === diag.id ? 'Masquer les options' : 'Télécharger le rapport'}
                      </button>
                    </div>
                  </div>

                  {/* Zone de signature */}
                  {showSignatureFor === diag.id && (
                    <div style={{ marginTop: '15px' }}>
                      <ElectronicSignature
                        onSignatureComplete={(sig) => handleSignatureComplete(sig, diag.id)}
                        doctorName={`Dr. ${user.prenom} ${user.nom}`}
                      />
                    </div>
                  )}

                  {/* Générateur de rapport */}
                  {selectedDiagnostic?.id === diag.id && (
                    <div style={{ marginTop: '15px' }}>
                      <ReportGenerator
                        result={prepareResultForReport(diag)}
                        user={user}
                        selectedPatient={{ prenom: diag.patient_nom.split(' ')[0], nom: diag.patient_nom.split(' ')[1] }}
                        diagnosticId={diag.id}
                        signature={diag.signature_medecin}
                        onReportGenerated={(data) => {
                          console.log('✅ Rapport généré:', data);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}