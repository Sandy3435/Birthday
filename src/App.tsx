import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Scene, { sceneBridge } from './components/Scene';
import Overlay from './components/Overlay';
import { SCROLL_PAGES } from './lib/layout';
import { useStore } from './store';

export default function App() {
  const scroll = useStore((s) => s.scroll);
  const sceneVisible = scroll > 0.06;

  // Manual raycast from a transparent HTML layer. This is more reliable than
  // relying on R3F's pointer events across resizes, touch and scroll.
  const handleSceneClick = (e: any) => {
    if (!sceneVisible) return;
    const { scene, camera } = sceneBridge;
    if (!scene || !camera) return;

    const ndc = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(scene.children, true);

    for (const h of hits) {
      let obj: THREE.Object3D | null = h.object;
      while (obj) {
        const id = obj.userData?.photoId;
        if (typeof id === 'number') {
          useStore.getState().toggleFlip(id);
          return;
        }
        obj = obj.parent;
      }
    }
  };

  return (
    <div className="app">
      <div className="bg-text" aria-hidden="true">
        <h1>Happy Birthday, Superman.</h1>
        <p>Twenty-seven things I appreciate about you, even though there is a million million more.</p>
      </div>

      <div
        className={`scene-layer ${sceneVisible ? 'visible' : ''}`}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}
      >
        <Canvas
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 8.5, (typeof window !== 'undefined' && window.innerWidth < 640) ? 11 : 6.5], fov: 50, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
          onCreated={({ gl, camera, set }) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            gl.setSize(w, h);
            set({ size: { width: w, height: h, top: 0, left: 0 } });
            if ('aspect' in camera) {
              (camera as any).aspect = w / h;
              (camera as any).updateProjectionMatrix();
            }
          }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Transparent interaction layer: captures taps/clicks and raycasts manually. */}
      <div
        onClick={handleSceneClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: sceneVisible ? 'auto' : 'none',
          touchAction: 'pan-y',
          cursor: 'pointer',
        }}
        aria-hidden="true"
      />

      {/* Standalone line, a scroll section just before the first picture. */}
      <div className="intro-line">I appreciate and love...</div>

      <div className="scroll-spacer" aria-hidden="true" style={{ height: `${SCROLL_PAGES * 100}vh`, pointerEvents: 'none' }} />
      <Overlay />
    </div>
  );
}
