
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  QUIZ = 'QUIZ',
  FEEDBACK = 'FEEDBACK',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE',
  HAZARD_GATE = 'HAZARD_GATE'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // The character displayed
  color?: string;
  targetIndex?: number; // Index within the target word
  points?: number; 
  hasFired?: boolean; 
}

export interface Question {
  id: string;
  notion: string; // The concept name (e.g., "Consentement")
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  targetWord: string; // e.g. "CONTRAT"
  questions: Question[]; // Must have same length as targetWord
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player

// Palette for procedural letter coloring based on index
export const LETTER_PALETTE = [
    '#2979ff', // Blue
    '#00e5ff', // Cyan
    '#ff1744', // Red
    '#ffea00', // Yellow
    '#76ff03', // Green
    '#f50057', // Pink
    '#ff9100', // Orange
    '#d500f9', // Purple
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; 
    oneTime?: boolean; 
}
