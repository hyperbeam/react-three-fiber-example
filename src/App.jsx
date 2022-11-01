import Hyperbeam from "@hyperbeam/web";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

function App() {
  const hyperbeamContainerRef = useRef(null);
  const [texture, setTexture] = useState(new THREE.Texture());
  const [hyperbeam, setHyperbeam] = useState(null);
  const [isControlsEnabled, setIsControlsEnabled] = useState(true);

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
          <mesh
            position={[0, 0, 0]}
            rotation={[0, Math.PI, Math.PI]}
            onPointerEnter={() => setIsControlsEnabled(false)}
            onPointerLeave={() => setIsControlsEnabled(true)}
            onPointerDown={(e) => {
              if (hyperbeam) {
                hyperbeam.sendEvent({
                  type: "mousedown",
                  x: e.intersections[0].uv.x,
                  y: e.intersections[0].uv.y,
                });
              }
            }}
            onPointerMove={(e) => {
              if (hyperbeam) {
                hyperbeam.sendEvent({
                  type: "mousemove",
                  x: e.intersections[0].uv.x,
                  y: e.intersections[0].uv.y,
                });
              }
            }}
            onPointerUp={(e) => {
              if (hyperbeam) {
                hyperbeam.sendEvent({
                  type: "mouseup",
                  x: e.intersections[0].uv.x,
                  y: e.intersections[0].uv.y,
                });
              }
            }}
            onWheel={(e) => {
              if (hyperbeam) {
                hyperbeam.sendEvent({
                  type: "wheel",
                  deltaY: e.deltaY,
                });
              }
            }}
          >
            <planeGeometry attach="geometry" args={[10, (9 / 16) * 10]} />
            <meshBasicMaterial
              attach="material"
              map={texture}
              side={THREE.DoubleSide}
            />
          </mesh>
          <OrbitControls makeDefault enabled={isControlsEnabled} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
