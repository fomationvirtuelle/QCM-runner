import { Chapter, Question } from '../types';

// Format de fichier attendu pour l'import JSON
export interface ImportChapterJSON {
  id: string;
  titre: string;
  description: string;
  motCible: string; // Le mot à épeler (ex: "PESTEL")
  questions: ImportQuestionJSON[];
}

export interface ImportQuestionJSON {
  notion: string; // Concept (ex: "Politique")
  question: string;
  reponses: string[]; // Exactement 3 réponses
  reponseCorrecte: number; // Index de la bonne réponse (0, 1 ou 2)
  explication: string; // Explication affichée en cas d'erreur
}

// Format CSV attendu
// Chaque ligne représente une question
// Format: Chapitre ID,Titre,Description,MotCible,Notion,Question,Réponse1,Réponse2,Réponse3,IndexCorrect,Explication

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valide la structure d'un chapitre importé
 */
export function validateChapter(chapter: ImportChapterJSON): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation de base
  if (!chapter.id || chapter.id.trim() === '') {
    errors.push('Le chapitre doit avoir un ID');
  }

  if (!chapter.titre || chapter.titre.trim() === '') {
    errors.push('Le chapitre doit avoir un titre');
  }

  if (!chapter.motCible || chapter.motCible.trim() === '') {
    errors.push('Le chapitre doit avoir un mot cible');
  }

  const motCible = chapter.motCible?.toUpperCase() || '';
  const motCibleLength = motCible.length;

  if (motCibleLength === 0) {
    errors.push('Le mot cible ne peut pas être vide');
  }

  if (!chapter.questions || !Array.isArray(chapter.questions)) {
    errors.push('Le chapitre doit contenir un tableau de questions');
    return { valid: false, errors, warnings };
  }

  // CONTRAINTE CRITIQUE: Nombre de questions = longueur du mot cible
  if (chapter.questions.length !== motCibleLength) {
    errors.push(
      `Le nombre de questions (${chapter.questions.length}) doit égaler la longueur du mot cible "${motCible}" (${motCibleLength} lettres)`
    );
  }

  // Validation de chaque question
  chapter.questions.forEach((q, index) => {
    const prefix = `Question ${index + 1}:`;

    if (!q.notion || q.notion.trim() === '') {
      errors.push(`${prefix} La notion ne peut pas être vide`);
    }

    if (!q.question || q.question.trim() === '') {
      errors.push(`${prefix} Le texte de la question ne peut pas être vide`);
    }

    if (!q.reponses || !Array.isArray(q.reponses)) {
      errors.push(`${prefix} Les réponses doivent être un tableau`);
    } else if (q.reponses.length !== 3) {
      errors.push(`${prefix} Il doit y avoir exactement 3 réponses (actuellement ${q.reponses.length})`);
    } else {
      // Vérifier que les réponses ne sont pas vides
      q.reponses.forEach((reponse, rIndex) => {
        if (!reponse || reponse.trim() === '') {
          errors.push(`${prefix} La réponse ${rIndex + 1} ne peut pas être vide`);
        }
      });
    }

    if (typeof q.reponseCorrecte !== 'number') {
      errors.push(`${prefix} L'index de la réponse correcte doit être un nombre`);
    } else if (q.reponseCorrecte < 0 || q.reponseCorrecte > 2) {
      errors.push(`${prefix} L'index de la réponse correcte doit être 0, 1 ou 2 (actuellement ${q.reponseCorrecte})`);
    }

    if (!q.explication || q.explication.trim() === '') {
      warnings.push(`${prefix} Il est recommandé de fournir une explication`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convertit un chapitre importé au format interne
 */
export function convertImportedChapter(imported: ImportChapterJSON): Chapter {
  const questions: Question[] = imported.questions.map((q, index) => ({
    id: `${imported.id}-q${index + 1}`,
    notion: q.notion,
    question: q.question,
    options: q.reponses,
    correctIndex: q.reponseCorrecte,
    explanation: q.explication || 'Aucune explication fournie.',
  }));

  return {
    id: imported.id,
    title: imported.titre,
    description: imported.description || '',
    targetWord: imported.motCible.toUpperCase(),
    questions,
  };
}

/**
 * Parse un fichier JSON
 */
export function parseJSONFile(content: string): ImportChapterJSON[] | null {
  try {
    const parsed = JSON.parse(content);

    // Si c'est un seul chapitre, on le met dans un tableau
    if (!Array.isArray(parsed)) {
      return [parsed];
    }

    return parsed;
  } catch (error) {
    console.error('Erreur de parsing JSON:', error);
    return null;
  }
}

/**
 * Parse un fichier CSV
 * Format: ChapitreID,Titre,Description,MotCible,Notion,Question,Réponse1,Réponse2,Réponse3,IndexCorrect,Explication
 */
export function parseCSVFile(content: string): ImportChapterJSON[] | null {
  try {
    const lines = content.split('\n').filter(line => line.trim() !== '');

    // Ignorer la ligne d'en-tête
    const dataLines = lines.slice(1);

    if (dataLines.length === 0) {
      return null;
    }

    // Grouper les questions par chapitre
    const chaptersMap = new Map<string, ImportChapterJSON>();

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      const parts = parseCSVLine(line);

      if (parts.length < 11) {
        console.error(`Ligne ${i + 2}: Format invalide (${parts.length} colonnes au lieu de 11)`);
        continue;
      }

      const [
        chapitreId,
        titre,
        description,
        motCible,
        notion,
        question,
        reponse1,
        reponse2,
        reponse3,
        indexCorrectStr,
        explication,
      ] = parts;

      const indexCorrect = parseInt(indexCorrectStr, 10);

      if (!chaptersMap.has(chapitreId)) {
        chaptersMap.set(chapitreId, {
          id: chapitreId,
          titre,
          description,
          motCible,
          questions: [],
        });
      }

      const chapter = chaptersMap.get(chapitreId)!;
      chapter.questions.push({
        notion,
        question,
        reponses: [reponse1, reponse2, reponse3],
        reponseCorrecte: indexCorrect,
        explication,
      });
    }

    return Array.from(chaptersMap.values());
  } catch (error) {
    console.error('Erreur de parsing CSV:', error);
    return null;
  }
}

/**
 * Parse une ligne CSV en gérant les guillemets
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Génère un fichier JSON template
 */
export function generateJSONTemplate(): string {
  const template: ImportChapterJSON[] = [
    {
      id: 'exemple-1',
      titre: 'Exemple de Chapitre',
      description: 'Ceci est un exemple de chapitre avec 6 questions pour épeler le mot EXEMPLE',
      motCible: 'EXEMPLE',
      questions: [
        {
          notion: 'Lettre E',
          question: 'Quelle est la première lettre du mot EXEMPLE ?',
          reponses: ['E', 'X', 'M'],
          reponseCorrecte: 0,
          explication: 'La première lettre est E',
        },
        {
          notion: 'Lettre X',
          question: 'Quelle est la deuxième lettre du mot EXEMPLE ?',
          reponses: ['M', 'X', 'E'],
          reponseCorrecte: 1,
          explication: 'La deuxième lettre est X',
        },
        {
          notion: 'Lettre E',
          question: 'Quelle est la troisième lettre du mot EXEMPLE ?',
          reponses: ['P', 'E', 'M'],
          reponseCorrecte: 1,
          explication: 'La troisième lettre est E',
        },
        {
          notion: 'Lettre M',
          question: 'Quelle est la quatrième lettre du mot EXEMPLE ?',
          reponses: ['M', 'P', 'L'],
          reponseCorrecte: 0,
          explication: 'La quatrième lettre est M',
        },
        {
          notion: 'Lettre P',
          question: 'Quelle est la cinquième lettre du mot EXEMPLE ?',
          reponses: ['L', 'E', 'P'],
          reponseCorrecte: 2,
          explication: 'La cinquième lettre est P',
        },
        {
          notion: 'Lettre L',
          question: 'Quelle est la sixième lettre du mot EXEMPLE ?',
          reponses: ['L', 'E', 'X'],
          reponseCorrecte: 0,
          explication: 'La sixième lettre est L',
        },
        {
          notion: 'Lettre E',
          question: 'Quelle est la septième lettre du mot EXEMPLE ?',
          reponses: ['E', 'L', 'M'],
          reponseCorrecte: 0,
          explication: 'La septième lettre est E',
        },
      ],
    },
  ];

  return JSON.stringify(template, null, 2);
}

/**
 * Génère un fichier CSV template
 */
export function generateCSVTemplate(): string {
  const headers = [
    'ChapitreID',
    'Titre',
    'Description',
    'MotCible',
    'Notion',
    'Question',
    'Réponse1',
    'Réponse2',
    'Réponse3',
    'IndexCorrect',
    'Explication',
  ];

  const rows = [
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre E',
      'Quelle est la première lettre du mot EXEMPLE ?',
      'E',
      'X',
      'M',
      '0',
      'La première lettre est E',
    ],
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre X',
      'Quelle est la deuxième lettre du mot EXEMPLE ?',
      'M',
      'X',
      'E',
      '1',
      'La deuxième lettre est X',
    ],
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre E',
      'Quelle est la troisième lettre du mot EXEMPLE ?',
      'P',
      'E',
      'M',
      '1',
      'La troisième lettre est E',
    ],
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre M',
      'Quelle est la quatrième lettre du mot EXEMPLE ?',
      'M',
      'P',
      'L',
      '0',
      'La quatrième lettre est M',
    ],
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre P',
      'Quelle est la cinquième lettre du mot EXEMPLE ?',
      'L',
      'E',
      'P',
      '2',
      'La cinquième lettre est P',
    ],
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre L',
      'Quelle est la sixième lettre du mot EXEMPLE ?',
      'L',
      'E',
      'X',
      '0',
      'La sixième lettre est L',
    ],
    [
      'exemple-1',
      'Exemple de Chapitre',
      'Ceci est un exemple de chapitre',
      'EXEMPLE',
      'Lettre E',
      'Quelle est la septième lettre du mot EXEMPLE ?',
      'E',
      'L',
      'M',
      '0',
      'La septième lettre est E',
    ],
  ];

  const csvLines = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Télécharge un fichier
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
