// src/components/ReportEditor.jsx
import { useState } from 'react';
import axios from 'axios';

export default function ReportEditor({ diagnostic, onSaved, onCancel }) {
  const [editedData, setEditedData] = useState({
    description: diagnostic.description || '',
    recommendation: diagnostic.recommendation || '',
    resultat: diagnostic.resultat || '',
    confiance: diagnostic.confiance || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await axios.put(
        'http://localhost/lung-cancer-api/api/diagnostics.php',
        {
          id: diagnostic.id,
          ...editedData
        }
      );

      if (response.data.success) {
        alert('✅ Diagnostic mis à jour avec succès !');
        if (onSaved) {
          onSaved({ ...diagnostic, ...editedData });
        }
      } else {
        setError(response.data.message || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      marginTop: '20px',
      border: '2px solid #f39c12'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>
          ✏️ Éditer le Diagnostic
        </h3>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕ Annuler
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '6px',
          color: '#c33',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Résultat du diagnostic
          </label>
          <select
            name="resultat"
            value={editedData.resultat}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="Normal">Normal</option>
            <option value="Cancer">Cancer</option>
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Niveau de confiance (%)
          </label>
          <input
            type="number"
            name="confiance"
            value={editedData.confiance}
            onChange={handleChange}
            min="0"
            max="100"
            step="0.01"
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Description clinique
          </label>
          <textarea
            name="description"
            value={editedData.description}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            Recommandations médicales
          </label>
          <textarea
            name="recommendation"
            value={editedData.recommendation}
            onChange={handleChange}
            rows={4}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px',
            backgroundColor: saving ? '#95a5a6' : '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {saving ? '💾 Sauvegarde...' : '💾 Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}