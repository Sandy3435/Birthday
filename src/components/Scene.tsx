import { Suspense, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import MemoryItem from './MemoryItem';
import { useStore } from '../store';
import { appreciationItems } from '../data/appreciations';
import { CAMERA_START_Y, CAMERA_END_Y } from '../lib/layout';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const sceneBridge: {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
} = { scene: null, camera: null };

function SceneBridge() {
  const { scene, camera } = useThree();
  sceneBridge.scene = scene;
  sceneBridge.camera = camera;
  return null;
}

function ScrollRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera } = useThree();
  const setScroll = useStore((s) => s.setScroll);
  const scroll = useStore((s) => s.scroll);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const o = max > 0 ? window.scrollY / max : 0;
      setScroll(Math.min(1, Math.max(0, o)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScroll]);

  useFrame(() => {
    const o = scroll;
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    const narrow = aspect < 1;
    const baseZ = narrow ? 11 : 6.5;
    const startY = CAMERA_START_Y;
    const endY = CAMERA_END_Y;
    const baseY = startY + (endY - startY) * o;
    camera.position.y = reducedMotion ? baseY : baseY + Math.sin(o * Math.PI) * 0.15;
    camera.position.z = baseZ - o * (narrow ? 1.8 : 2.4);
    camera.position.x = reducedMotion ? 0 : Math.sin(o * Math.PI * 1.2) * 0.25;
    camera.lookAt(0, camera.position.y - 1.6, 0);
  });
  return null;
}

export default function Scene() {
  const reducedMotion = useReducedMotion();
  return (
    <>
      <SceneBridge />
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 6]} intensity={0.9} />
      <directionalLight position={[-4, 6, -3]} intensity={0.35} color="#F5F0E8" />
      {appreciationItems.map((_, i) => (
        <MemoryItem key={i} index={i} reducedMotion={reducedMotion} />
      ))}
      <ScrollRig reducedMotion={reducedMotion} />
      </Suspense>
    </>
  );
}