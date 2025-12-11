// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <div className="home-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="home-title">Système de Classification</h1>
          <h2 className="home-subtitle">Cancer du Poumon</h2>
          <p className="home-description">
            Plateforme médicale avancée utilisant l'intelligence artificielle
          </p>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="feature-title">IA Avancée</h3>
            <p className="feature-text">Détection précise avec deep learning</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="feature-title">Diagnostic Rapide</h3>
            <p className="feature-text">Résultats en quelques secondes</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="feature-title">Sécurisé</h3>
            <p className="feature-text">Conforme RGPD et HIPAA</p>
          </div>
        </div>

        <div className="home-buttons">
          <Link to="/register" className="btn-primary">
            S'inscrire Gratuitement
          </Link>
          <Link to="/login" className="btn-secondary">
            Se Connecter
          </Link>
        </div>

        <div className="home-stats">
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Précision IA</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">500+</div>
            <div className="stat-label">Médecins</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10k+</div>
            <div className="stat-label">Diagnostics</div>
          </div>
        </div>
      </div>
    </div>
  );
}