import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
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
      <Canvas
        camera={{ position: [0, 8.5, (typeof window !== 'undefined' && window.innerWidth < 640) ? 8.8 : 6.5], fov: 50, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        style={{ position: 'absolute', inset: 0, zIndex: 1 }}
      >
        <ScrollControls pages={SCROLL_PAGES} damping={0.2}>
          <Scene />
        </ScrollControls>
      </Canvas>
      <Overlay />
    </div>
  );
}