import Hyperbeam from "@hyperbeam/web";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

function App() {
  const hyperbeamContainerRef = useRef(null);
  const [texture, setTexture] = useState(new THREE.Texture());
  const [hyperbeam, setHyperbeam] = useState(null);

  useEffect(() => {
    (async () => {
      const room = location.pathname.substring(1);
      const response = await fetch(
        `https://demo-api.tutturu.workers.dev/${room}`
      );
      if (response.status >= 400) {
        alert(
          "We are out of demo servers! Visit hyperbeam.dev to get your own API key."
        );
        return;
      }
      const body = await response.json();
      if (room !== body.room) {
        history.pushState(null, null, `/${body.room}${location.search}`);
      }
      setHyperbeam(
        await Hyperbeam(hyperbeamContainerRef.current, body.url, {
          frameCb: (frame) => {
            const texture = new THREE.Texture();
            texture.flipY = false;
            texture.generateMipmaps = false;
            texture.image = frame;
            texture.needsUpdate = true;
            setTexture(texture);
          },
        })
      );
    })();
  }, []);

  return (
    <div className="App">
      <div className="hyperbeam-container" ref={hyperbeamContainerRef}></div>
      <div className="canvas-container">
        <Canvas>
          <mesh position={[0, 0, 0]} rotation={[0, Math.PI, Math.PI]}>
            <planeGeometry attach="geometry" args={[10, (9 / 16) * 10]} />
            <meshBasicMaterial
              attach="material"
              map={texture}
              side={THREE.DoubleSide}
            />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
