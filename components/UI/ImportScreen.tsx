import React, { useState, useCallback } from 'react';
import {
  parseJSONFile,
  parseCSVFile,
  validateChapter,
  convertImportedChapter,
  generateJSONTemplate,
  generateCSVTemplate,
  downloadFile,
  ImportChapterJSON,
  ValidationResult,
} from '../../utils/importUtils';
import { Chapter } from '../../types';

interface ImportScreenProps {
  onImportSuccess: (chapters: Chapter[]) => void;
  onClose: () => void;
}

export const ImportScreen: React.FC<ImportScreenProps> = ({ onImportSuccess, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [importedChapters, setImportedChapters] = useState<ImportChapterJSON[]>([]);
  const [validationResults, setValidationResults] = useState<Map<string, ValidationResult>>(new Map());
  const [parseError, setParseError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleDownloadJSON = () => {
    const template = generateJSONTemplate();
    downloadFile(template, 'qcm-template.json', 'application/json');
  };

  const handleDownloadCSV = () => {
    const template = generateCSVTemplate();
    downloadFile(template, 'qcm-template.csv', 'text/csv');
  };

  const processFile = useCallback((file: File) => {
    setSelectedFile(file.name);
    setParseError(null);
    setImportedChapters([]);
    setValidationResults(new Map());

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      let chapters: ImportChapterJSON[] | null = null;

      // Déterminer le type de fichier
      if (file.name.endsWith('.json')) {
        chapters = parseJSONFile(content);
      } else if (file.name.endsWith('.csv')) {
        chapters = parseCSVFile(content);
      } else {
        setParseError('Format de fichier non supporté. Utilisez .json ou .csv');
        return;
      }

      if (!chapters || chapters.length === 0) {
        setParseError('Impossible de parser le fichier ou aucun chapitre trouvé');
        return;
      }

      // Valider chaque chapitre
      const results = new Map<string, ValidationResult>();
      chapters.forEach((chapter) => {
        const validation = validateChapter(chapter);
        results.set(chapter.id, validation);
      });

      setImportedChapters(chapters);
      setValidationResults(results);
    };

    reader.onerror = () => {
      setParseError('Erreur lors de la lecture du fichier');
    };

    reader.readAsText(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleImport = () => {
    // Vérifier que tous les chapitres sont valides
    const allValid = importedChapters.every((chapter) => {
      const result = validationResults.get(chapter.id);
      return result && result.valid;
    });

    if (!allValid) {
      alert('Certains chapitres contiennent des erreurs. Veuillez les corriger avant d\'importer.');
      return;
    }

    // Convertir les chapitres au format interne
    const chapters = importedChapters.map(convertImportedChapter);

    onImportSuccess(chapters);
  };

  const hasErrors = Array.from(validationResults.values()).some(r => r.errors.length > 0);
  const hasWarnings = Array.from(validationResults.values()).some(r => r.warnings.length > 0);
  const canImport = importedChapters.length > 0 && !hasErrors;

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
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '2px solid #4a9eff',
        boxShadow: '0 10px 40px rgba(74, 158, 255, 0.3)',
      }}>
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
            Importer vos Questions
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

        {/* Section Téléchargement de Templates */}
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(74, 158, 255, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(74, 158, 255, 0.3)',
        }}>
          <h3 style={{ color: '#4a9eff', marginTop: 0, marginBottom: '15px' }}>
            1. Téléchargez un template
          </h3>
          <p style={{ color: '#aaa', marginBottom: '15px', fontSize: '14px' }}>
            Téléchargez un fichier exemple pour comprendre le format attendu
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleDownloadJSON}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              📄 Télécharger Template JSON
            </button>
            <button
              onClick={handleDownloadCSV}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              📊 Télécharger Template CSV
            </button>
          </div>
        </div>

        {/* Section Upload */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#4a9eff', marginTop: 0, marginBottom: '15px' }}>
            2. Importez votre fichier
          </h3>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? '#4a9eff' : '#666'}`,
              borderRadius: '10px',
              padding: '40px',
              textAlign: 'center',
              background: isDragging ? 'rgba(74, 158, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
              <p style={{ color: '#fff', marginBottom: '5px' }}>
                {selectedFile || 'Glissez votre fichier ici ou cliquez pour sélectionner'}
              </p>
              <p style={{ color: '#888', fontSize: '12px' }}>
                Formats acceptés: .json, .csv
              </p>
            </label>
          </div>
        </div>

        {/* Erreur de parsing */}
        {parseError && (
          <div style={{
            padding: '15px',
            background: 'rgba(255, 82, 82, 0.2)',
            border: '1px solid #ff5252',
            borderRadius: '8px',
            color: '#ff5252',
            marginBottom: '20px',
          }}>
            <strong>❌ Erreur:</strong> {parseError}
          </div>
        )}

        {/* Résultats de validation */}
        {importedChapters.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#4a9eff', marginTop: 0, marginBottom: '15px' }}>
              3. Vérification des chapitres
            </h3>
            {importedChapters.map((chapter) => {
              const validation = validationResults.get(chapter.id);
              if (!validation) return null;

              const isValid = validation.valid;
              const borderColor = isValid ? '#4caf50' : '#ff5252';
              const bgColor = isValid ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 82, 82, 0.1)';

              return (
                <div
                  key={chapter.id}
                  style={{
                    padding: '15px',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '20px', marginRight: '10px' }}>
                      {isValid ? '✅' : '❌'}
                    </span>
                    <div>
                      <strong style={{ color: '#fff' }}>{chapter.titre}</strong>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>
                        Mot cible: {chapter.motCible} ({chapter.questions.length} questions)
                      </div>
                    </div>
                  </div>

                  {validation.errors.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {validation.errors.map((error, index) => (
                        <div key={index} style={{ color: '#ff5252', fontSize: '13px', marginTop: '5px' }}>
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}

                  {validation.warnings.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      {validation.warnings.map((warning, index) => (
                        <div key={index} style={{ color: '#ffb74d', fontSize: '13px', marginTop: '5px' }}>
                          ⚠️ {warning}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Boutons d'action */}
        {importedChapters.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 30px',
                background: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={!canImport}
              style={{
                padding: '12px 30px',
                background: canImport
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#333',
                color: canImport ? 'white' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: canImport ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
              }}
            >
              Importer {importedChapters.length} chapitre(s)
            </button>
          </div>
        )}

        {/* Format Attendu */}
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#aaa',
        }}>
          <strong style={{ color: '#fff' }}>📋 Format attendu:</strong>
          <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '20px' }}>
            <li>Le nombre de questions DOIT égaler la longueur du mot cible</li>
            <li>Chaque question doit avoir exactement 3 réponses</li>
            <li>L'index de la réponse correcte doit être 0, 1 ou 2</li>
            <li>Tous les champs obligatoires doivent être remplis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
