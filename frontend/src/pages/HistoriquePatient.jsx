// src/pages/HistoriquePatient.jsx - STYLE MODERNE INTÉGRÉ
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ReportGenerator from '../components/ReportGenerator';

export default function HistoriquePatient() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
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

  if (!user) {
    return (
      <div style={styles.loading}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <div>
            <h1 style={styles.navbarTitle}>
              🫁 Cancer Poumon AI
            </h1>
            <p style={styles.navbarSubtitle}>
              Mon Historique Médical
            </p>
          </div>
          
          <div style={styles.navbarActions}>
            <div style={styles.userInfo}>
              <p style={styles.userName}>
                {user.prenom} {user.nom}
              </p>
              <p style={styles.userRole}>Patient</p>
            </div>
            <Link to="/dashboard" style={styles.btnDashboard}>
              ← Dashboard
            </Link>
            <button onClick={handleLogout} style={styles.btnLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={styles.content}>
        {/* HEADER */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>
            📊 Mon Suivi Médical
          </h2>
          <p style={styles.pageSubtitle}>
            Historique complet de vos analyses pulmonaires
          </p>
          {user.medecin_nom && (
            <div style={styles.medecinCard}>
              <span style={styles.medecinIcon}>👨‍⚕️</span>
              <div>
                <p style={styles.medecinLabel}>Votre médecin traitant</p>
                <p style={styles.medecinName}>{user.medecin_nom}</p>
                <p style={styles.medecinSpecialite}>{user.medecin_specialite}</p>
              </div>
            </div>
          )}
        </div>

        {/* STATS CARDS */}
        <div style={styles.statsCards}>
          <div style={{...styles.statCard, borderTopColor: '#667eea'}}>
            <div style={styles.statLabel}>Total des Scans</div>
            <div style={styles.statNumber}>{stats.total}</div>
            <div style={styles.statSubtitle}>📊 Analyses effectuées</div>
          </div>

          <div style={{...styles.statCard, borderTopColor: '#27ae60'}}>
            <div style={styles.statLabel}>Scans Normaux</div>
            <div style={styles.statNumber}>{stats.normal}</div>
            <div style={styles.statSubtitle}>
              ✅ {stats.total > 0 ? ((stats.normal / stats.total) * 100).toFixed(1) : 0}% des analyses
            </div>
          </div>

          <div style={{...styles.statCard, borderTopColor: '#e74c3c'}}>
            <div style={styles.statLabel}>Détections Cancer</div>
            <div style={stats.statNumber}>{stats.cancer}</div>
            <div style={styles.statSubtitle}>
              ⚠️ {stats.total > 0 ? ((stats.cancer / stats.total) * 100).toFixed(1) : 0}% des analyses
            </div>
          </div>

          <div style={{...styles.statCard, borderTopColor: '#f39c12'}}>
            <div style={styles.statLabel}>Confiance Moyenne</div>
            <div style={styles.statNumber}>{stats.confianceMoyenne}%</div>
            <div style={styles.statSubtitle}>🎯 Précision globale</div>
          </div>
        </div>

        {/* RÉPARTITION */}
        {stats.total > 0 && (
          <div style={styles.repartitionCard}>
            <h3 style={styles.repartitionTitle}>
              📈 Répartition des Résultats
            </h3>
            <div style={styles.repartitionBar}>
              {stats.normal > 0 && (
                <div style={{
                  flex: stats.normal,
                  height: '60px',
                  background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '16px',
                  boxShadow: '0 6px 20px rgba(39, 174, 96, 0.4)'
                }}>
                  {stats.normal} Normal
                </div>
              )}
              {stats.cancer > 0 && (
                <div style={{
                  flex: stats.cancer,
                  height: '60px',
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '16px',
                  boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)'
                }}>
                  {stats.cancer} Cancer
                </div>
              )}
            </div>
          </div>
        )}

        {/* DIAGNOSTICS LIST */}
        <div style={styles.diagnosticsContainer}>
          <h3 style={styles.diagnosticsTitle}>
            📋 Historique Détaillé ({diagnostics.length})
          </h3>

          {loading ? (
            <div style={styles.loading}>
              Chargement...
            </div>
          ) : diagnostics.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>
                Aucune analyse pour le moment
              </p>
              <Link to="/dashboard" style={styles.btnPrimary}>
                Faire ma première analyse
              </Link>
            </div>
          ) : (
            <div style={styles.diagnosticsList}>
              {diagnostics.map((diag) => (
                <div key={diag.id}>
                  <div
                    style={{
                      ...styles.diagnosticCard,
                      ...(diag.resultat === 'Normal' ? styles.diagnosticCardNormal : styles.diagnosticCardCancer)
                    }}
                  >
                    <div style={styles.diagnosticHeader}>
                      <div>
                        <h4 style={{
                          ...styles.diagnosticResult,
                          ...(diag.resultat === 'Normal' ? styles.diagnosticResultNormal : styles.diagnosticResultCancer)
                        }}>
                          {diag.resultat === 'Normal' ? '✅' : '⚠️'} {diag.resultat}
                        </h4>
                        <p style={styles.diagnosticDate}>
                          📅 {new Date(diag.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p style={styles.diagnosticMedecin}>
                          👨‍⚕️ {diag.medecin || 'Médecin non assigné'}
                        </p>
                      </div>
                      <div style={{
                        ...styles.confidenceBadge,
                        ...(diag.resultat === 'Normal' ? styles.confidenceBadgeNormal : styles.confidenceBadgeCancer)
                      }}>
                        {diag.confiance}% confiance
                      </div>
                    </div>

                    <div style={styles.diagnosticBody}>
                      <div style={styles.diagnosticSection}>
                        <strong>Description :</strong>
                        <p>{diag.description}</p>
                      </div>

                      <div style={{
                        ...styles.recommendationBox,
                        ...(diag.resultat === 'Normal' ? styles.recommendationBoxNormal : styles.recommendationBoxWarning)
                      }}>
                        <strong>💡 Recommandation :</strong>
                        <p>{diag.recommendation}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedDiagnostic(selectedDiagnostic?.id === diag.id ? null : diag)}
                      style={{
                        ...styles.btnReport,
                        ...(selectedDiagnostic?.id === diag.id ? styles.btnReportActive : {})
                      }}
                    >
                      {selectedDiagnostic?.id === diag.id ? '▲ Masquer les options de rapport' : '📄 Générer un rapport détaillé'}
                    </button>
                  </div>

                  {selectedDiagnostic?.id === diag.id && (
                    <div style={styles.reportZone}>
                      <ReportGenerator
                        result={prepareResultForReport(diag)}
                        user={user}
                        selectedPatient={null}
                        diagnosticId={diag.id}
                        signature={null}
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

        {/* BOUTON NOUVELLE ANALYSE */}
        <div style={styles.bottomAction}>
          <Link to="/dashboard" style={styles.btnNewAnalysis}>
            ➕ Nouvelle Analyse
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== STYLES ====================
const styles = {
  // CONTAINER
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    position: 'relative',
    fontFamily: 'Arial, sans-serif'
  },

  // NAVBAR
  navbar: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    marginBottom: '40px',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },

  navbarContent: {
    maxWidth: '1800px',
    margin: '0 auto',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  navbarTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '900',
    color: '#1a1a2e',
    letterSpacing: '-1px'
  },

  navbarSubtitle: {
    margin: '5px 0 0 0',
    fontSize: '0.95rem',
    color: '#6b7280',
    fontWeight: '600'
  },

  navbarActions: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },

  userInfo: {
    textAlign: 'right',
    marginRight: '20px'
  },

  userName: {
    margin: 0,
    fontWeight: '800',
    color: '#1a1a2e',
    fontSize: '1.1rem'
  },

  userRole: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#6b7280',
    fontWeight: '600'
  },

  btnDashboard: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    fontWeight: '800',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },

  btnLogout: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: '800',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white'
  },

  // CONTENT
  content: {
    maxWidth: '1800px',
    margin: '0 auto',
    padding: '0 30px 60px 30px',
    position: 'relative',
    zIndex: 1
  },

  pageHeader: {
    marginBottom: '40px',
    animation: 'fadeInDown 0.8s ease-out'
  },

  pageTitle: {
    fontSize: '3.5rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #fff 0%, #a8b8ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: '0 0 15px 0',
    letterSpacing: '-2px'
  },

  pageSubtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255, 255, 255, 0.85)',
    margin: '0 0 20px 0',
    fontWeight: '400'
  },

  medecinCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '25px',
    borderRadius: '20px',
    marginTop: '20px',
    boxShadow: '0 15px 50px rgba(102, 126, 234, 0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },

  medecinIcon: {
    fontSize: '3rem'
  },

  medecinLabel: {
    margin: 0,
    opacity: 0.95,
    fontSize: '0.9rem',
    fontWeight: '700'
  },

  medecinName: {
    margin: '8px 0',
    fontSize: '1.5rem',
    fontWeight: '900'
  },

  medecinSpecialite: {
    margin: 0,
    opacity: 0.95,
    fontSize: '0.95rem',
    fontWeight: '400'
  },

  // STATS
  statsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
    marginBottom: '40px'
  },

  statCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    padding: '35px',
    borderRadius: '24px',
    boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
    borderTop: '6px solid',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden'
  },

  statLabel: {
    fontSize: '0.9rem',
    color: '#6b7280',
    marginBottom: '15px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },

  statNumber: {
    fontSize: '4rem',
    fontWeight: '900',
    color: '#1a1a2e',
    margin: '15px 0',
    lineHeight: 1
  },

  statSubtitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  // RÉPARTITION
  repartitionCard: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    padding: '35px',
    borderRadius: '24px',
    boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
    marginBottom: '40px'
  },

  repartitionTitle: {
    marginBottom: '25px',
    color: '#1a1a2e',
    fontSize: '1.5rem',
    fontWeight: '900'
  },

  repartitionBar: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },

  // DIAGNOSTICS
  diagnosticsContainer: {
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '35px',
    boxShadow: '0 15px 50px rgba(0,0,0,0.2)'
  },

  diagnosticsTitle: {
    marginBottom: '25px',
    color: '#1a1a2e',
    fontSize: '1.5rem',
    fontWeight: '900'
  },

  diagnosticsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },

  diagnosticCard: {
    border: '3px solid',
    borderRadius: '20px',
    padding: '30px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    position: 'relative',
    overflow: 'hidden',
    background: 'white'
  },

  diagnosticCardNormal: {
    borderColor: '#27ae60',
    background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.05) 0%, rgba(46, 204, 113, 0.05) 100%)'
  },

  diagnosticCardCancer: {
    borderColor: '#e74c3c',
    background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.05) 0%, rgba(192, 57, 43, 0.05) 100%)'
  },

  diagnosticHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '2px solid rgba(0, 0, 0, 0.08)'
  },

  diagnosticResult: {
    fontSize: '1.8rem',
    margin: '0 0 12px 0',
    fontWeight: '900',
    letterSpacing: '-0.5px'
  },

  diagnosticResultNormal: {
    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  diagnosticResultCancer: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  diagnosticDate: {
    color: '#6b7280',
    fontSize: '0.95rem',
    margin: '0 0 8px 0',
    fontWeight: '700'
  },

  diagnosticMedecin: {
    color: '#6b7280',
    fontSize: '0.95rem',
    margin: '5px 0 0 0',
    fontWeight: '600'
  },

  confidenceBadge: {
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '900',
    color: 'white',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  confidenceBadgeNormal: {
    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'
  },

  confidenceBadgeCancer: {
    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
  },

  diagnosticBody: {
    background: 'rgba(249, 250, 251, 0.5)',
    padding: '20px',
    borderRadius: '14px',
    marginBottom: '20px'
  },

  diagnosticSection: {
    marginBottom: '18px',
    fontSize: '0.95rem',
    lineHeight: '1.7'
  },

  recommendationBox: {
    padding: '20px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    marginTop: '15px'
  },

  recommendationBoxNormal: {
    background: 'rgba(39, 174, 96, 0.1)',
    borderLeftColor: '#27ae60'
  },

  recommendationBoxWarning: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderLeftColor: '#f59e0b'
  },

  btnReport: {
    width: '100%',
    padding: '16px 24px',
    border: 'none',
    borderRadius: '14px',
    fontSize: '1rem',
    fontWeight: '900',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  btnReportActive: {
    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
  },

  reportZone: {
    marginTop: '20px',
    padding: '25px',
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
  },

  // EMPTY STATE
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    background: 'rgba(249, 250, 251, 0.5)',
    borderRadius: '24px',
    border: '2px dashed rgba(102, 126, 234, 0.3)'
  },

  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '20px',
    opacity: 0.6
  },

  emptyText: {
    fontSize: '1.3rem',
    marginBottom: '25px',
    fontWeight: '800',
    color: '#1a1a2e'
  },

  btnPrimary: {
    display: 'inline-block',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '14px',
    fontSize: '1.1rem',
    fontWeight: '900',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },

  // LOADING
  loading: {
    textAlign: 'center',
    padding: '60px',
    color: '#6b7280',
    fontSize: '1.3rem',
    fontWeight: '800'
  },

  // BOTTOM ACTION
  bottomAction: {
    marginTop: '40px',
    marginBottom: '30px',
    textAlign: 'center'
  },

  btnNewAnalysis: {
    display: 'inline-block',
    padding: '18px 50px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '14px',
    fontSize: '1.2rem',
    fontWeight: '900',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};