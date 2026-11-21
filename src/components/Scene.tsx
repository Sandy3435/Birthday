import { Suspense } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import MemoryItem from './MemoryItem';
import { useStore } from '../store';
import { appreciationItems } from '../data/appreciations';
import { CAMERA_START_Y, CAMERA_END_Y } from '../lib/layout';
import { useReducedMotion } from '../hooks/useReducedMotion';

function ScrollRig({ reducedMotion }: { reducedMotion: boolean }) {
  const scroll = useScroll();
  const { camera } = useThree();
  const setScroll = useStore((s) => s.setScroll);
  useFrame(() => {
    const o = scroll.offset;
    setScroll(o);
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    const baseZ = aspect < 1 ? 8.8 : 6.5;
    const startY = CAMERA_START_Y;
    const endY = CAMERA_END_Y;
    const baseY = startY + (endY - startY) * o;
    camera.position.y = reducedMotion ? baseY : baseY + Math.sin(o * Math.PI) * 0.15;
    camera.position.z = baseZ - o * 2.4;
    camera.position.x = reducedMotion ? 0 : Math.sin(o * Math.PI * 1.2) * 0.25;
    camera.lookAt(0, camera.position.y - 1.6, 0);
  });
  return null;
}

export default function Scene() {
  const reducedMotion = useReducedMotion();
  return (
    <Suspense fallback={null}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 6]} intensity={0.9} />
      <directionalLight position={[-4, 6, -3]} intensity={0.35} color="#F5F0E8" />
      <Environment preset="studio" />
      {appreciationItems.map((_, i) => (
        <MemoryItem key={i} index={i} reducedMotion={reducedMotion} />
      ))}
      <ScrollRig reducedMotion={reducedMotion} />
    </Suspense>
  );
}