
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Play, Brain, BookOpen, AlertTriangle, LayoutGrid, CheckCircle2, Briefcase, HandMetal, Smartphone, MousePointer2, Magnet, TrendingUp } from 'lucide-react';
import { useStore, CEJM_CHAPTERS } from '../../store';
import { GameStatus, LETTER_PALETTE, ShopItem, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'JETPACK BOOSTER',
        description: 'Permet un double saut pour atteindre les actifs en hauteur.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'IMMORTAL',
        name: 'PARACHUTE DORÉ',
        description: 'Protection temporaire contre les dettes et licenciements.',
        cost: 2000,
        icon: Shield,
        oneTime: true
    },
    {
        id: 'MAGNET',
        name: 'AIMANT CORPORATE',
        description: 'Attire automatiquement les gains financiers vers vous.',
        cost: 1500,
        icon: Magnet,
        oneTime: true
    },
    {
        id: 'MULTIPLIER',
        name: 'CROISSANCE X2',
        description: 'Doublez tous vos gains instantanément.',
        cost: 3000,
        icon: TrendingUp,
        oneTime: true
    }
];

const TutorialModal: React.FC = () => {
    const { closeTutorial } = useStore();
    return (
        <div className="absolute inset-0 bg-black/80 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white text-slate-800 max-w-2xl w-full rounded-xl p-8 shadow-2xl border-t-8 border-blue-600">
                <h2 className="text-3xl font-black mb-6 text-center text-blue-900 font-cyber uppercase tracking-wider">
                    ONBOARDING EMPLOYÉ
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Objectives */}
                    <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center text-green-700">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 mr-2 flex items-center justify-center border-2 border-yellow-600">
                                <span className="font-bold text-yellow-800">€</span>
                            </div>
                            VOS OBJECTIFS
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-bold text-slate-800">RÉCUPÉREZ LES PIÈCES D'OR</p>
                                <p className="text-sm text-slate-600">Elles augmentent votre Capital (+100€).</p>
                            </div>
                            <div>
                                <p className="font-bold text-blue-800">CHERCHEZ LES DOSSIERS (LETTRES)</p>
                                <p className="text-sm text-slate-600">Répondez correctement aux Quiz pour valider le chapitre (+500€).</p>
                            </div>
                        </div>
                    </div>

                    {/* Dangers */}
                    <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
                        <h3 className="text-lg font-bold mb-4 flex items-center text-red-700">
                             <AlertTriangle className="mr-2 fill-red-600 text-white" /> VOS ENNEMIS
                        </h3>
                        <div className="space-y-4">
                             <div>
                                <p className="font-bold text-red-800">ÉVITEZ LES TRIANGLES ROUGES</p>
                                <p className="text-sm text-slate-600">Ce sont des Obstacles imprévus (-500€).</p>
                            </div>
                            <div>
                                <p className="font-bold text-red-800">ATTENTION AUX DRONES & DETTES</p>
                                <p className="text-sm text-slate-600">Ils apparaissent quand le jeu accélère. Esquivez-les !</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-6 text-sm text-slate-500 italic">
                    Astuce : Au début, il n'y a que des obstacles. Les ennemis arrivent plus tard !
                </div>

                <button 
                    onClick={closeTutorial}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg tracking-widest transition-transform hover:scale-[1.02]"
                >
                    COMMENCER LA MISSION
                </button>
            </div>
        </div>
    );
};

const QuizScreen: React.FC = () => {
    const { currentQuestion, submitAnswer } = useStore();
    
    if (!currentQuestion) return null;

    const handleAnswer = (index: number) => {
        const isCorrect = submitAnswer(index);
        
        if (isCorrect) {
            audio.playLetterCollect(); 
        } else {
            audio.playDamage(); 
        }
    };

    return (
        <div className="absolute inset-0 bg-slate-900/95 z-[200] text-white pointer-events-auto backdrop-blur-xl flex items-center justify-center p-4">
             <div className="max-w-3xl w-full border-t-4 border-blue-500 rounded-xl p-6 md:p-8 relative bg-slate-800 shadow-2xl">
                 <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-blue-600 px-6 py-2 rounded-full text-white font-bold tracking-widest flex items-center whitespace-nowrap shadow-lg">
                    <Brain className="mr-2 w-5 h-5" /> EXAMEN DU DOSSIER : {currentQuestion.notion}
                 </div>

                 <h3 className="text-xl md:text-2xl font-bold text-white mb-8 text-center leading-relaxed mt-4">
                     {currentQuestion.question}
                 </h3>

                 <div className="grid gap-3">
                     {currentQuestion.options.map((option: string, idx: number) => (
                         <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className="text-left p-4 rounded-xl bg-slate-700 hover:bg-blue-600 transition-all font-sans text-sm md:text-lg flex items-center group shadow-md"
                         >
                             <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center mr-4 group-hover:bg-white group-hover:text-blue-600 font-bold flex-shrink-0">
                                 {['A', 'B', 'C'][idx]}
                             </span>
                             {option}
                         </button>
                     ))}
                 </div>
             </div>
        </div>
    );
}

const FeedbackScreen: React.FC = () => {
    const { currentQuestion, closeFeedback } = useStore();
    
    if (!currentQuestion) return null;

    return (
        <div className="absolute inset-0 bg-red-900/95 z-[200] text-white pointer-events-auto backdrop-blur-xl flex items-center justify-center p-4">
             <div className="max-w-2xl w-full border-t-4 border-red-500 rounded-xl p-6 md:p-10 relative bg-slate-900 shadow-2xl">
                 <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-red-600 px-6 py-2 rounded-full text-white font-bold tracking-widest flex items-center shadow-lg uppercase">
                    <AlertTriangle className="mr-2 w-5 h-5" /> ❌ Mauvaise Réponse
                 </div>

                 <div className="text-center mt-6 mb-6">
                    <div className="text-4xl font-black text-red-400 mb-2">- 200 €</div>
                    <div className="text-red-200 font-bold text-lg">ERREUR DE GESTION</div>
                 </div>

                 <h3 className="text-xl text-white font-bold mb-4 text-center border-b border-white/10 pb-4">
                    {currentQuestion.notion}
                 </h3>

                 <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                     <div className="flex items-start mb-2">
                        <BookOpen className="w-6 h-6 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <h4 className="text-yellow-400 font-bold mb-1 text-lg">EXPLICATION</h4>
                            <p className="text-slate-200 leading-relaxed text-sm md:text-base">
                                {currentQuestion.explanation}
                            </p>
                        </div>
                     </div>
                 </div>

                 <button 
                    onClick={closeFeedback}
                    className="w-full bg-white hover:bg-slate-200 text-red-900 font-bold py-4 rounded-xl transition-colors shadow-lg"
                 >
                     REPRENDRE LE BUSINESS
                 </button>
             </div>
        </div>
    );
}

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality, hasMagnet, scoreMultiplier } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            if (item.id === 'MAGNET' && hasMagnet) return false;
            if (item.id === 'MULTIPLIER' && scoreMultiplier > 1) return false;
            return true;
        });
        setItems(pool);
    }, [hasDoubleJump, hasImmortality, hasMagnet, scoreMultiplier]);

    return (
        <div className="absolute inset-0 bg-slate-900/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-blue-400 mb-2 font-cyber tracking-widest text-center uppercase">Place de Marché</h2>
                 <p className="text-slate-400 text-sm mb-6 text-center max-w-lg">
                    Investissez vos gains pour obtenir des avantages concurrentiels.
                 </p>
                 <div className="flex items-center text-green-400 mb-6 md:mb-8 bg-slate-800 px-6 py-2 rounded-full border border-green-500/30">
                     <span className="text-base md:text-lg mr-2 font-bold">CAPITAL:</span>
                     <span className="text-xl md:text-2xl font-black">{score.toLocaleString()} €</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 max-w-4xl w-full mb-8 justify-items-center">
                     {items.length > 0 ? items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-slate-800 border border-slate-700 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-blue-500 transition-colors w-full max-w-sm shadow-xl">
                                 <div className="bg-slate-700 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-slate-400 text-xs md:text-sm mb-4 h-12 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base transition-all ${canAfford ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-slate-600 cursor-not-allowed opacity-50'}`}
                                 >
                                     ACHETER ({item.cost} €)
                                 </button>
                             </div>
                         );
                     }) : (
                         <div className="col-span-2 text-slate-500 font-mono italic">AUCUNE OFFRE DISPONIBLE</div>
                     )}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-blue-600 text-white font-bold text-lg md:text-xl rounded hover:bg-blue-500 transition-all shadow-xl"
                 >
                     RETOUR AU BUSINESS <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, collectedLetters, status, activeChapter, startGame, restartGame, gemsCollected, distance, isImmortalityActive, speed, returnToMenu, showTutorial } = useStore();
  
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.QUIZ) return <QuizScreen />;
  if (status === GameStatus.FEEDBACK) return <FeedbackScreen />;
  if (status === GameStatus.SHOP) return <ShopScreen />;

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 z-[100] bg-slate-900 overflow-y-auto pointer-events-auto bg-[url('https://images.unsplash.com/photo-1486406140926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-blend-multiply">
              <div className="min-h-screen flex flex-col items-center p-6 md:p-12 backdrop-blur-sm bg-slate-900/80">
                  <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 font-cyber mb-4 drop-shadow-2xl">
                        CEJM : STARTUP RUN
                    </h1>
                    <p className="text-blue-200/80 font-sans text-sm md:text-base tracking-widest uppercase">
                        CHOISISSEZ VOTRE MARCHÉ CIBLE
                    </p>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                      {CEJM_CHAPTERS.map((chapter) => (
                          <button
                            key={chapter.id}
                            onClick={() => { audio.init(); startGame(chapter.id); }}
                            className="group relative bg-white/5 border border-white/10 hover:border-blue-400 rounded-2xl p-6 text-left transition-all hover:scale-105 hover:bg-white/10 hover:shadow-2xl flex flex-col h-full backdrop-blur-md"
                          >
                              <div className="mb-4 flex items-center justify-between">
                                  <span className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wider border border-blue-500/30">
                                      {chapter.questions.length} KPI
                                  </span>
                                  <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                              </div>
                              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors font-cyber">
                                  {chapter.title}
                              </h3>
                              <p className="text-slate-300 text-sm mb-6 flex-grow font-sans">
                                  {chapter.description}
                              </p>
                              <div className="flex items-center text-xs font-mono text-slate-400">
                                  <LayoutGrid className="w-4 h-4 mr-2" />
                                  OBJECTIF : <span className="text-green-400 ml-2 tracking-[0.2em] font-bold">{chapter.targetWord}</span>
                              </div>
                              
                              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/90 to-slate-900/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4 text-center">
                <CheckCircle2 className="w-24 h-24 text-green-400 mb-6 animate-bounce" />
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 font-cyber uppercase">
                    OBJECTIFS ATTEINTS
                </h1>
                <p className="text-xl md:text-2xl text-green-300 font-bold mb-8">
                    {activeChapter?.title} validé avec succès.
                </p>
                <div className="bg-white/10 p-6 rounded-xl mb-8 backdrop-blur-sm">
                    <p className="text-slate-300 text-sm uppercase tracking-widest mb-2">Bonus de performance</p>
                    <p className="text-4xl font-black text-white">{score.toLocaleString()} €</p>
                </div>
                
                <div className="flex flex-col space-y-4 w-full max-w-sm">
                    <button 
                    onClick={() => { audio.init(); returnToMenu(); }}
                    className="px-8 py-4 bg-white text-green-900 font-black text-lg rounded-xl hover:scale-105 transition-all shadow-lg"
                    >
                        NOUVEAU CONTRAT
                    </button>
                    <button 
                    onClick={() => { audio.init(); restartGame(); }}
                    className="px-8 py-4 bg-transparent border border-white/30 text-white font-bold text-lg rounded-xl hover:bg-white/10 transition-all"
                    >
                        REJOUER LE SCÉNARIO
                    </button>
                </div>
            </div>
        </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-slate-900/90 z-[100] text-white pointer-events-auto backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
                <h1 className="text-4xl font-black mb-6 uppercase text-blue-400">Opération Suspendue</h1>
                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded hover:scale-105 transition-all"
                >
                    REPRENDRE
                </button>
              </div>
          </div>
      );
  }

  // --- IN GAME HUD ---

  const word = activeChapter ? activeChapter.targetWord : '';
  const letters = word.split('');

  return (
    <>
    {showTutorial && <TutorialModal />}
    
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="bg-slate-900/80 p-4 rounded-br-2xl border-l-4 border-green-500 backdrop-blur-md shadow-lg">
                <div className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">Chiffre d'Affaires</div>
                <div className="text-3xl md:text-5xl font-black text-white font-mono tracking-tighter">
                    {score.toLocaleString()} <span className="text-green-500 text-2xl md:text-4xl">€</span>
                </div>
                {activeChapter && (
                    <div className="text-xs md:text-sm text-blue-400 mt-2 font-bold uppercase tracking-wider flex items-center">
                        <MapPin className="w-3 h-3 mr-1" /> {activeChapter.title}
                    </div>
                )}
            </div>
            
            <button 
                onClick={returnToMenu}
                className="pointer-events-auto px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded font-bold text-xs backdrop-blur-sm shadow-lg transition-colors"
            >
                QUITTER
            </button>
        </div>

        {/* Active Skill Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-2 rounded-full font-bold text-lg md:text-xl animate-pulse flex items-center shadow-[0_0_20px_gold]">
                 <Shield className="mr-2 fill-black" /> IMMUNITÉ FISCALE ACTIVE
             </div>
        )}

        {/* Dynamic Word Collection Status */}
        <div className="absolute top-4 md:top-6 left-0 right-0 flex justify-center px-2 pointer-events-none">
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 bg-slate-900/60 p-2 md:p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-xl">
                {letters.map((char, idx) => {
                    const isCollected = collectedLetters.includes(idx);
                    
                    // Green for collected, Dark Slate for empty
                    const bgColor = isCollected ? '#22c55e' : 'rgba(30, 41, 59, 0.8)';
                    const textColor = isCollected ? '#ffffff' : 'rgba(148, 163, 184, 0.5)';
                    const borderColor = isCollected ? '#4ade80' : 'rgba(71, 85, 105, 0.5)';

                    return (
                        <div 
                            key={idx}
                            style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                borderColor: borderColor
                            }}
                            className="w-8 h-10 md:w-10 md:h-12 flex items-center justify-center border-2 rounded md:rounded-lg font-black text-lg md:text-xl shadow-lg transition-all duration-300"
                        >
                            {char}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Speed/Progress Indicator */}
        <div className="w-full flex justify-end items-end">
             <div className="bg-slate-900/80 px-4 py-2 rounded-tl-2xl border-r-4 border-blue-500 backdrop-blur-md flex items-center space-x-3">
                 <div>
                    <div className="text-xs text-slate-400 font-bold uppercase text-right">Vélocité</div>
                    <div className="text-xl font-mono font-bold text-white flex items-center">
                         {Math.round((speed / RUN_SPEED_BASE) * 100)}% <Zap className="w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
                    </div>
                 </div>
             </div>
        </div>
    </div>
    </>
  );
};
