import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { appreciationItems } from '../data/appreciations';
import { balloonPositions, cardPositions } from '../lib/layout';
import Balloon from './Balloon';
import BalloonString from './BalloonString';
import MemoryPhoto from './MemoryPhoto';

interface Props {
  index: number;
  reducedMotion: boolean;
}

export default function MemoryItem({ index, reducedMotion }: Props) {
  const item = appreciationItems[index];
  const balloonPos = balloonPositions[index];
  const cardPos = cardPositions[index];
  const cardRel = useMemo<[number, number, number]>(
    () => [cardPos[0] - balloonPos[0], cardPos[1] - balloonPos[1], cardPos[2] - balloonPos[2]],
    [cardPos, balloonPos]
  );

  const groupRef = useRef<THREE.Group>(null);
  const seed = item.animationSeed ?? index * 0.37;

  const stringPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const start: [number, number, number] = [0, -0.46 * (item.balloonSize ?? 1), 0];
    const end = cardRel;
    const segments = 18;
    const sag = 0.18;
    for (let k = 0; k <= segments; k++) {
      const t = k / segments;
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t + Math.sin(t * Math.PI) * sag * (0.6 + 0.4 * Math.sin(seed * 10));
      const z = start[2] + (end[2] - start[2]) * t;
      pts.push([x, y, z]);
    }
    return pts;
  }, [cardRel, item.balloonSize, seed]);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = balloonPos[1] + Math.sin(t * 0.8 + seed * 6) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 0.6 + seed * 4) * 0.06;
    groupRef.current.rotation.x = Math.sin(t * 0.45 + seed * 2) * 0.03;
  });

  return (
    <group ref={groupRef} position={[balloonPos[0], balloonPos[1], balloonPos[2]]}>
      <Balloon size={item.balloonSize ?? 1} seed={seed} />
      <BalloonString points={stringPoints} />
      <MemoryPhoto item={item} reducedMotion={reducedMotion} position={cardRel} />
    </group>
  );
}