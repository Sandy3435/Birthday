import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { appreciationItems } from '../data/appreciations';
import { balloonPositions, cardPositions } from '../lib/layout';
import { useStore } from '../store';
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

  // draggable base position (float animation is applied around this)
  const basePos = useRef<[number, number, number]>([...balloonPos] as [number, number, number]);

  // flip state (lifted here so the whole item can handle clicks + dragging)
  const [flipped, setFlipped] = useState(false);
  const flippedRef = useRef(false);

  // gesture bookkeeping
  const lastTap = useRef(0);
  const clickTimer = useRef<number | null>(null);
  const ignoreClick = useRef(false);
  const dragging = useRef(false);

  const { camera, gl } = useThree();

  const stringPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    const start: [number, number, number] = [0, -0.52 * (item.balloonSize ?? 1), 0];
    const end = cardRel;
    const segments = 18;
    const sag = 0.18;
    for (let k = 0; k <= segments; k++) {
      const t = k / segments;
      const x = start[0] + (end[0] - start[0]) * t;
      const y =
        start[1] +
        (end[1] - start[1]) * t +
        Math.sin(t * Math.PI) * sag * (0.6 + 0.4 * Math.sin(seed * 10));
      const z = start[2] + (end[2] - start[2]) * t;
      pts.push([x, y, z]);
    }
    return pts;
  }, [cardRel, item.balloonSize, seed]);

  const fireConfetti = () => {
    if (!groupRef.current) return;
    const p = new THREE.Vector3();
    groupRef.current.getWorldPosition(p);
    p.project(camera);
    const x = (p.x + 1) / 2;
    const y = (1 - p.y) / 2;
    confetti({
      origin: { x: Math.min(Math.max(x, 0.05), 0.95), y: Math.min(Math.max(y, 0.05), 0.95) },
      particleCount: reducedMotion ? 12 : 40,
      spread: 60,
      colors: ['#FFFFFF', '#BFDBFE', '#1E3A8A', '#93C5FD', '#E0EAFF'],
      gravity: 0.7,
      ticks: 180,
      scalar: 0.85,
      shapes: ['circle', 'square'],
    });
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (dragging.current || ignoreClick.current) return;

    // A second click quickly after the first cancels the single-click flip.
    if (clickTimer.current !== null) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null;
      const next = !flippedRef.current;
      flippedRef.current = next;
      setFlipped(next);
      if (next) {
        const st = useStore.getState();
        if (!st.opened.has(item.id)) {
          st.open(item.id);
          if (!reducedMotion) fireConfetti();
        }
      }
    }, 260);
  };

  const startDrag = (e: any) => {
    if (!groupRef.current) return;

    const plane = new THREE.Plane();
    const worldPos = new THREE.Vector3();
    groupRef.current.getWorldPosition(worldPos);
    const normal = new THREE.Vector3();
    camera.getWorldDirection(normal);
    plane.setFromNormalAndCoplanarPoint(normal, worldPos);

    const start = new THREE.Vector3();
    if (!e.ray.intersectPlane(plane, start)) return;

    const origin = groupRef.current.position.clone();
    dragging.current = true;

    const move = (ev: PointerEvent) => {
      if (!dragging.current || !groupRef.current) return;
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1
      );
      const rc = new THREE.Raycaster();
      rc.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (rc.ray.intersectPlane(plane, hit)) {
        const delta = hit.clone().sub(start);
        const nx = origin.x + delta.x;
        const ny = origin.y + delta.y;
        const nz = origin.z + delta.z;
        groupRef.current.position.set(nx, ny, nz);
        basePos.current = [nx, ny, nz];
      }
    };

    const up = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      // Let the synthetic click from this gesture be swallowed.
      window.setTimeout(() => {
        ignoreClick.current = false;
      }, 0);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const handlePointerDown = (e: any) => {
    if (e.button !== undefined && e.button !== 0) return;
    const now = performance.now();
    if (now - lastTap.current < 320) {
      // double tap + hold -> drag the balloon and its photo
      if (clickTimer.current !== null) {
        window.clearTimeout(clickTimer.current);
        clickTimer.current = null;
      }
      ignoreClick.current = true;
      startDrag(e);
    } else {
      lastTap.current = now;
    }
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    if (dragging.current) return;

    const t = state.clock.elapsedTime;
    groupRef.current.position.x = basePos.current[0];
    groupRef.current.position.z = basePos.current[2];
    groupRef.current.position.y =
      basePos.current[1] + Math.sin(t * 0.8 + seed * 6) * 0.12;
    groupRef.current.rotation.z = Math.sin(t * 0.6 + seed * 4) * 0.06;
    groupRef.current.rotation.x = Math.sin(t * 0.45 + seed * 2) * 0.03;
  });

  return (
    <group ref={groupRef} position={balloonPos}>
      <Balloon
        size={item.balloonSize ?? 1}
        seed={seed}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      />
      <BalloonString points={stringPoints} />
      <MemoryPhoto
        item={item}
        reducedMotion={reducedMotion}
        position={cardRel}
        flipped={flipped}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      />
    </group>
  );
}
