
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';

// City Lights (Particles)
const CityLights: React.FC = () => {
  const { speed, status, showTutorial } = useStore();
  const count = 1000;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
       let x = (Math.random() - 0.5) * 300;
       const y = Math.random() * 100; // Skyscrapers height
       const z = -400 + Math.random() * 500;
       const scaleX = 2 + Math.random() * 3; // Window shape
       const scaleY = 4 + Math.random() * 6; 
       
       // Don't spawn in middle lane
       if (Math.abs(x) < 20) {
           if (x < 0) x -= 20;
           else x += 20;
       }

       temp.push({ x, y, z, scaleX, scaleY, speedOffset: Math.random() });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
      if (!meshRef.current) return;
      if (status !== GameStatus.PLAYING || showTutorial) return;
      
      const activeSpeed = speed > 0 ? speed : 2;

      particles.forEach((p, i) => {
          p.z += activeSpeed * delta;
          if (p.z > 50) {
              p.z = -450;
              p.x = (Math.random() - 0.5) * 300;
              if (Math.abs(p.x) < 20) p.x += 30; // Push away from center
          }

          dummy.position.set(p.x, p.y, p.z);
          dummy.scale.set(p.scaleX, p.scaleY, 1);
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#bae6fd" transparent opacity={0.8} />
    </instancedMesh>
  );
};

const LaneGuides: React.FC = () => {
    const { laneCount } = useStore();
    
    const separators = useMemo(() => {
        const lines: number[] = [];
        const startX = -(laneCount * LANE_WIDTH) / 2;
        
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    return (
        <group position={[0, 0.02, 0]}>
            {/* Road Floor - Glossy Asphalt */}
            <mesh position={[0, -0.05, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[laneCount * LANE_WIDTH + 10, 200]} />
                <meshStandardMaterial 
                    color="#0f172a" 
                    roughness={0.2} 
                    metalness={0.6} 
                />
            </mesh>

            {/* Lane Separators */}
            {separators.map((x, i) => (
                <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.08, 200]} /> 
                    <meshBasicMaterial 
                        color="#3b82f6" 
                        transparent 
                        opacity={0.4} 
                    />
                </mesh>
            ))}
        </group>
    );
};

const GlobalMarketSun: React.FC = () => {
    // A giant stylized globe/network instead of a sun
    const groupRef = useRef<THREE.Group>(null);
    const { status, showTutorial } = useStore();

    useFrame((state) => {
        if (groupRef.current && status === GameStatus.PLAYING && !showTutorial) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[0, 40, -200]}>
            <mesh>
                <icosahedronGeometry args={[40, 2]} />
                <meshBasicMaterial color="#1d4ed8" wireframe transparent opacity={0.4} />
            </mesh>
            <mesh scale={[0.95, 0.95, 0.95]}>
                <sphereGeometry args={[40, 32, 32]} />
                <meshBasicMaterial color="#000" />
            </mesh>
        </group>
    );
};

const MovingGrid: React.FC = () => {
    const { speed, status, showTutorial } = useStore();
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
             if (status !== GameStatus.PLAYING || showTutorial) return;
             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;
             
             const cellSize = 10;
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
            <planeGeometry args={[300, 400, 30, 40]} />
            <meshBasicMaterial 
                color="#2563eb" 
                wireframe 
                transparent 
                opacity={0.15} 
            />
        </mesh>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <fog attach="fog" args={['#020617', 20, 100]} />
      
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[10, 20, 5]} intensity={1.5} color="#ffffff" castShadow />
      
      {/* Accent Lights for Cyber Feel */}
      <pointLight position={[-20, 10, -50]} intensity={1} color="#3b82f6" distance={100} />
      <pointLight position={[20, 10, -50]} intensity={1} color="#ef4444" distance={100} />

      <CityLights />
      <MovingGrid />
      <LaneGuides />
      
      <GlobalMarketSun />
    </>
  );
};
