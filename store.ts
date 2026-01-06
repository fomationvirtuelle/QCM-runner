
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, Chapter, LETTER_PALETTE } from './types';

// --- DATA : PROGRAMME CEJM ---

const CEJM_CHAPTERS: Chapter[] = [
  {
    id: 'chap1',
    title: 'THÈME 1 : L\'INTÉGRATION',
    description: "L'entreprise dans son environnement économique et juridique.",
    targetWord: "PESTEL",
    questions: [
      { id: '1-P', notion: 'POLITIQUE', question: "Dans PESTEL, que concerne la dimension 'Politique' ?", options: ["La stabilité gouvernementale et fiscale", "Le niveau des salaires", "La démographie"], correctIndex: 0, explanation: "Cela inclut la stabilité du gouvernement, la politique fiscale, et le commerce extérieur." },
      { id: '1-E', notion: 'ECONOMIQUE', question: "Quelle variable est purement 'Économique' ?", options: ["Le taux d'intérêt", "Le climat", "Les lois sur le travail"], correctIndex: 0, explanation: "Le taux d'intérêt, l'inflation, le taux de chômage sont des facteurs économiques majeurs." },
      { id: '1-S', notion: 'SOCIAL', question: "L'évolution des modes de vie relève du :", options: ["Socioculturel", "Stratégique", "Systémique"], correctIndex: 0, explanation: "Le facteur Socioculturel analyse la démographie, l'éducation et les habitudes de consommation." },
      { id: '1-T', notion: 'TECHNO', question: "La veille technologique permet de :", options: ["Anticiper les innovations et ruptures", "Réparer les ordinateurs", "Surveiller les salariés"], correctIndex: 0, explanation: "Elle permet de ne pas rater les innovations de rupture (Disruption) qui menacent le modèle actuel." },
      { id: '1-E2', notion: 'ECOLOGIE', question: "La RSE incite l'entreprise à surveiller son impact :", options: ["Environnemental", "Électoral", "Esthétique"], correctIndex: 0, explanation: "L'écologie concerne les normes environnementales, le recyclage, et l'empreinte carbone." },
      { id: '1-L', notion: 'LEGAL', question: "Le facteur Légal inclut :", options: ["Le droit du travail et la propriété intellectuelle", "Les lois de la physique", "Les règles morales"], correctIndex: 0, explanation: "Il s'agit de l'ensemble du cadre législatif et réglementaire qui contraint l'activité." },
    ]
  },
  {
    id: 'chap2',
    title: 'THÈME 2 : LE CONTRAT',
    description: "Formation, exécution et validité des contrats.",
    targetWord: "ACCORD",
    questions: [
      { id: '2-A', notion: 'AUTONOMIE', question: "Le principe de l'autonomie de la volonté signifie :", options: ["On est libre de contracter ou non", "On fait ce qu'on veut sans loi", "Le juge décide du contrat"], correctIndex: 0, explanation: "Les parties sont libres de s'engager et de déterminer le contenu du contrat (dans le respect de la loi)." },
      { id: '2-C', notion: 'CONSENTEMENT', question: "Pour être valide, le consentement doit être :", options: ["Libre et éclairé", "Écrit et signé", "Devant notaire"], correctIndex: 0, explanation: "Il doit être exempt de vices (Erreur, Dol, Violence)." },
      { id: '2-C2', notion: 'CAPACITE', question: "Qui a la capacité de contracter ?", options: ["Toute personne non déclarée incapable", "Seulement les majeurs de 21 ans", "Seulement les commerçants"], correctIndex: 0, explanation: "La capacité est la règle, l'incapacité (mineur, tutelle) est l'exception." },
      { id: '2-O', notion: 'OBJET', question: "L'objet du contrat doit être :", options: ["Licite et déterminé", "Rentable", "Complexe"], correctIndex: 0, explanation: "La prestation promise doit être possible, déterminée ou déterminable, et conforme à l'ordre public." },
      { id: '2-R', notion: 'RESPONSABILITE', question: "La responsabilité contractuelle nécessite :", options: ["Faute, Dommage, Lien de causalité", "Juste une faute", "Un retard"], correctIndex: 0, explanation: "Ces trois éléments cumulatifs sont nécessaires pour engager la responsabilité civile contractuelle." },
      { id: '2-D', notion: 'DOMMAGES', question: "Que répare-t-on en cas d'inexécution ?", options: ["Le préjudice subi (Dommages-Intérêts)", "L'honneur", "Rien"], correctIndex: 0, explanation: "Les dommages-intérêts compensent la perte subie ou le gain manqué." },
    ]
  },
  {
    id: 'chap3',
    title: 'THÈME 3 : STRATÉGIE',
    description: "Diagnostic, options stratégiques et avantage concurrentiel.",
    targetWord: "VALEUR",
    questions: [
      { id: '3-V', notion: 'VISION', question: "La finalité de l'entreprise est :", options: ["Sa raison d'être (économique, sociale)", "Son logo", "Son adresse"], correctIndex: 0, explanation: "C'est le but ultime de l'entreprise (ex: faire du profit, pérenniser, servir l'intérêt général)." },
      { id: '3-A', notion: 'AVANTAGE', question: "Un avantage concurrentiel doit être :", options: ["Défendable et distinctif", "Temporaire", "Illégal"], correctIndex: 0, explanation: "Il permet de se distinguer durablement de la concurrence (coût, qualité, innovation)." },
      { id: '3-L', notion: 'LEADERSHIP', question: "La domination par les coûts consiste à :", options: ["Réduire les coûts pour baisser les prix", "Augmenter les prix", "Vendre du luxe"], correctIndex: 0, explanation: "Stratégie visant à obtenir le coût de revient le plus bas du marché." },
      { id: '3-E', notion: 'ENVIRONNEMENT', question: "Le diagnostic externe analyse :", options: ["Opportunités et Menaces", "Forces et Faiblesses", "Actif et Passif"], correctIndex: 0, explanation: "Il permet d'identifier les facteurs externes favorables ou défavorables (Macro et Micro)." },
      { id: '3-U', notion: 'USINE (RESS)', question: "Les ressources tangibles sont :", options: ["Matérielles et financières", "L'image de marque", "Le savoir-faire"], correctIndex: 0, explanation: "Ce sont les actifs physiques et financiers identifiables." },
      { id: '3-R', notion: 'RESSOURCES', question: "La compétence distinctive repose sur :", options: ["Un savoir-faire difficile à imiter", "Une machine standard", "Un brevet expiré"], correctIndex: 0, explanation: "C'est une capacité organisationnelle unique qui donne l'avantage concurrentiel." },
    ]
  }
];

interface GameState {
  status: GameStatus;
  score: number;
  speed: number;

  // Chapter State
  activeChapter: Chapter | null;
  collectedLetters: number[]; // Indices of the letters collected for the ACTIVE chapter

  // Global
  level: number; // Used for speed scaling, not chapters anymore
  laneCount: number;
  gemsCollected: number;
  distance: number;
  playerLane: number; // Current lane for collision detection (instantaneous, not interpolated)

  // Quiz State
  currentQuestion: any | null; // Typed loosely here, handled in encounterLetter
  pendingLetterLetter: number | null;

  // Inventory / Roguelite Powers
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;
  hasMagnet: boolean;
  scoreMultiplier: number;

  // UI
  showTutorial: boolean;

  // Actions
  startGame: (chapterId: string) => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  accelerate: (delta: number) => void;

  encounterLetter: (index: number) => void;
  submitAnswer: (optionIndex: number) => boolean;
  closeFeedback: () => void;

  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  setPlayerLane: (lane: number) => void;

  buyItem: (type: 'DOUBLE_JUMP' | 'IMMORTAL' | 'MAGNET' | 'MULTIPLIER', cost: number) => boolean;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
  returnToMenu: () => void;
  closeTutorial: () => void;
}

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  speed: 0,
  activeChapter: null,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  playerLane: 0,

  currentQuestion: null,
  pendingLetterLetter: null,

  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,
  hasMagnet: false,
  scoreMultiplier: 1,

  showTutorial: false,

  startGame: (chapterId: string) => {
    const chapter = CEJM_CHAPTERS.find(c => c.id === chapterId);
    if (!chapter) return;

    set({
        activeChapter: chapter,
        status: GameStatus.PLAYING,
        score: 0,
        speed: RUN_SPEED_BASE,
        collectedLetters: [],
        level: 1,
        laneCount: 3,
        gemsCollected: 0,
        distance: 0,
        playerLane: 0,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false,
        hasMagnet: false,
        scoreMultiplier: 1,
        currentQuestion: null,
        pendingLetterLetter: null,
        showTutorial: true
      });
  },

  restartGame: () => {
    // Restart current chapter
    const { activeChapter } = get();
    if (activeChapter) {
        get().startGame(activeChapter.id);
        set({ showTutorial: false }); // Skip tutorial on restart
    } else {
        get().returnToMenu();
    }
  },

  returnToMenu: () => set({ status: GameStatus.MENU, activeChapter: null }),

  takeDamage: () => {
    const { isImmortalityActive, score } = get();
    if (isImmortalityActive) return; 
    set({ score: Math.max(0, score - 500) });
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + (value * state.scoreMultiplier), 
    gemsCollected: state.gemsCollected + 1 
  })),

  accelerate: (delta) => set((state) => {
      if (state.status !== GameStatus.PLAYING) return {};
      const newSpeed = Math.min(state.speed + (delta * 0.5), 60);
      return { speed: newSpeed };
  }),

  setDistance: (dist) => set({ distance: dist }),

  setPlayerLane: (lane) => set({ playerLane: lane }),

  encounterLetter: (index) => {
    const { collectedLetters, activeChapter } = get();
    
    if (!activeChapter) return;
    
    if (index >= activeChapter.questions.length) return;

    if (!collectedLetters.includes(index)) {
      const originalQuestion = activeChapter.questions[index];
      
      // Shuffle options
      const indices = originalQuestion.options.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const shuffledOptions = indices.map(i => originalQuestion.options[i]);
      const newCorrectIndex = indices.indexOf(originalQuestion.correctIndex);

      const randomizedQuestion = {
          ...originalQuestion,
          options: shuffledOptions,
          correctIndex: newCorrectIndex
      };
      
      set({
        status: GameStatus.QUIZ,
        currentQuestion: randomizedQuestion,
        pendingLetterLetter: index
      });
    }
  },

  submitAnswer: (optionIndex) => {
      const { currentQuestion, pendingLetterLetter, collectedLetters, speed, score, activeChapter } = get();
      
      if (!currentQuestion || pendingLetterLetter === null || !activeChapter) {
          set({ status: GameStatus.PLAYING });
          return false;
      }

      if (optionIndex === currentQuestion.correctIndex) {
          const newLetters = [...collectedLetters, pendingLetterLetter];
          get().addScore(500);

          set({ 
            collectedLetters: newLetters,
            status: GameStatus.PLAYING,
            currentQuestion: null,
            pendingLetterLetter: null
          });

          if (newLetters.length === activeChapter.targetWord.length) {
                set({
                    status: GameStatus.VICTORY,
                    score: get().score + 5000
                });
          }
          return true;
      } else {
          set({ 
              score: Math.max(0, score - 200),
              status: GameStatus.FEEDBACK,
          });
          return false;
      }
  },

  closeFeedback: () => {
      set({
          status: GameStatus.PLAYING,
          currentQuestion: null,
          pendingLetterLetter: null
      });
  },

  openShop: () => set({ status: GameStatus.SHOP }),
  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score } = get();
      if (score >= cost) {
          set({ score: score - cost });
          switch (type) {
              case 'DOUBLE_JUMP': set({ hasDoubleJump: true }); break;
              case 'IMMORTAL': set({ hasImmortality: true }); break;
              case 'MAGNET': set({ hasMagnet: true }); break;
              case 'MULTIPLIER': set({ scoreMultiplier: 2 }); break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  closeTutorial: () => set({ showTutorial: false }),

  setStatus: (status) => set({ status }),
}));

export { CEJM_CHAPTERS };
