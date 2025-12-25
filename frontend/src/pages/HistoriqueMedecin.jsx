// src/pages/HistoriqueMedecin.jsx - VERSION COMPLÈTE
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Historique.css';

export default function HistoriqueMedecin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDiagnostics: 0,
    diagnosticsCancer: 0,
    diagnosticsNormal: 0
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData || userData.role !== 'medecin') {
      navigate('/dashboard');
      return;
    }
    setUser(userData);
    loadPatients(userData.id);
  }, [navigate]);

  const loadPatients = async (medecinId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/lung-cancer-api/api/patients.php?medecin_id=${medecinId}`
      );

      if (response.data.success) {
        const patientsData = response.data.patients;
        setPatients(patientsData);
        
        // Calculer les statistiques globales
        const totalDiagnostics = patientsData.reduce((sum, p) => sum + (p.nb_analyses || 0), 0);
        const diagnosticsCancer = patientsData.reduce((sum, p) => {
          return sum + (p.diagnostics?.filter(d => d.resultat === 'Cancer').length || 0);
        }, 0);
        const diagnosticsNormal = patientsData.reduce((sum, p) => {
          return sum + (p.diagnostics?.filter(d => d.resultat === 'Normal').length || 0);
        }, 0);

        setStats({
          totalPatients: patientsData.length,
          totalDiagnostics,
          diagnosticsCancer,
          diagnosticsNormal
        });
      }
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      alert('Erreur lors du chargement des patients');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredPatients = patients.filter(p =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return <div className="loading">Chargement...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Navbar */}
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
              Système de Classification Pulmonaire
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
            <Link to="/profile" style={{
              padding: '8px 16px',
              backgroundColor: '#95a5a6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              👤 Profil
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
        {/* En-tête */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', color: '#2c3e50', marginBottom: '10px' }}>
            📊 Suivi de Mes Patients
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            Gérez et suivez l'évolution de tous vos patients
          </p>
        </div>

        {/* Statistiques du médecin */}
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
            borderTop: '4px solid #3498db'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Total Patients
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>
              {stats.totalPatients}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              👥 Patients suivis
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid #9b59b6'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Total Diagnostics
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>
              {stats.totalDiagnostics}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              📊 Analyses effectuées
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
              Diagnostics Normal
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
              {stats.diagnosticsNormal}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              ✅ {stats.totalDiagnostics > 0 ? ((stats.diagnosticsNormal / stats.totalDiagnostics) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid #e74c3c'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Détections Cancer
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e74c3c' }}>
              {stats.diagnosticsCancer}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              ⚠️ {stats.totalDiagnostics > 0 ? ((stats.diagnosticsCancer / stats.totalDiagnostics) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div style={{
          backgroundColor: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un patient par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        {/* Layout patients */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedPatient ? '400px 1fr' : '1fr',
          gap: '20px',
          marginBottom: '50px'
        }}>
          {/* Liste des patients */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '20px',
            maxHeight: '800px',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
              Patients ({filteredPatients.length})
            </h3>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
                Chargement...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
                Aucun patient trouvé
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredPatients.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    style={{
                      padding: '15px',
                      border: selectedPatient?.id === patient.id ? '2px solid #3498db' : '1px solid #e0e0e0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: selectedPatient?.id === patient.id ? '#ebf5fb' : 'white',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPatient?.id !== patient.id) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPatient?.id !== patient.id) {
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>
                        {patient.prenom} {patient.nom}
                      </h4>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: patient.statut === 'actif' ? '#d4edda' : '#fff3cd',
                        color: patient.statut === 'actif' ? '#155724' : '#856404'
                      }}>
                        {patient.statut === 'actif' ? '✓ Actif' : '⚠ Suivi'}
                      </span>
                    </div>
                    
                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#7f8c8d' }}>
                      {patient.email}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#95a5a6'
                    }}>
                      <span>📊 {patient.nb_analyses} analyses</span>
                      <span>📅 {new Date(patient.derniere_analyse).toLocaleDateString('fr-FR')}</span>
                    </div>
                    
                    <div style={{
                      marginTop: '8px',
                      padding: '5px',
                      backgroundColor: patient.dernier_diagnostic === 'Normal' ? '#d4edda' : '#f8d7da',
                      borderRadius: '4px',
                      fontSize: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: patient.dernier_diagnostic === 'Normal' ? '#155724' : '#721c24'
                    }}>
                      Dernier: {patient.dernier_diagnostic}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détails du patient */}
          {selectedPatient && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '25px',
              maxHeight: '800px',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>
                  Dossier de {selectedPatient.prenom} {selectedPatient.nom}
                </h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#e0e0e0',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✕ Fermer
                </button>
              </div>
              
              {/* Infos patient */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '15px',
                marginBottom: '25px'
              }}>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#7f8c8d' }}>
                    Email
                  </p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                    {selectedPatient.email}
                  </p>
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#7f8c8d' }}>
                    Téléphone
                  </p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                    {selectedPatient.telephone}
                  </p>
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#7f8c8d' }}>
                    Date d'inscription
                  </p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                    {new Date(selectedPatient.date_inscription).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#7f8c8d' }}>
                    Nombre d'analyses
                  </p>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>
                    {selectedPatient.nb_analyses}
                  </p>
                </div>
              </div>

              {/* Historique diagnostics */}
              <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>
                📋 Historique des Diagnostics
              </h4>

              {selectedPatient.diagnostics && selectedPatient.diagnostics.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {selectedPatient.diagnostics.map(diag => (
                    <div
                      key={diag.id}
                      style={{
                        border: `2px solid ${diag.resultat === 'Normal' ? '#27ae60' : '#e74c3c'}`,
                        borderRadius: '10px',
                        padding: '15px',
                        backgroundColor: diag.resultat === 'Normal' ? '#f0fdf4' : '#fef2f2'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <p style={{ 
                            margin: '0 0 5px 0', 
                            fontSize: '14px', 
                            color: '#7f8c8d' 
                          }}>
                            📅 {new Date(diag.date).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <h5 style={{ 
                            margin: 0, 
                            fontSize: '18px',
                            color: diag.resultat === 'Normal' ? '#27ae60' : '#e74c3c'
                          }}>
                            {diag.resultat}
                          </h5>
                        </div>
                        <span style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor: diag.resultat === 'Normal' ? '#dcfce7' : '#fee2e2',
                          color: diag.resultat === 'Normal' ? '#166534' : '#991b1b',
                          height: 'fit-content'
                        }}>
                          {diag.confiance}% confiance
                        </span>
                      </div>
                      
                      <p style={{ 
                        margin: '10px 0', 
                        fontSize: '14px',
                        color: '#2c3e50' 
                      }}>
                        {diag.description}
                      </p>
                      
                      <div style={{
                        backgroundColor: diag.resultat === 'Normal' ? '#dcfce7' : '#fef3c7',
                        padding: '10px',
                        borderRadius: '6px',
                        borderLeft: `4px solid ${diag.resultat === 'Normal' ? '#27ae60' : '#f59e0b'}`
                      }}>
                        <p style={{ 
                          margin: '0 0 5px 0', 
                          fontSize: '13px',
                          fontWeight: 'bold' 
                        }}>
                          💡 Recommandation :
                        </p>
                        <p style={{ margin: 0, fontSize: '13px' }}>
                          {diag.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '30px' }}>
                  Aucun diagnostic enregistré
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}