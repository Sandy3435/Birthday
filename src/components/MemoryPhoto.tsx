import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { useStore } from '../store';

interface Item {
  id: number;
  image: string;
  message: string;
  position: { x: number; y: number; z: number };
  balloonSize?: number;
  photoRotation?: number;
}

interface Props {
  item: Item;
  reducedMotion: boolean;
  position: [number, number, number];
}

export default function MemoryPhoto({ item, reducedMotion, position }: Props) {
  const mem = item;
  const cardRef = useRef<THREE.Group>(null);
  const photoMeshRef = useRef<THREE.Mesh>(null);
  const [flipped, setFlipped] = useState(false);
  const flipTarget = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });
  const hover = useRef(false);
  const opened = useStore((s) => s.opened);
  const open = useStore((s) => s.open);
  const { camera } = useThree();

  const photoTex = useTexture(mem.image);

  useEffect(() => {
    const img = photoTex.image as { width: number; height: number } | undefined;
    if (!img || !img.width || !img.height || !photoMeshRef.current) return;
    const aspect = img.width / img.height;
    const boxW = 1.2;
    const boxH = 1.6;
    const boxAspect = boxW / boxH;
    let sx = 1;
    let sy = 1;
    if (aspect > boxAspect) {
      sx = 1;
      sy = boxAspect / aspect;
    } else {
      sy = 1;
      sx = aspect / boxAspect;
    }
    photoMeshRef.current.scale.set(sx, sy, 1);
  }, [photoTex]);

  const initRot = ((mem.photoRotation ?? 0) * Math.PI) / 180;

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.rotation.z = initRot;
    }
  }, [initRot]);

  useFrame((_, delta) => {
    if (!cardRef.current) return;
    const target = flipped ? Math.PI : 0;
    const speed = reducedMotion ? 16 : 7;
    flipTarget.current += (target - flipTarget.current) * Math.min(1, delta * speed);
    cardRef.current.rotation.y = flipTarget.current + tilt.current.y;
    cardRef.current.rotation.x = tilt.current.x;
    // gentle hover lift via scale
    const targetScale = hover.current ? 1.04 : 1;
    cardRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
  });

  const fireConfetti = () => {
    if (!cardRef.current) return;
    const pos = new THREE.Vector3();
    cardRef.current.getWorldPosition(pos);
    pos.project(camera);
    const x = (pos.x + 1) / 2;
    const y = (1 - pos.y) / 2;
    confetti({
      origin: { x: Math.min(Math.max(x, 0.05), 0.95), y: Math.min(Math.max(y, 0.05), 0.95) },
      particleCount: reducedMotion ? 12 : 40,
      spread: 60,
      colors: ['#FFFFFF', '#F5F0E8', '#E8DCCB', '#F4E8E8', '#D8D5D0'],
      gravity: 0.7,
      ticks: 180,
      scalar: 0.85,
      shapes: ['circle', 'square'],
    });
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    const nowFlipped = !flipped;
    setFlipped(nowFlipped);
    const wasOpened = opened.has(mem.id);
    if (nowFlipped && !wasOpened) {
      open(mem.id);
      if (!reducedMotion) fireConfetti();
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    hover.current = true;
  };
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    hover.current = false;
    tilt.current.x = 0;
    tilt.current.y = 0;
  };
  const handlePointerMove = (e: any) => {
    if (!e.point) return;
    const dx = e.point.x - position[0];
    const dy = e.point.y - position[1];
    tilt.current.y = dx * 0.12;
    tilt.current.x = -dy * 0.12;
  };

  const frameW = 1.35;
  const frameH = 1.78;
  const photoW = 1.2;
  const photoH = 1.6;

  return (
    <group position={position}>
      {/* invisible hit area for reliable clicking */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerMove}
        visible={true}
      >
        <planeGeometry args={[frameW, frameH]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <group ref={cardRef}>
        {/* back frame */}
        <mesh position={[0, 0, -0.008]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[frameW, frameH]} />
          <meshStandardMaterial color="#1E3A8A" roughness={0.9} />
        </mesh>
        {/* back background */}
        <mesh position={[0, 0, -0.007]} rotation={[0, Math.PI, 0]} onClick={handleClick}>
          <planeGeometry args={[photoW, photoH]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
        {/* back message text */}
        <Text
          position={[0, 0, -0.006]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.085}
          color="#111111"
          maxWidth={0.95}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          lineHeight={1.2}
          onClick={handleClick}
        >
          {mem.message}
        </Text>
        <Text
          position={[0, -0.72, -0.006]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.09}
          color="#1E3A8A"
          anchorX="center"
          anchorY="middle"
          onClick={handleClick}
        >
          {`${String(mem.id).padStart(2, '0')} / 27`}
        </Text>

        {/* front frame */}
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[frameW, frameH]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
        {/* front photo */}
        <mesh ref={photoMeshRef} position={[0, 0, 0.006]} onClick={handleClick}>
          <planeGeometry args={[photoW, photoH]} />
          <meshBasicMaterial map={photoTex} side={THREE.FrontSide} />
        </mesh>

        {/* id label on front bottom */}
        <Text
          position={[0, -0.72, 0.012]}
          fontSize={0.13}
          color="#1E3A8A"
          anchorX="center"
          anchorY="middle"
        >
          {String(mem.id).padStart(2, '0')}
        </Text>
      </group>
    </group>
  );
}