import Hyperbeam from "@hyperbeam/web";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

function Browser({ container, embedUrl, onListenerUpdate, ...restProps }) {
  const audioRef = useRef(null);
  const [hyperbeam, setHyperbeam] = useState(null);
  const [texture, setTexture] = useState(() => new THREE.Texture());
  const [listener, setListener] = useState(() => new THREE.AudioListener());
  const { camera } = useThree();

  useEffect(() => {
    camera.add(listener);
    onListenerUpdate(listener);
    return () => {
      camera.remove(listener);
      onListenerUpdate(null);
    };
  }, [camera, listener]);

  useEffect(() => {
    (async () => {
      if (hyperbeam) return;
      setHyperbeam(
        await Hyperbeam(container, embedUrl, {
          frameCb: (frame) => {
            const updatedTexture = new THREE.Texture();
            updatedTexture.flipY = false;
            updatedTexture.generateMipmaps = false;
            updatedTexture.image = frame;
            updatedTexture.needsUpdate = true;
            setTexture(updatedTexture);
          },
          audioTrackCb: (audioTrack) => {
            audioRef.current.setMediaStreamSource(
              new MediaStream([audioTrack])
            );
          },
        })
      );
    })();
  }, [container, embedUrl]);

  return (
    <mesh
      {...restProps}
      rotation={[0, Math.PI, Math.PI]}
      onPointerDown={(e) => {
        if (hyperbeam) {
          hyperbeam.sendEvent({
            type: "mousedown",
            x: e.intersections[0].uv.x,
            y: e.intersections[0].uv.y,
            button: e.button,
          });
        }
      }}
      onPointerMove={(e) => {
        if (hyperbeam) {
          hyperbeam.sendEvent({
            type: "mousemove",
            x: e.intersections[0].uv.x,
            y: e.intersections[0].uv.y,
            button: e.button,
          });
        }
      }}
      onPointerUp={(e) => {
        if (hyperbeam) {
          hyperbeam.sendEvent({
            type: "mouseup",
            x: e.intersections[0].uv.x,
            y: e.intersections[0].uv.y,
            button: e.button,
          });
        }
      }}
      onWheel={(e) => {
        if (hyperbeam) {
          hyperbeam.sendEvent({
            type: "wheel",
            deltaX: e.deltaX,
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
      <positionalAudio args={[listener]} ref={audioRef} />
    </mesh>
  );
}

function App() {
  const hyperbeamContainerRef = useRef(null);
  const [areControlsEnabled, setAreControlsEnabled] = useState(true);
  const [embedUrl, setEmbedUrl] = useState(""); // Running locally and have an embed URL? Paste it here!
  const [listener, setListener] = useState(null);

  useEffect(() => {
    (async () => {
      if (embedUrl) {
        return;
      }
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
      setEmbedUrl(body.url);
    })();
  }, []);

  return (
    <div className="App">
      <div className="hyperbeam-container" ref={hyperbeamContainerRef}></div>
      <div className="canvas-container">
        <Canvas
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={() => {
            if (listener.context.state === "suspended") {
              listener.context.resume();
            }
          }}
          onPointerUp={() => {
            if (listener.context.state === "suspended") {
              listener.context.resume();
            }
          }}
        >
          {hyperbeamContainerRef.current && embedUrl && (
            <Browser
              container={hyperbeamContainerRef.current}
              embedUrl={embedUrl}
              onPointerEnter={() => setAreControlsEnabled(false)}
              onPointerLeave={() => setAreControlsEnabled(true)}
              onListenerUpdate={setListener}
            />
          )}
          <OrbitControls makeDefault enabled={areControlsEnabled} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;
