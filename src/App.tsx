import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import Overlay from './components/Overlay';
import { SCROLL_PAGES } from './lib/layout';

export default function App() {
  return (
    <div className="app">
      <div className="bg-text" aria-hidden="true">
        <h1>Happy Birthday, Superman.</h1>
        <p>Twenty-seven little things, and probably a million more.</p>
      </div>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          camera={{ position: [0, 8.5, (typeof window !== 'undefined' && window.innerWidth < 640) ? 8.8 : 6.5], fov: 50, near: 0.1, far: 100 }}
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
      <div className="scroll-spacer" aria-hidden="true" style={{ height: `${SCROLL_PAGES * 100}vh`, pointerEvents: 'none' }} />
      <Overlay />
    </div>
  );
}