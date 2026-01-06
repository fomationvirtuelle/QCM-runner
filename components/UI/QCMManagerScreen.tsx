import React, { useState } from 'react';
import { useStore } from '../../store';
import { ImportScreen } from './ImportScreen';
import { QCMSet, generateQCMId } from '../../utils/storageUtils';
import { Chapter } from '../../types';

interface QCMManagerScreenProps {
  onClose: () => void;
}

export const QCMManagerScreen: React.FC<QCMManagerScreenProps> = ({ onClose }) => {
  const [showImport, setShowImport] = useState(false);

  const availableQCMs = useStore(state => state.availableQCMs);
  const activeQCMId = useStore(state => state.activeQCMId);
  const setActiveQCM = useStore(state => state.setActiveQCM);
  const addCustomQCM = useStore(state => state.addCustomQCM);
  const removeCustomQCM = useStore(state => state.removeCustomQCM);

  const handleImportSuccess = (chapters: Chapter[]) => {
    // Créer un nouveau QCM à partir des chapitres importés
    const newQCM: QCMSet = {
      id: generateQCMId(),
      name: `QCM Personnalisé ${new Date().toLocaleDateString()}`,
      description: `${chapters.length} chapitre(s) importé(s)`,
      chapters,
      createdAt: Date.now(),
      isDefault: false,
    };

    addCustomQCM(newQCM);
    setActiveQCM(newQCM.id);
    setShowImport(false);

    alert(`QCM "${newQCM.name}" importé avec succès !`);
  };

  const handleSelectQCM = (qcmId: string) => {
    setActiveQCM(qcmId);
  };

  const handleDeleteQCM = (qcmId: string, qcmName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le QCM "${qcmName}" ?`)) {
      removeCustomQCM(qcmId);
    }
  };

  if (showImport) {
    return (
      <ImportScreen
        onImportSuccess={handleImportSuccess}
        onClose={() => setShowImport(false)}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '2px solid #4a9eff',
        boxShadow: '0 10px 40px rgba(74, 158, 255, 0.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#fff',
          }}>
            Gestion des QCM
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Bouton Importer */}
        <div style={{ marginBottom: '30px' }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '24px' }}>+</span>
            Importer un nouveau QCM
          </button>
        </div>

        {/* Liste des QCM */}
        <div>
          <h3 style={{
            color: '#4a9eff',
            marginTop: 0,
            marginBottom: '20px',
            fontSize: '20px',
          }}>
            QCM disponibles ({availableQCMs.length})
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}>
            {availableQCMs.map((qcm) => {
              const isActive = qcm.id === activeQCMId;

              return (
                <div
                  key={qcm.id}
                  style={{
                    padding: '20px',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isActive ? '2px solid #667eea' : '1px solid #333',
                    borderRadius: '10px',
                    position: 'relative',
                  }}
                >
                  {/* Badge Actif */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#667eea',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                      ✓ ACTIF
                    </div>
                  )}

                  {/* Badge Par Défaut */}
                  {qcm.isDefault && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(74, 158, 255, 0.3)',
                      color: '#4a9eff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                      PAR DÉFAUT
                    </div>
                  )}

                  {/* Informations du QCM */}
                  <div style={{ marginBottom: '15px', paddingTop: qcm.isDefault ? '20px' : '0' }}>
                    <h4 style={{
                      color: '#fff',
                      margin: '0 0 5px 0',
                      fontSize: '18px',
                    }}>
                      {qcm.name}
                    </h4>
                    <p style={{
                      color: '#aaa',
                      margin: '0 0 10px 0',
                      fontSize: '14px',
                    }}>
                      {qcm.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '15px',
                      fontSize: '13px',
                      color: '#888',
                    }}>
                      <span>📚 {qcm.chapters.length} chapitre(s)</span>
                      <span>
                        📝 {qcm.chapters.reduce((sum, ch) => sum + ch.questions.length, 0)} question(s)
                      </span>
                      {!qcm.isDefault && (
                        <span>📅 {new Date(qcm.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Chapitres */}
                  <div style={{
                    marginBottom: '15px',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '5px',
                  }}>
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                      Chapitres disponibles:
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}>
                      {qcm.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          style={{
                            padding: '5px 10px',
                            background: 'rgba(74, 158, 255, 0.2)',
                            borderRadius: '5px',
                            fontSize: '12px',
                            color: '#4a9eff',
                          }}
                        >
                          {chapter.targetWord}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                  }}>
                    {!isActive && (
                      <button
                        onClick={() => handleSelectQCM(qcm.id)}
                        style={{
                          padding: '8px 20px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px',
                        }}
                      >
                        Sélectionner
                      </button>
                    )}

                    {!qcm.isDefault && (
                      <button
                        onClick={() => handleDeleteQCM(qcm.id, qcm.name)}
                        style={{
                          padding: '8px 20px',
                          background: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px',
                        }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bouton Fermer */}
        <div style={{
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 40px',
              background: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
