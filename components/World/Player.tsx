
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';
import { audio } from '../System/Audio';

const GRAVITY = 50;
const JUMP_FORCE = 16; 

// Business Man Geometry
const TORSO_GEO = new THREE.BoxGeometry(0.5, 0.6, 0.3); // Suit Jacket
const LEGS_GEO = new THREE.BoxGeometry(0.2, 0.7, 0.2); // Trousers
const HEAD_GEO = new THREE.BoxGeometry(0.3, 0.35, 0.3);
const ARM_GEO = new THREE.BoxGeometry(0.15, 0.6, 0.15);
const BRIEFCASE_GEO = new THREE.BoxGeometry(0.4, 0.3, 0.1); // Jetpack

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  
  // Limbs
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const { status, laneCount, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive, showTutorial } = useStore();
  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);
  
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  // Materials
  const { suitMat, skinMat, tieMat, briefcaseMat } = useMemo(() => ({
      suitMat: new THREE.MeshStandardMaterial({ color: '#1e293b' }), // Dark Slate Suit
      skinMat: new THREE.MeshStandardMaterial({ color: '#fca5a5' }),
      tieMat: new THREE.MeshStandardMaterial({ color: '#ef4444' }), // Power Tie
      briefcaseMat: new THREE.MeshStandardMaterial({ color: '#451a03' }) // Leather
  }), []);

  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          isJumping.current = false;
          jumpsPerformed.current = 0;
          velocityY.current = 0;
          if (groupRef.current) groupRef.current.position.y = 0;
      }
  }, [status]);
  
  useEffect(() => {
      const maxLane = Math.floor(laneCount / 2);
      if (Math.abs(lane) > maxLane) {
          setLane(l => Math.max(Math.min(l, maxLane), -maxLane));
      }
  }, [laneCount, lane]);

  const triggerJump = () => {
    // Prevent jump if tutorial is showing
    if (showTutorial) return;

    const maxJumps = hasDoubleJump ? 2 : 1;
    if (!isJumping.current) {
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = JUMP_FORCE;
    } else if (jumpsPerformed.current < maxJumps) {
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = JUMP_FORCE; 
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING || showTutorial) return;
      const maxLane = Math.floor(laneCount / 2);
      if (e.key === 'ArrowLeft') setLane(l => Math.max(l - 1, -maxLane));
      else if (e.key === 'ArrowRight') setLane(l => Math.min(l + 1, maxLane));
      else if (e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') triggerJump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, laneCount, hasDoubleJump, showTutorial]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
        if (status !== GameStatus.PLAYING || showTutorial) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        const maxLane = Math.floor(laneCount / 2);
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
             if (deltaX > 0) setLane(l => Math.min(l + 1, maxLane));
             else setLane(l => Math.max(l - 1, -maxLane));
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -30) {
            triggerJump();
        }
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, laneCount, showTutorial]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Freeze physics if tutorial is open
    if ((status !== GameStatus.PLAYING && status !== GameStatus.SHOP) || showTutorial) return;

    targetX.current = lane * LANE_WIDTH;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX.current, delta * 15);

    if (isJumping.current) {
        groupRef.current.position.y += velocityY.current * delta;
        velocityY.current -= GRAVITY * delta;
        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0;
            isJumping.current = false;
            jumpsPerformed.current = 0;
            velocityY.current = 0;
        }
    }

    const xDiff = targetX.current - groupRef.current.position.x;
    groupRef.current.rotation.z = -xDiff * 0.1; 
    
    // Animation
    const time = state.clock.elapsedTime * 20;
    if (isJumping.current) {
         if(leftLegRef.current) leftLegRef.current.rotation.x = -0.5;
         if(rightLegRef.current) rightLegRef.current.rotation.x = 0.5;
    } else {
         if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 0.8;
         if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
         if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.8;
         if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time) * 0.8;
         if(bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time*2)) * 0.05;
    }

    // Shadow
    if (shadowRef.current) {
        const h = groupRef.current.position.y;
        const s = Math.max(0.2, 1 - h/2);
        shadowRef.current.scale.setScalar(s);
        (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.1, 0.4 - h/3);
    }

    if (isInvincible.current || isImmortalityActive) {
        groupRef.current.visible = Math.floor(Date.now() / 100) % 2 === 0;
    } else {
        groupRef.current.visible = true;
    }
  });

  useEffect(() => {
     const checkHit = () => {
        if (isInvincible.current || isImmortalityActive) return;
        audio.playDamage();
        takeDamage();
        isInvincible.current = true;
        setTimeout(() => isInvincible.current = false, 1500);
     };
     window.addEventListener('player-hit', checkHit);
     return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive]);

  return (
    <group ref={groupRef}>
      <group ref={bodyRef} position={[0, 1.1, 0]}> 
        {/* Torso */}
        <mesh position={[0, 0.4, 0]} geometry={TORSO_GEO} material={suitMat} castShadow />
        {/* Tie */}
        <mesh position={[0, 0.4, 0.16]} scale={[0.2, 0.8, 0.1]}>
            <planeGeometry />
            <meshBasicMaterial color="red" />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.85, 0]} geometry={HEAD_GEO} material={skinMat} />

        {/* Legs */}
        <group position={[-0.15, 0.1, 0]} ref={leftLegRef}>
             <mesh position={[0, -0.35, 0]} geometry={LEGS_GEO} material={suitMat} />
        </group>
        <group position={[0.15, 0.1, 0]} ref={rightLegRef}>
             <mesh position={[0, -0.35, 0]} geometry={LEGS_GEO} material={suitMat} />
        </group>

        {/* Arms */}
        <group position={[-0.35, 0.6, 0]} ref={leftArmRef}>
             <mesh position={[0, -0.25, 0]} geometry={ARM_GEO} material={suitMat} />
        </group>
        <group position={[0.35, 0.6, 0]} ref={rightArmRef}>
             <mesh position={[0, -0.25, 0]} geometry={ARM_GEO} material={suitMat} />
        </group>

        {/* Briefcase (Jetpack) */}
        <mesh position={[0, 0.4, -0.25]} geometry={BRIEFCASE_GEO} material={briefcaseMat} />
      </group>
      
      <mesh ref={shadowRef} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
