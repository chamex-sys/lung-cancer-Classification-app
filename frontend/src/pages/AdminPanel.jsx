// src/pages/AdminPanel.jsx - PANNEAU ADMIN COMPLET
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [medecins, setMedecins] = useState([]);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({
    totalMedecins: 0,
    totalPatients: 0,
    totalDiagnostics: 0,
    diagnosticsCancer: 0,
    diagnosticsNormal: 0
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData || userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setUser(userData);
    loadAdminData();
  }, [navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Charger tous les médecins avec leurs statistiques
      const response = await axios.get(
        'http://localhost/lung-cancer-api/api/admin_stats.php'
      );

      if (response.data.success) {
        setMedecins(response.data.medecins);
        setGlobalStats(response.data.global_stats);
      }
    } catch (error) {
      console.error('Erreur chargement données admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Navbar Admin */}
      <nav style={{
        backgroundColor: '#2c3e50',
        padding: '15px 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
            <h1 style={{ margin: 0, color: 'white', fontSize: '24px' }}>
              🔐 Panneau Administrateur
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#ecf0f1', fontSize: '14px' }}>
              Système de Gestion Cancer Poumon AI
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>
              👤 Admin: {user.prenom} {user.nom}
            </span>
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
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 20px' }}>
        {/* Statistiques globales */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', color: '#2c3e50', marginBottom: '10px' }}>
            📊 Vue d'ensemble du système
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            Statistiques globales et gestion des médecins
          </p>
        </div>

        {/* Cartes statistiques */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Total Médecins
            </div>
            <div style={{ fontSize: '42px', fontWeight: 'bold' }}>
              {globalStats.totalMedecins}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              👨‍⚕️ Praticiens actifs
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Total Patients
            </div>
            <div style={{ fontSize: '42px', fontWeight: 'bold' }}>
              {globalStats.totalPatients}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              👥 Patients suivis
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Total Diagnostics
            </div>
            <div style={{ fontSize: '42px', fontWeight: 'bold' }}>
              {globalStats.totalDiagnostics}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              📊 Analyses effectuées
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Diagnostics Normal
            </div>
            <div style={{ fontSize: '42px', fontWeight: 'bold' }}>
              {globalStats.diagnosticsNormal}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              ✅ {globalStats.totalDiagnostics > 0 
                ? ((globalStats.diagnosticsNormal / globalStats.totalDiagnostics) * 100).toFixed(1) 
                : 0}% des cas
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Détections Cancer
            </div>
            <div style={{ fontSize: '42px', fontWeight: 'bold' }}>
              {globalStats.diagnosticsCancer}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
              ⚠️ {globalStats.totalDiagnostics > 0 
                ? ((globalStats.diagnosticsCancer / globalStats.totalDiagnostics) * 100).toFixed(1) 
                : 0}% des cas
            </div>
          </div>
        </div>

        {/* Liste des médecins */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '25px',
          marginBottom: '50px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50', fontSize: '24px' }}>
            👨‍⚕️ Liste des Médecins ({medecins.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
              Chargement...
            </div>
          ) : medecins.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
              Aucun médecin enregistré
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {medecins.map(medecin => (
                <div
                  key={medecin.id}
                  onClick={() => setSelectedMedecin(medecin)}
                  style={{
                    border: selectedMedecin?.id === medecin.id 
                      ? '2px solid #3498db' 
                      : '1px solid #e0e0e0',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    backgroundColor: selectedMedecin?.id === medecin.id 
                      ? '#ebf5fb' 
                      : 'white',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMedecin?.id !== medecin.id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMedecin?.id !== medecin.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#3498db',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginRight: '15px'
                    }}>
                      {medecin.prenom[0]}{medecin.nom[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '18px', color: '#2c3e50' }}>
                        Dr. {medecin.prenom} {medecin.nom}
                      </h4>
                      <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#7f8c8d' }}>
                        {medecin.specialite}
                      </p>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '3px' }}>
                    📧 {medecin.email}
                  </div>
                  <div style={{ fontSize: '13px', color: '#7f8c8d', marginBottom: '15px' }}>
                    📞 {medecin.telephone}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    marginTop: '15px'
                  }}>
                    <div style={{
                      backgroundColor: '#e3f2fd',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>
                        {medecin.nb_patients}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Patients</div>
                    </div>
                    <div style={{
                      backgroundColor: '#f3e5f5',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b1fa2' }}>
                        {medecin.nb_diagnostics}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Diagnostics</div>
                    </div>
                    <div style={{
                      backgroundColor: medecin.nb_cancer > 0 ? '#ffebee' : '#e8f5e9',
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center'
                    }}>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        color: medecin.nb_cancer > 0 ? '#c62828' : '#2e7d32'
                      }}>
                        {medecin.nb_cancer}
                      </div>
                      <div style={{ fontSize: '11px', color: '#666' }}>Cancer</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détails médecin sélectionné */}
        {selectedMedecin && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '25px',
            marginBottom: '50px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>
                Détails - Dr. {selectedMedecin.prenom} {selectedMedecin.nom}
              </h3>
              <button
                onClick={() => setSelectedMedecin(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e0e0e0',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ✕ Fermer
              </button>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Email:</strong> {selectedMedecin.email}
              </p>
              <p style={{ margin: '0 0 10px 0' }}>
                <strong>Téléphone:</strong> {selectedMedecin.telephone}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Spécialité:</strong> {selectedMedecin.specialite}
              </p>
            </div>

            <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>
              👥 Ses Patients ({selectedMedecin.patients?.length || 0})
            </h4>

            {selectedMedecin.patients && selectedMedecin.patients.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {selectedMedecin.patients.map(patient => (
                  <div
                    key={patient.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                      {patient.prenom} {patient.nom}
                    </h5>
                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#7f8c8d' }}>
                      {patient.email}
                    </p>
                    <div style={{
                      marginTop: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}>
                      <span>📊 {patient.nb_analyses} analyses</span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        backgroundColor: patient.dernier_resultat === 'Normal' 
                          ? '#d4edda' 
                          : '#f8d7da',
                        color: patient.dernier_resultat === 'Normal' 
                          ? '#155724' 
                          : '#721c24'
                      }}>
                        {patient.dernier_resultat || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '30px' }}>
                Aucun patient assigné à ce médecin
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}