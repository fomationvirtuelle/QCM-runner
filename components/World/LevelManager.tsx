
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus } from '../../types';
import { audio } from '../System/Audio';

// --- GEOMETRIES ---

// OBSTACLE: Triangle / Pyramid (Neon Red)
// Reduced height from 1.5 to 1.2 to make jumping over it more consistent/fair
const PYRAMID_GEO = new THREE.ConeGeometry(0.7, 1.2, 3);
PYRAMID_GEO.computeVertexNormals();

// ROBOT ENEMY GEOMETRIES
const ROBOT_HEAD_GEO = new THREE.BoxGeometry(0.35, 0.35, 0.35);
const ROBOT_TORSO_GEO = new THREE.BoxGeometry(0.5, 0.6, 0.3);
const ROBOT_LIMB_GEO = new THREE.BoxGeometry(0.15, 0.6, 0.15); // Arms/Legs
const ROBOT_GUN_GEO = new THREE.CylinderGeometry(0.08, 0.15, 0.8, 8);
ROBOT_GUN_GEO.rotateX(Math.PI / 2); // Point forward

// DEBT SPIKE (Missile - Now looks like a laser blast)
const SPIKE_GEO = new THREE.CapsuleGeometry(0.15, 1.2, 4, 8);
SPIKE_GEO.rotateX(Math.PI / 2); 

// EURO COIN (Gem) - Pure Gold Coin
const COIN_GEO = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32);
COIN_GEO.rotateX(Math.PI / 2); 

// LARGE COIN (Letter Container)
const LARGE_COIN_GEO = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);
LARGE_COIN_GEO.rotateX(Math.PI / 2);

const PARTICLE_COUNT = 600;
const BASE_LETTER_INTERVAL = 140; 
const FONT_URL = "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json";
const BASE_MISSILE_SPEED = 25; 

const getLetterInterval = () => BASE_LETTER_INTERVAL;

// --- Visual Feedback System ---
interface FeedbackItem {
    id: string;
    position: [number, number, number];
    text: string;
    color: string;
    value?: number; // Score impact
    life: number;
}

// --- Particle System ---
const ParticleSystem: React.FC = () => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        color: new THREE.Color()
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position, color } = e.detail;
            let spawned = 0;
            const burstAmount = 40; 

            for(let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.life = 1.0 + Math.random() * 0.5; 
                    p.pos.set(position[0], position[1], position[2]);
                    
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    const speed = 2 + Math.random() * 10;
                    
                    p.vel.set(
                        Math.sin(phi) * Math.cos(theta),
                        Math.sin(phi) * Math.sin(theta),
                        Math.cos(phi)
                    ).multiplyScalar(speed);
                    
                    p.color.set(color);
                    
                    spawned++;
                    if (spawned >= burstAmount) break;
                }
            }
        };
        
        window.addEventListener('particle-burst', handleExplosion as any);
        return () => window.removeEventListener('particle-burst', handleExplosion as any);
    }, [particles]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        const safeDelta = Math.min(delta, 0.1);

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= safeDelta * 1.5;
                p.pos.addScaledVector(p.vel, safeDelta);
                p.vel.y -= safeDelta * 5; 
                dummy.position.copy(p.pos);
                const scale = Math.max(0, p.life * 0.25);
                dummy.scale.set(scale, scale, scale);
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.scale.set(0,0,0);
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });
        
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
        </instancedMesh>
    );
};

// --- Score Feedback Component ---
const ScoreFeedback: React.FC<{ items: FeedbackItem[] }> = ({ items }) => {
    return (
        <group>
            {items.map(item => (
                <Html key={item.id} position={item.position} center zIndexRange={[100, 0]}>
                    <div className="flex flex-col items-center pointer-events-none whitespace-nowrap" style={{
                        animation: 'floatUp 1s ease-out forwards',
                        opacity: item.life
                    }}>
                        <span className="font-black text-xl md:text-2xl drop-shadow-md px-3 py-1 rounded bg-black/50 backdrop-blur-sm border border-white/20" 
                              style={{ color: item.color, borderColor: item.color }}>
                            {item.text}
                        </span>
                        {item.value && (
                            <span className="font-bold text-lg mt-1 text-white drop-shadow-md">
                                {item.value > 0 ? '+' : ''}{item.value} €
                            </span>
                        )}
                    </div>
                </Html>
            ))}
        </group>
    );
};

const getRandomLane = (laneCount: number) => {
    const max = Math.floor(laneCount / 2);
    return Math.floor(Math.random() * (max * 2 + 1)) - max;
};

export const LevelManager: React.FC = () => {
  const { 
    status, 
    speed, 
    collectGem, 
    encounterLetter, 
    collectedLetters,
    laneCount,
    setDistance,
    openShop,
    activeChapter,
    isImmortalityActive,
    takeDamage,
    showTutorial,
    accelerate,
    hasMagnet
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const feedbackRef = useRef<FeedbackItem[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextLetterDistance = useRef(BASE_LETTER_INTERVAL);
  
  // No safe zone by default, start immediately in danger
  const safeZoneUntilRef = useRef<number>(1); 

  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && (prevStatus.current === GameStatus.GAME_OVER || prevStatus.current === GameStatus.VICTORY || prevStatus.current === GameStatus.MENU);

    if (isRestart) {
        objectsRef.current = [];
        feedbackRef.current = [];
        setRenderTrigger(t => t + 1);
        distanceTraveled.current = 0;
        nextLetterDistance.current = getLetterInterval();
        safeZoneUntilRef.current = 1; 
    }
    prevStatus.current = status;
  }, [status, setDistance]);

  useFrame((state) => {
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  const spawnFeedback = (pos: [number, number, number], text: string, color: string, value?: number) => {
      feedbackRef.current.push({
          id: uuidv4(),
          position: [pos[0], pos[1] + 1, pos[2]],
          text,
          color,
          value,
          life: 1.0
      });
  };

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING || showTutorial) return;
    
    // CONTINUOUS ACCELERATION
    accelerate(delta);

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    distanceTraveled.current += dist;

    // SCALING DIFFICULTY FACTORS
    // Factor goes from 0 to 1 over 2000 meters.
    const difficultyFactor = Math.min(1, distanceTraveled.current / 2000);
    
    // Missile Speed increases with difficulty
    const currentMissileSpeed = BASE_MISSILE_SPEED + (difficultyFactor * 25);

    // Update Feedbacks
    feedbackRef.current = feedbackRef.current.filter(f => {
        f.life -= safeDelta * 1.5; 
        f.position[1] += safeDelta * 2; 
        return f.life > 0;
    });

    let hasChanges = false;
    let playerPos = new THREE.Vector3(0, 0, 0);
    
    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
    }

    const currentObjects = objectsRef.current;
    const keptObjects: GameObject[] = [];
    const newSpawns: GameObject[] = [];

    for (const obj of currentObjects) {
        let moveAmount = dist;
        
        if (obj.type === ObjectType.MISSILE) {
            moveAmount += currentMissileSpeed * safeDelta;
        }

        const prevZ = obj.position[2];
        obj.position[2] += moveAmount;
        
        // --- MAGNET LOGIC ---
        if (hasMagnet && obj.type === ObjectType.GEM && obj.active) {
            const lerpSpeed = 5.0 * safeDelta;
            obj.position[0] = THREE.MathUtils.lerp(obj.position[0], playerPos.x, lerpSpeed);
            obj.position[2] += 5 * safeDelta;
        }

        // Robot Enemy Firing Logic
        if (obj.type === ObjectType.ALIEN && obj.active && !obj.hasFired) {
             // Shoot when closer
             // Trigger distance increases with difficulty (snipers!)
             const triggerDist = -80 - (difficultyFactor * 30);
             if (obj.position[2] > triggerDist) { 
                 obj.hasFired = true;
                 
                 const spawnX = obj.position[0] - 0.4; // Right arm
                 newSpawns.push({
                     id: uuidv4(),
                     type: ObjectType.MISSILE,
                     position: [spawnX, 1.8, obj.position[2] + 1], 
                     active: true,
                     color: '#ff0000'
                 });
                 hasChanges = true;
             }
        }

        let keep = true;
        if (obj.active) {
            const zThreshold = 2.0; 
            const inZZone = (prevZ < playerPos.z + zThreshold) && (obj.position[2] > playerPos.z - zThreshold);
            
            if (obj.type === ObjectType.SHOP_PORTAL) {
                const dz = Math.abs(obj.position[2] - playerPos.z);
                if (dz < 2) { 
                     openShop();
                     obj.active = false;
                     hasChanges = true;
                     keep = false; 
                }
            } else if (inZZone) {
                const dx = Math.abs(obj.position[0] - playerPos.x);
                if (dx < 0.9) { 
                     // Collision Logic
                     const isDamageSource = [ObjectType.OBSTACLE, ObjectType.ALIEN, ObjectType.MISSILE, ObjectType.HAZARD_GATE].includes(obj.type);
                     
                     if (isDamageSource) {
                         let isHit = true; 
                         
                         // Vertical hitbox check (Jumping over stuff)
                         if (obj.type === ObjectType.OBSTACLE) {
                             // Obstacle height is ~1.2. 
                             // If feet (playerPos.y) are above ~1.0, we treat it as a dodge
                             // This ensures jumping over the obstacle avoids damage
                             if (playerPos.y > 1.0) isHit = false;
                         }
                         
                         // Double jump can clear missiles
                         if (obj.type === ObjectType.MISSILE) {
                             // Missile at 1.8. Feet need to be high.
                             if (playerPos.y > 2.0) isHit = false;
                         }

                         if (isHit) { 
                             if (obj.type === ObjectType.HAZARD_GATE && isImmortalityActive) {
                                 // Safe
                             } else {
                                window.dispatchEvent(new Event('player-hit'));
                                obj.active = false; 
                                hasChanges = true;
                                
                                let label = "DANGER !";
                                if (obj.type === ObjectType.ALIEN) label = "IMPÔTS !";
                                if (obj.type === ObjectType.MISSILE) label = "DETTE !";
                                if (obj.type === ObjectType.OBSTACLE) label = "OBSTACLE !";
                                
                                spawnFeedback(obj.position, label, "#ef4444", -500);

                                if (obj.type === ObjectType.MISSILE) {
                                    window.dispatchEvent(new CustomEvent('particle-burst', { 
                                        detail: { position: obj.position, color: '#ef4444' } 
                                    }));
                                }
                             }
                         }
                     } else {
                         // Collection
                         const dy = Math.abs(obj.position[1] - (playerPos.y + 0.9));
                         // Allow collecting gems even if jumping high or low
                         const vRange = 2.0; 
                         if (dy < vRange || (hasMagnet && obj.type === ObjectType.GEM && dy < 4.0)) { 
                            if (obj.type === ObjectType.GEM) {
                                collectGem(obj.points || 100);
                                audio.playGemCollect();
                                spawnFeedback(obj.position, "GAIN", "#ffd700", obj.points || 100);
                            }
                            if (obj.type === ObjectType.LETTER && obj.targetIndex !== undefined) {
                                encounterLetter(obj.targetIndex); 
                                spawnFeedback(obj.position, "DOSSIER", "#22c55e");
                            }
                            
                            window.dispatchEvent(new CustomEvent('particle-burst', { 
                                detail: { 
                                    position: obj.position, 
                                    color: '#ffd700' 
                                } 
                            }));

                            obj.active = false;
                            hasChanges = true;
                         }
                     }
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE) {
            keep = false;
            hasChanges = true;
        }

        if (keep) {
            keptObjects.push(obj);
        }
    }

    if (newSpawns.length > 0) {
        keptObjects.push(...newSpawns);
    }

    // --- SPAWNING LOGIC ---
    let furthestZ = keptObjects.length > 0 ? Math.min(...keptObjects.map(o => o.position[2])) : -20;
    
    // CONTINUOUS SPAWNING: As soon as we have room at the horizon, we fill it.
    if (furthestZ > -SPAWN_DISTANCE) {
         
         // DYNAMIC GAP:
         // Starts at 16 units distance between rows.
         // Reduces to 8 units at max difficulty (very dense).
         const currentGap = Math.max(8, 16 - (difficultyFactor * 8));

         const spawnZ = furthestZ - currentGap;
         
         const isLetterDue = distanceTraveled.current >= nextLetterDistance.current;

         // Safe Zone is mostly ignored now for obstacle generation, only used to prevent spawning ON TOP of letter
         const isInSafeZone = spawnZ > safeZoneUntilRef.current;

         if (isLetterDue && activeChapter) {
             const lane = getRandomLane(laneCount);
             const target = activeChapter.targetWord.split('');
             const availableIndices = target.map((_, i) => i).filter(i => !collectedLetters.includes(i));

             if (availableIndices.length > 0) {
                 const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                 const val = target[chosenIndex];

                 keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.LETTER,
                    position: [lane * LANE_WIDTH, 1.0, spawnZ], 
                    active: true,
                    color: '#ffd700', 
                    value: val,
                    targetIndex: chosenIndex
                 });
                 nextLetterDistance.current += getLetterInterval();
                 
                 // TINY Safe buffer just to ensure physics doesn't glitch spawn inside the letter
                 safeZoneUntilRef.current = spawnZ - 5; 
                 
                 hasChanges = true;
             } else {
                // If all letters collected, spawn Gem
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.GEM,
                    position: [lane * LANE_WIDTH, 1.2, spawnZ],
                    active: true,
                    color: '#22c55e',
                    points: 100
                });
                hasChanges = true;
             }
         } else {
             // ALWAYS SPAWN SOMETHING (No empty rows unless RNG really wants a breather, which we minimize)
             
             // 10% Chance of empty row for lane switching breathability, decreases to 0% at max difficulty
             const skipChance = Math.max(0, 0.1 - difficultyFactor);
             
             if (Math.random() > skipChance) {
                
                // Determine what to spawn
                // 15% Gems (Rewards)
                // 85% DANGER
                
                if (Math.random() < 0.15) { 
                     const lane = getRandomLane(laneCount);
                     keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.GEM,
                        position: [lane * LANE_WIDTH, 1.0, spawnZ],
                        active: true,
                        color: '#22c55e',
                        points: 100
                     });
                } else {
                    // DANGER SPAWN
                    const lane = getRandomLane(laneCount);
                    
                    // FIXED RATIO: 1 out of 2 (50%)
                    // It doesn't scale with difficulty anymore to prevent "too many enemies".
                    // It stays at a constant rhythm of 50% Robot / 50% Static.
                    const isRobot = Math.random() < 0.5;

                    if (isRobot) {
                         keptObjects.push({
                            id: uuidv4(),
                            type: ObjectType.ALIEN,
                            position: [lane * LANE_WIDTH, 2.0, spawnZ],
                            active: true,
                            color: '#ef4444'
                        });
                    } else {
                        keptObjects.push({
                            id: uuidv4(),
                            type: ObjectType.OBSTACLE,
                            position: [lane * LANE_WIDTH, 0, spawnZ],
                            active: true,
                            color: '#dc2626'
                        });
                    }
                }
                hasChanges = true;
             }
         }
    }

    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }

    if (feedbackRef.current.length > 0) {
        setRenderTrigger(t => t + 1);
    }
  });

  return (
    <group>
      <ParticleSystem />
      <ScoreFeedback items={feedbackRef.current} />
      {objectsRef.current.map(obj => {
        if (!obj.active) return null;
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const visualRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], 0, data.position[2]);
        }

        if (visualRef.current) {
            const baseHeight = data.position[1];
            const time = state.clock.elapsedTime;
            
            if (data.type === ObjectType.GEM || data.type === ObjectType.LETTER) {
                visualRef.current.rotation.y += delta * 3;
                visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.MISSILE) {
                 visualRef.current.rotation.z += delta * 15; 
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.ALIEN) {
                 visualRef.current.position.y = baseHeight + Math.sin(time * 3) * 0.2;
                 visualRef.current.rotation.y = 0; 
                 
                 if(rightArmRef.current) rightArmRef.current.rotation.x = -Math.PI / 2 + Math.sin(time * 5) * 0.1;
                 if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time * 2) * 0.3;
            } else {
                visualRef.current.position.y = baseHeight;
            }
        }
    });

    return (
        <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
            <group ref={visualRef} position={[0, data.position[1], 0]}>
                
                {data.type === ObjectType.OBSTACLE && (
                    <group position={[0, 0.6, 0]}> {/* Lowered visual center for new 1.2 height */}
                        <mesh geometry={PYRAMID_GEO}>
                             <meshStandardMaterial 
                                color="#ff0000" 
                                emissive="#ff0000" 
                                emissiveIntensity={2.0} 
                                roughness={0.2} 
                                metalness={0.8}
                             />
                        </mesh>
                         <mesh geometry={PYRAMID_GEO} scale={[1.05, 1.05, 1.05]}>
                             <meshBasicMaterial color="#ffcccc" wireframe transparent opacity={0.3} />
                        </mesh>
                    </group>
                )}

                {data.type === ObjectType.ALIEN && (
                    <group>
                        <group position={[0, 0.5, 0]}>
                            <mesh geometry={ROBOT_HEAD_GEO}>
                                <meshStandardMaterial color="#111" roughness={0.3} metalness={0.8} />
                            </mesh>
                            <mesh position={[0, 0, 0.18]} scale={[0.8, 0.2, 1]}>
                                <boxGeometry args={[0.3, 0.3, 0.05]} />
                                <meshBasicMaterial color="#ff0000" />
                            </mesh>
                            <pointLight position={[0, 0.3, 0]} color="#ff0000" intensity={2} distance={3} />
                        </group>

                        <mesh position={[0, 0, 0]} geometry={ROBOT_TORSO_GEO}>
                             <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
                        </mesh>
                        <mesh position={[0, 0, 0.16]}>
                            <circleGeometry args={[0.1, 16]} />
                            <meshBasicMaterial color="#ff0000" />
                        </mesh>

                        <group ref={rightArmRef} position={[-0.4, 0.2, 0]}>
                            <mesh position={[0, -0.2, 0]} geometry={ROBOT_LIMB_GEO}>
                                <meshStandardMaterial color="#334155" />
                            </mesh>
                            <mesh position={[0, -0.4, 0.3]} geometry={ROBOT_GUN_GEO}>
                                <meshStandardMaterial color="#111" emissive="#333" />
                            </mesh>
                            <mesh position={[0, -0.4, 0.75]}>
                                <sphereGeometry args={[0.05]} />
                                <meshBasicMaterial color="#ff0000" />
                            </mesh>
                        </group>

                        <group ref={leftArmRef} position={[0.4, 0.2, 0]}>
                            <mesh position={[0, -0.2, 0]} geometry={ROBOT_LIMB_GEO}>
                                <meshStandardMaterial color="#334155" />
                            </mesh>
                        </group>

                        <group position={[-0.15, -0.3, 0]} rotation={[0.2, 0, 0]}>
                             <mesh position={[0, -0.3, 0]} geometry={ROBOT_LIMB_GEO}>
                                <meshStandardMaterial color="#1e293b" />
                            </mesh>
                        </group>
                        <group position={[0.15, -0.3, 0]} rotation={[0.1, 0, 0]}>
                             <mesh position={[0, -0.3, 0]} geometry={ROBOT_LIMB_GEO}>
                                <meshStandardMaterial color="#1e293b" />
                            </mesh>
                        </group>
                    </group>
                )}

                {data.type === ObjectType.MISSILE && (
                    <group>
                        <mesh geometry={SPIKE_GEO}>
                            <meshStandardMaterial 
                                color="#ff0000" 
                                emissive="#ef4444"
                                emissiveIntensity={4}
                                transparent
                                opacity={0.9}
                            />
                        </mesh>
                        <pointLight color="#ff0000" intensity={2} distance={4} decay={2} />
                    </group>
                )}

                {data.type === ObjectType.GEM && (
                    <group>
                        <mesh geometry={COIN_GEO}>
                            <meshStandardMaterial 
                                color="#fbbf24" 
                                metalness={1} 
                                roughness={0.2} 
                                emissive="#d97706"
                                emissiveIntensity={0.4}
                            />
                        </mesh>
                    </group>
                )}

                {data.type === ObjectType.LETTER && (
                    <group>
                        <mesh geometry={LARGE_COIN_GEO}>
                            <meshStandardMaterial 
                                color="#ffd700" 
                                metalness={0.9} 
                                roughness={0.1} 
                                emissive="#fbbf24"
                                emissiveIntensity={0.6}
                            />
                        </mesh>
                        
                         <Center position={[0, 0, 0.06]}>
                             <Text3D 
                                font={FONT_URL} 
                                size={0.8} 
                                height={0.1} 
                             >
                                {data.value}
                                <meshStandardMaterial color="#ffffff" />
                             </Text3D>
                         </Center>
                         
                         <Center position={[0, 0, -0.06]} rotation={[0, Math.PI, 0]}>
                             <Text3D 
                                font={FONT_URL} 
                                size={0.8} 
                                height={0.1} 
                             >
                                {data.value}
                                <meshStandardMaterial color="#ffffff" />
                             </Text3D>
                         </Center>
                         
                         <pointLight color="#ffd700" intensity={1} distance={3} />
                    </group>
                )}
            </group>
        </group>
    );
});
