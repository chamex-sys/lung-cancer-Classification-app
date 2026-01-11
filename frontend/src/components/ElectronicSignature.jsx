// src/components/ElectronicSignature.jsx
import { useState, useRef, useEffect } from 'react';

export default function ElectronicSignature({ onSignatureComplete, doctorName }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState(null);
  const canvasRef = useRef(null);
  const [showCanvas, setShowCanvas] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    setSignature(signatureData);
    setShowCanvas(false);
    
    if (onSignatureComplete) {
      onSignatureComplete(signatureData);
    }
  };

  const resetSignature = () => {
    setShowCanvas(true);
    setSignature(null);
    clearSignature();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      marginTop: '20px',
      border: '2px solid #3498db'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
        ✍️ Signature Électronique
      </h3>

      {showCanvas ? (
        <>
          <div style={{
            border: '2px dashed #3498db',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            marginBottom: '15px'
          }}>
            <canvas
              ref={canvasRef}
              width={500}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'crosshair',
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '500px',
                height: '200px'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center'
          }}>
            <button
              onClick={clearSignature}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🗑️ Effacer
            </button>
            <button
              onClick={saveSignature}
              style={{
                padding: '10px 20px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✅ Confirmer la signature
            </button>
          </div>

          <p style={{
            marginTop: '15px',
            fontSize: '12px',
            color: '#7f8c8d',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            Signez dans la zone ci-dessus avec votre souris ou votre doigt
          </p>
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '2px solid #27ae60'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#155724' }}>
              ✅ Signature enregistrée
            </p>
            {doctorName && (
              <p style={{ margin: 0, color: '#155724' }}>
                Signé par: <strong>{doctorName}</strong>
              </p>
            )}
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#155724' }}>
              Date: {new Date().toLocaleString('fr-FR')}
            </p>
          </div>
          
          <div style={{
            marginBottom: '15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            padding: '10px',
            backgroundColor: 'white',
            display: 'inline-block'
          }}>
            <img
              src={signature}
              alt="Signature"
              style={{
                maxWidth: '300px',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          <button
            onClick={resetSignature}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Modifier la signature
          </button>
        </div>
      )}
    </div>
  );
}

