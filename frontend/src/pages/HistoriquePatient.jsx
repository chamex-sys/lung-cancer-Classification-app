// src/pages/HistoriquePatient.jsx - VERSION COMPLÈTE
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Historique.css';

export default function HistoriquePatient() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    cancer: 0,
    normal: 0,
    confianceMoyenne: 0,
    dernierScan: null
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    loadDiagnostics(userData.id);
  }, [navigate]);

  const loadDiagnostics = async (patientId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost/lung-cancer-api/api/diagnostics.php?patient_id=${patientId}`
      );

      if (response.data.success) {
        const diags = response.data.diagnostics;
        setDiagnostics(diags);
        
        // Calculer les statistiques
        const total = diags.length;
        const cancer = diags.filter(d => d.resultat === 'Cancer').length;
        const normal = diags.filter(d => d.resultat === 'Normal').length;
        const confianceMoyenne = total > 0 
          ? diags.reduce((sum, d) => sum + parseFloat(d.confiance), 0) / total 
          : 0;
        
        setStats({
          total,
          cancer,
          normal,
          confianceMoyenne: confianceMoyenne.toFixed(2),
          dernierScan: diags.length > 0 ? diags[0].date : null
        });
      }
    } catch (error) {
      console.error('Erreur chargement diagnostics:', error);
      alert('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f7fa',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navbar */}
      <nav style={{
        backgroundColor: 'white',
        padding: '15px 30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>
              🫁 Cancer Poumon AI
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
              Mon Historique Médical
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ color: '#34495e', fontWeight: '500' }}>
              {user.prenom} {user.nom}
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        {/* En-tête */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '32px', color: '#2c3e50', marginBottom: '10px' }}>
            📊 Mon Suivi Médical
          </h2>
          <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
            Historique complet de vos analyses pulmonaires
          </p>
          {user.medecin_nom && (
            <p style={{ 
              marginTop: '10px', 
              padding: '10px 15px',
              backgroundColor: '#e8f5e9',
              borderLeft: '4px solid #4caf50',
              borderRadius: '4px',
              color: '#2e7d32'
            }}>
              👨‍⚕️ <strong>Votre médecin traitant :</strong> {user.medecin_nom} - {user.medecin_specialite}
            </p>
          )}
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
            borderTop: '4px solid #3498db'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Total des Scans
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2c3e50' }}>
              {stats.total}
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
              Scans Normaux
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#27ae60' }}>
              {stats.normal}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              ✅ {stats.total > 0 ? ((stats.normal / stats.total) * 100).toFixed(1) : 0}% des analyses
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
              {stats.cancer}
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              ⚠️ {stats.total > 0 ? ((stats.cancer / stats.total) * 100).toFixed(1) : 0}% des analyses
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderTop: '4px solid #f39c12'
          }}>
            <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '5px' }}>
              Confiance Moyenne
            </div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f39c12' }}>
              {stats.confianceMoyenne}%
            </div>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginTop: '5px' }}>
              🎯 Précision globale
            </div>
          </div>
        </div>

        {/* Graphique simple */}
        {stats.total > 0 && (
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '30px'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
              📈 Répartition des Résultats
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                flex: stats.normal,
                height: '50px',
                backgroundColor: '#27ae60',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {stats.normal} Normal
              </div>
              <div style={{
                flex: stats.cancer,
                height: '50px',
                backgroundColor: '#e74c3c',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {stats.cancer} Cancer
              </div>
            </div>
          </div>
        )}

        {/* Liste des diagnostics */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          padding: '25px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
            📋 Historique Détaillé ({diagnostics.length})
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
              Chargement...
            </div>
          ) : diagnostics.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '18px', color: '#7f8c8d' }}>
                📭 Aucune analyse pour le moment
              </p>
              <Link to="/dashboard" style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#3498db',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px'
              }}>
                Faire ma première analyse
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {diagnostics.map((diag) => (
                <div
                  key={diag.id}
                  style={{
                    border: `2px solid ${diag.resultat === 'Normal' ? '#27ae60' : '#e74c3c'}`,
                    borderRadius: '10px',
                    padding: '20px',
                    backgroundColor: diag.resultat === 'Normal' ? '#f0fdf4' : '#fef2f2',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <h4 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '20px',
                        color: diag.resultat === 'Normal' ? '#27ae60' : '#e74c3c'
                      }}>
                        {diag.resultat === 'Normal' ? '✅' : '⚠️'} {diag.resultat}
                      </h4>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '14px' }}>
                        📅 {new Date(diag.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
                        👨‍⚕️ {diag.medecin || 'Médecin non assigné'}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: diag.resultat === 'Normal' ? '#dcfce7' : '#fee2e2',
                      color: diag.resultat === 'Normal' ? '#166534' : '#991b1b',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {diag.confiance}% confiance
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Description :</strong>
                    </p>
                    <p style={{ margin: 0, color: '#2c3e50' }}>
                      {diag.description}
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: diag.resultat === 'Normal' ? '#dcfce7' : '#fef3c7',
                    padding: '15px',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${diag.resultat === 'Normal' ? '#27ae60' : '#f59e0b'}`
                  }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>
                      💡 Recommandation :
                    </p>
                    <p style={{ margin: 0 }}>
                      {diag.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bouton d'action */}
        <div style={{ 
          marginTop: '30px', 
          marginBottom: '50px',
          textAlign: 'center'
        }}>
          <Link to="/dashboard" style={{
            display: 'inline-block',
            padding: '15px 40px',
            backgroundColor: '#3498db',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            ➕ Nouvelle Analyse
          </Link>
        </div>
      </div>
    </div>
  );
}