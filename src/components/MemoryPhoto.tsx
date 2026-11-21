import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

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
  flipped: boolean;
}

/**
 * Draws the reverse side of the card to a canvas texture.
 * White card, bold black message text, royal-blue border + footer.
 */
function makeBackTexture(message: string, id: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 853;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = 5;
  ctx.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);

  let fontSize = 34;
  let lineHeight = 46;
  const maxWidth = canvas.width - 96;
  const wrap = (fs: number) => {
    ctx.font = `bold italic ${fs}px "Cormorant Garamond", "Playfair Display", Georgia, serif`;
    const ls: string[] = [];
    let l = '';
    for (const w of message.split(' ')) {
      const test = l ? l + ' ' + w : w;
      if (ctx.measureText(test).width > maxWidth && l) {
        ls.push(l);
        l = w;
      } else {
        l = test;
      }
    }
    if (l) ls.push(l);
    return ls;
  };
  let lines = wrap(fontSize);
  while (lines.length > 13 && fontSize > 20) {
    fontSize -= 2;
    lineHeight -= 2;
    lines = wrap(fontSize);
  }

  ctx.fillStyle = '#111111';
  ctx.font = `bold italic ${fontSize}px "Cormorant Garamond", "Playfair Display", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const startY = Math.max(60, canvas.height / 2 - (lines.length * lineHeight) / 2 + 8);
  lines.forEach((l, i) => {
    ctx.fillText(l, canvas.width / 2, startY + i * lineHeight);
  });

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 17px "DM Sans", sans-serif';
  ctx.fillText(`${String(id).padStart(2, '0')} / 27`, canvas.width / 2, canvas.height - 46);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export default function MemoryPhoto({ item, reducedMotion, position, flipped }: Props) {
  const mem = item;
  const popRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Group>(null);
  const photoMeshRef = useRef<THREE.Mesh>(null);

  const flipTarget = useRef(0);
  const popAmount = useRef(0);

  const photoTex = useTexture(mem.image);
  const backTex = useMemo(() => makeBackTexture(mem.message, mem.id), [mem.message, mem.id]);

  // Preserve the photo aspect ratio inside the frame (no stretching).
  useEffect(() => {
    const img = photoTex.image as { width: number; height: number } | undefined;
    if (!img || !img.width || !img.height || !photoMeshRef.current) return;
    const aspect = img.width / img.height;
    const boxW = 1.2;
    const boxH = 1.6;
    const boxAspect = boxW / boxH;
    let sx = 1;
    let sy = 1;
    if (aspect > boxAspect) sy = boxAspect / aspect;
    else sx = aspect / boxAspect;
    photoMeshRef.current.scale.set(sx, sy, 1);
  }, [photoTex]);

  const initRot = ((mem.photoRotation ?? 0) * Math.PI) / 180;

  useEffect(() => {
    if (cardRef.current) cardRef.current.rotation.z = initRot;
  }, [initRot]);

  useFrame((_, delta) => {
    if (!cardRef.current) return;

    const target = flipped ? Math.PI : 0;
    const speed = reducedMotion ? 16 : 7;
    flipTarget.current += (target - flipTarget.current) * Math.min(1, delta * speed);
    if (Math.abs(target - flipTarget.current) < 0.001) flipTarget.current = target;
    cardRef.current.rotation.y = flipTarget.current;

    if (popRef.current) {
      const targetPop = flipped ? 1 : 0;
      popAmount.current += (targetPop - popAmount.current) * Math.min(1, delta * 6);
      const p = popAmount.current;
      popRef.current.position.z = p * 1.15;
      popRef.current.scale.setScalar(1 + p * 0.42);
    }
  });

  const frameW = 1.35;
  const frameH = 1.78;
  const photoW = 1.2;
  const photoH = 1.6;

  // These two photos are shown upside down on the front only.
  const upsideDown = mem.id === 13 || mem.id === 17;

  return (
    <group position={position}>
      <group ref={popRef}>
        <group ref={cardRef}>
          {/* BACK: royal-blue frame, behind the message after the flip */}
          <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[frameW, frameH]} />
            <meshBasicMaterial color="#1E3A8A" side={THREE.DoubleSide} />
          </mesh>

          {/* BACK: message texture, front-most once flipped */}
          <mesh position={[0, 0, -0.01]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[photoW, photoH]} />
            <meshBasicMaterial map={backTex} side={THREE.DoubleSide} />
          </mesh>

          {/* FRONT: white frame */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[frameW, frameH]} />
            <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
          </mesh>

          {/* FRONT: photo (13 and 17 upside down; back text stays upright) */}
          <mesh
            ref={photoMeshRef}
            position={[0, 0, 0.01]}
            rotation={[0, 0, upsideDown ? Math.PI : 0]}
          >
            <planeGeometry args={[photoW, photoH]} />
            <meshBasicMaterial map={photoTex} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
