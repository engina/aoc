import { Canvas } from '@react-three/fiber';
import { Leva } from 'leva';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';
import { Scene } from './Scene';
import './styles/main.css';

function Main() {
  return (
    <div className='main'>
      <Leva
        collapsed={false}
        oneLineLabels={false}
        flat={true}
        theme={{
          sizes: {
            titleBarHeight: '28px',
          },
          fontSizes: {
            root: '10px',
          },
        }}
      />
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{
          fov: 55,
          near: 0.1,
          far: 2000000,
          position: [30, 20, 90].map((n) => n * 10) as [number, number, number],
        }}
        shadows
      >
        <Scene />
      </Canvas>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
