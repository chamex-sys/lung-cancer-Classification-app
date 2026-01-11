// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/SignatureManagement.css';
// import ReportGenerator from '../components/ReportGenerator';
// import ElectronicSignature from '../components/ElectronicSignature';

// export default function SignatureManagement() {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [activeTab, setActiveTab] = useState('en_attente');
//   const [diagnostics, setDiagnostics] = useState({ en_attente: [], signes: [] });
//   const [loading, setLoading] = useState(true);
//   const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
//   const [showSignatureFor, setShowSignatureFor] = useState(null);

//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     if (!userData) {
//       navigate('/login');
//       return;
//     }

//     const parsed = JSON.parse(userData);
//     setUser(parsed);

//     if (parsed.role !== 'medecin') {
//       navigate('/dashboard');
//       return;
//     }

//     loadDiagnostics(parsed.id);
//   }, [navigate]);

//   const loadDiagnostics = async (medecinId) => {
//     setLoading(true);
//     try {
//       console.log('🔄 Chargement diagnostics pour médecin:', medecinId);
      
//       const res = await axios.get(
//         `http://localhost/lung-cancer-api/api/diagnostics.php?medecin_id=${medecinId}`
//       );

//       console.log('📥 Réponse API:', res.data);

//       if (res.data.success) {
//         setDiagnostics({
//           en_attente: res.data.en_attente || [],
//           signes: res.data.signes || []
//         });
        
//         console.log('✅ En attente:', res.data.en_attente?.length || 0);
//         console.log('✅ Signés:', res.data.signes?.length || 0);
//       } else {
//         console.error('❌ Erreur API:', res.data.message);
//         alert('Erreur: ' + res.data.message);
//       }
//     } catch (err) {
//       console.error('❌ Erreur chargement diagnostics:', err);
//       alert('Erreur lors du chargement des diagnostics');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignatureComplete = async (signature, diagnosticId) => {
//     try {
//       console.log('💾 Sauvegarde signature pour diagnostic:', diagnosticId);
      
//       const res = await axios.put(
//         'http://localhost/lung-cancer-api/api/diagnostics.php',
//         {
//           id: diagnosticId,
//           signature_medecin: signature
//         }
//       );

//       if (res.data.success) {
//         alert('✅ Signature enregistrée avec succès !');
//         setShowSignatureFor(null);
//         loadDiagnostics(user.id);
//       } else {
//         alert('❌ Erreur: ' + (res.data.message || 'Erreur inconnue'));
//       }
//     } catch (err) {
//       console.error('❌ Erreur signature:', err);
//       alert('❌ Erreur lors de la sauvegarde de la signature');
//     }
//   };

//   const prepareResultForReport = (diag) => {
//     return {
//       class: diag.resultat,
//       confidence: parseFloat(diag.confiance),
//       description: diag.description,
//       recommendation: diag.recommendation,
//       color: diag.resultat === 'Normal' ? 'success' : 'danger',
//       probabilities: {
//         cancer: diag.resultat === 'Cancer' ? parseFloat(diag.confiance) / 100 : 1 - (parseFloat(diag.confiance) / 100),
//         normal: diag.resultat === 'Normal' ? parseFloat(diag.confiance) / 100 : 1 - (parseFloat(diag.confiance) / 100)
//       },
//       risk_level: diag.resultat === 'Cancer' ? 'Élevé' : 'Faible'
//     };
//   };

//   if (!user) return null;

//   const currentDiagnostics = diagnostics[activeTab] || [];

//   return (
//     <div className="signature-management">
//       <nav className="navbar">
//         <div className="navbar-content">
//           <div>
//             <h1>🏥 MediCare Diagnostics</h1>
//             <p>Système de Gestion des Signatures</p>
//           </div>
          
//           <div className="navbar-actions">
//             <div className="user-info">
//               <p className="user-name">Dr. {user.prenom} {user.nom}</p>
//               <p className="user-role">{user.specialite || 'Médecin'}</p>
//             </div>
//             <Link to="/dashboard" className="btn-dashboard">
//               ← Dashboard
//             </Link>
//             <button 
//               onClick={() => {
//                 localStorage.removeItem('user');
//                 navigate('/login');
//               }} 
//               className="btn-logout"
//             >
//               🚪 Déconnexion
//             </button>
//           </div>
//         </div>
//       </nav>

//       <div className="content">
//         <header className="page-header">
//           <h2>📋 Gestion des Signatures</h2>
//           <p>Signez les diagnostics de vos patients</p>
//         </header>

//         {/* Statistiques */}
//         <div className="stats-cards">
//           <div className="stat-card pending">
//             <div className="stat-label">En Attente de Signature</div>
//             <div className="stat-number">{diagnostics.en_attente.length}</div>
//             <div className="stat-subtitle">⏳ Diagnostics à signer</div>
//           </div>

//           <div className="stat-card signed">
//             <div className="stat-label">Diagnostics Signés</div>
//             <div className="stat-number">{diagnostics.signes.length}</div>
//             <div className="stat-subtitle">✅ Signés et validés</div>
//           </div>

//           <div className="stat-card total">
//             <div className="stat-label">Total Diagnostics</div>
//             <div className="stat-number">
//               {diagnostics.en_attente.length + diagnostics.signes.length}
//             </div>
//             <div className="stat-subtitle">📊 Tous vos diagnostics</div>
//           </div>
//         </div>

//         {/* Onglets */}
//         <div className="tabs">
//           <button
//             className={`tab ${activeTab === 'en_attente' ? 'active' : ''}`}
//             onClick={() => setActiveTab('en_attente')}
//           >
//             ⏳ En Attente ({diagnostics.en_attente.length})
//           </button>
//           <button
//             className={`tab ${activeTab === 'signes' ? 'active' : ''}`}
//             onClick={() => setActiveTab('signes')}
//           >
//             ✅ Signés ({diagnostics.signes.length})
//           </button>
//         </div>

//         {/* Liste des diagnostics */}
//         <div className="diagnostics-container">
//           {loading ? (
//             <div className="loading">Chargement...</div>
//           ) : currentDiagnostics.length === 0 ? (
//             <div className="empty-state">
//               <p>
//                 {activeTab === 'en_attente' 
//                   ? '📭 Aucun diagnostic en attente de signature' 
//                   : '📭 Aucun diagnostic signé'}
//               </p>
//             </div>
//           ) : (
//             <div className="diagnostics-list">
//               {currentDiagnostics.map((diag) => (
//                 <div key={diag.id} className="diagnostic-wrapper">
//                   <div className={`diagnostic-card ${diag.resultat === 'Normal' ? 'normal' : 'cancer'}`}>
//                     {/* En-tête */}
//                     <div className="diagnostic-header">
//                       <div className="diagnostic-info">
//                         <h3 className={`diagnostic-result ${diag.resultat === 'Normal' ? 'normal' : 'cancer'}`}>
//                           {diag.resultat === 'Normal' ? '✅' : '⚠️'} {diag.resultat}
//                         </h3>
//                         <p className="patient-name">👤 {diag.patient_nom}</p>
//                         <p className="patient-email">📧 {diag.patient_email}</p>
//                         <p className="diagnostic-date">
//                           📅 {new Date(diag.date).toLocaleDateString('fr-FR', {
//                             weekday: 'long',
//                             year: 'numeric',
//                             month: 'long',
//                             day: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </p>
//                       </div>
                      
//                       <div className="diagnostic-badges">
//                         <div className={`confidence-badge ${diag.resultat === 'Normal' ? 'normal' : 'cancer'}`}>
//                           {diag.confiance}% confiance
//                         </div>
                        
//                         {diag.statut_signature === 'signe' && (
//                           <div className="status-badge signed">
//                             ✅ Signé le {new Date(diag.date_signature).toLocaleDateString('fr-FR')}
//                           </div>
//                         )}
                        
//                         {diag.statut_signature === 'en_attente' && (
//                           <div className="status-badge pending">
//                             ⏳ En attente
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Contenu */}
//                     <div className="diagnostic-body">
//                       <div className="diagnostic-section">
//                         <strong>📋 Description :</strong>
//                         <p>{diag.description}</p>
//                       </div>
                      
//                       <div className="diagnostic-section">
//                         <strong>💡 Recommandation :</strong>
//                         <p>{diag.recommendation}</p>
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="diagnostic-actions">
//                       {diag.statut_signature === 'en_attente' && (
//                         <button
//                           onClick={() => setShowSignatureFor(showSignatureFor === diag.id ? null : diag.id)}
//                           className="btn-action btn-sign"
//                         >
//                           ✍️ {showSignatureFor === diag.id ? 'Masquer' : 'Signer'}
//                         </button>
//                       )}
                      
//                       <button
//                         onClick={() => setSelectedDiagnostic(selectedDiagnostic?.id === diag.id ? null : diag)}
//                         className="btn-action btn-report"
//                       >
//                         📄 {selectedDiagnostic?.id === diag.id ? 'Masquer' : 'Rapport'}
//                       </button>
//                     </div>
//                   </div>

//                   {/* Zone de signature */}
//                   {showSignatureFor === diag.id && (
//                     <div className="signature-zone">
//                       <ElectronicSignature
//                         onSignatureComplete={(sig) => handleSignatureComplete(sig, diag.id)}
//                         doctorName={`Dr. ${user.prenom} ${user.nom}`}
//                       />
//                     </div>
//                   )}

//                   {/* Générateur de rapport */}
//                   {selectedDiagnostic?.id === diag.id && (
//                     <div className="report-zone">
//                       <ReportGenerator
//                         result={prepareResultForReport(diag)}
//                         user={user}
//                         selectedPatient={{ 
//                           prenom: diag.patient_nom.split(' ')[0], 
//                           nom: diag.patient_nom.split(' ').slice(1).join(' ') 
//                         }}
//                         diagnosticId={diag.id}
//                         signature={diag.signature_medecin}
//                         onReportGenerated={(data) => {
//                           console.log('✅ Rapport généré:', data);
//                         }}
//                       />
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// src/pages/SignatureManagement.jsx - VERSION SANS TITRE DANS HEADER
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignatureManagement.css';
import ReportGenerator from '../components/ReportGenerator';
import ElectronicSignature from '../components/ElectronicSignature';

export default function SignatureManagement() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('en_attente');
  const [diagnostics, setDiagnostics] = useState({ en_attente: [], signes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);
  const [showSignatureFor, setShowSignatureFor] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsed = JSON.parse(userData);
    setUser(parsed);

    if (parsed.role !== 'medecin') {
      navigate('/dashboard');
      return;
    }

    loadDiagnostics(parsed.id);
  }, [navigate]);

  const loadDiagnostics = async (medecinId) => {
    setLoading(true);
    try {
      console.log('🔄 Chargement diagnostics pour médecin:', medecinId);
      
      const res = await axios.get(
        `http://localhost/lung-cancer-api/api/diagnostics.php?medecin_id=${medecinId}`
      );

      console.log('📥 Réponse API:', res.data);

      if (res.data.success) {
        setDiagnostics({
          en_attente: res.data.en_attente || [],
          signes: res.data.signes || []
        });
        
        console.log('✅ En attente:', res.data.en_attente?.length || 0);
        console.log('✅ Signés:', res.data.signes?.length || 0);
      } else {
        console.error('❌ Erreur API:', res.data.message);
        alert('Erreur: ' + res.data.message);
      }
    } catch (err) {
      console.error('❌ Erreur chargement diagnostics:', err);
      alert('Erreur lors du chargement des diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureComplete = async (signature, diagnosticId) => {
    try {
      console.log('💾 Sauvegarde signature pour diagnostic:', diagnosticId);
      
      const res = await axios.put(
        'http://localhost/lung-cancer-api/api/diagnostics.php',
        {
          id: diagnosticId,
          signature_medecin: signature
        }
      );

      if (res.data.success) {
        alert('✅ Signature enregistrée avec succès !');
        setShowSignatureFor(null);
        loadDiagnostics(user.id);
      } else {
        alert('❌ Erreur: ' + (res.data.message || 'Erreur inconnue'));
      }
    } catch (err) {
      console.error('❌ Erreur signature:', err);
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

  if (!user) return null;

  const currentDiagnostics = diagnostics[activeTab] || [];

  return (
    <div className="signature-management">
      <nav className="navbar">
        <div className="navbar-content">
          <div>
            <h1>🏥 MediCare Diagnostics</h1>
            <p>Système de Gestion des Signatures</p>
          </div>
          
          <div className="navbar-actions">
            <div className="user-info">
              <p className="user-name">Dr. {user.prenom} {user.nom}</p>
              <p className="user-role">{user.specialite || 'Médecin'}</p>
            </div>
            <Link to="/dashboard" className="btn-dashboard">
              ← Dashboard
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }} 
              className="btn-logout"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="content">
        {/* ✅ SUPPRIMÉ LE PAGE-HEADER ICI */}

        {/* Statistiques */}
        <div className="stats-cards">
          <div className="stat-card pending">
            <div className="stat-label">En Attente de Signature</div>
            <div className="stat-number">{diagnostics.en_attente.length}</div>
            <div className="stat-subtitle">⏳ Diagnostics à signer</div>
          </div>

          <div className="stat-card signed">
            <div className="stat-label">Diagnostics Signés</div>
            <div className="stat-number">{diagnostics.signes.length}</div>
            <div className="stat-subtitle">✅ Signés et validés</div>
          </div>

          <div className="stat-card total">
            <div className="stat-label">Total Diagnostics</div>
            <div className="stat-number">
              {diagnostics.en_attente.length + diagnostics.signes.length}
            </div>
            <div className="stat-subtitle">📊 Tous vos diagnostics</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'en_attente' ? 'active' : ''}`}
            onClick={() => setActiveTab('en_attente')}
          >
            ⏳ En Attente ({diagnostics.en_attente.length})
          </button>
          <button
            className={`tab ${activeTab === 'signes' ? 'active' : ''}`}
            onClick={() => setActiveTab('signes')}
          >
            ✅ Signés ({diagnostics.signes.length})
          </button>
        </div>

        {/* Liste des diagnostics */}
        <div className="diagnostics-container">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : currentDiagnostics.length === 0 ? (
            <div className="empty-state">
              <p>
                {activeTab === 'en_attente' 
                  ? '📭 Aucun diagnostic en attente de signature' 
                  : '📭 Aucun diagnostic signé'}
              </p>
            </div>
          ) : (
            <div className="diagnostics-list">
              {currentDiagnostics.map((diag) => (
                <div key={diag.id} className="diagnostic-wrapper">
                  <div className={`diagnostic-card ${diag.resultat === 'Normal' ? 'normal' : 'cancer'}`}>
                    {/* En-tête */}
                    <div className="diagnostic-header">
                      <div className="diagnostic-info">
                        <h3 className={`diagnostic-result ${diag.resultat === 'Normal' ? 'normal' : 'cancer'}`}>
                          {diag.resultat === 'Normal' ? '✅' : '⚠️'} {diag.resultat}
                        </h3>
                        <p className="patient-name">👤 {diag.patient_nom}</p>
                        <p className="patient-email">📧 {diag.patient_email}</p>
                        <p className="diagnostic-date">
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
                      
                      <div className="diagnostic-badges">
                        <div className={`confidence-badge ${diag.resultat === 'Normal' ? 'normal' : 'cancer'}`}>
                          {diag.confiance}% confiance
                        </div>
                        
                        {diag.statut_signature === 'signe' && (
                          <div className="status-badge signed">
                            ✅ Signé le {new Date(diag.date_signature).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                        
                        {diag.statut_signature === 'en_attente' && (
                          <div className="status-badge pending">
                            ⏳ En attente
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="diagnostic-body">
                      <div className="diagnostic-section">
                        <strong>📋 Description :</strong>
                        <p>{diag.description}</p>
                      </div>
                      
                      <div className="diagnostic-section">
                        <strong>💡 Recommandation :</strong>
                        <p>{diag.recommendation}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="diagnostic-actions">
                      {diag.statut_signature === 'en_attente' && (
                        <button
                          onClick={() => setShowSignatureFor(showSignatureFor === diag.id ? null : diag.id)}
                          className="btn-action btn-sign"
                        >
                          ✍️ {showSignatureFor === diag.id ? 'Masquer' : 'Signer'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedDiagnostic(selectedDiagnostic?.id === diag.id ? null : diag)}
                        className="btn-action btn-report"
                      >
                        📄 {selectedDiagnostic?.id === diag.id ? 'Masquer' : 'Rapport'}
                      </button>
                    </div>
                  </div>

                  {/* Zone de signature */}
                  {showSignatureFor === diag.id && (
                    <div className="signature-zone">
                      <ElectronicSignature
                        onSignatureComplete={(sig) => handleSignatureComplete(sig, diag.id)}
                        doctorName={`Dr. ${user.prenom} ${user.nom}`}
                      />
                    </div>
                  )}

                  {/* Générateur de rapport */}
                  {selectedDiagnostic?.id === diag.id && (
                    <div className="report-zone">
                      <ReportGenerator
                        result={prepareResultForReport(diag)}
                        user={user}
                        selectedPatient={{ 
                          prenom: diag.patient_nom.split(' ')[0], 
                          nom: diag.patient_nom.split(' ').slice(1).join(' ') 
                        }}
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