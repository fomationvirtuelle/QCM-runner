import { Chapter } from '../types';

const STORAGE_KEY = 'qcm-runner-custom-chapters';
const ACTIVE_QCM_KEY = 'qcm-runner-active-qcm';

export interface QCMSet {
  id: string;
  name: string;
  description: string;
  chapters: Chapter[];
  createdAt: number;
  isDefault?: boolean;
}

/**
 * Charge tous les QCM personnalisés depuis le localStorage
 */
export function loadCustomQCMs(): QCMSet[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const qcms = JSON.parse(stored) as QCMSet[];
    return qcms;
  } catch (error) {
    console.error('Erreur lors du chargement des QCM:', error);
    return [];
  }
}

/**
 * Sauvegarde un nouveau QCM personnalisé
 */
export function saveCustomQCM(qcm: QCMSet): void {
  try {
    const existing = loadCustomQCMs();

    // Vérifier si un QCM avec cet ID existe déjà
    const index = existing.findIndex(q => q.id === qcm.id);

    if (index >= 0) {
      // Mettre à jour
      existing[index] = qcm;
    } else {
      // Ajouter
      existing.push(qcm);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du QCM:', error);
    throw new Error('Impossible de sauvegarder le QCM');
  }
}

/**
 * Supprime un QCM personnalisé
 */
export function deleteCustomQCM(qcmId: string): void {
  try {
    const existing = loadCustomQCMs();
    const filtered = existing.filter(q => q.id !== qcmId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Si le QCM supprimé était actif, réinitialiser
    const activeQCM = getActiveQCMId();
    if (activeQCM === qcmId) {
      setActiveQCMId(null);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du QCM:', error);
    throw new Error('Impossible de supprimer le QCM');
  }
}

/**
 * Récupère l'ID du QCM actif
 */
export function getActiveQCMId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_QCM_KEY);
  } catch (error) {
    console.error('Erreur lors de la récupération du QCM actif:', error);
    return null;
  }
}

/**
 * Définit le QCM actif
 */
export function setActiveQCMId(qcmId: string | null): void {
  try {
    if (qcmId === null) {
      localStorage.removeItem(ACTIVE_QCM_KEY);
    } else {
      localStorage.setItem(ACTIVE_QCM_KEY, qcmId);
    }
  } catch (error) {
    console.error('Erreur lors de la définition du QCM actif:', error);
  }
}

/**
 * Récupère un QCM par son ID
 */
export function getQCMById(qcmId: string): QCMSet | null {
  const qcms = loadCustomQCMs();
  return qcms.find(q => q.id === qcmId) || null;
}

/**
 * Génère un ID unique pour un nouveau QCM
 */
export function generateQCMId(): string {
  return `qcm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
