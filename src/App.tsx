import { useRef } from "react";
import Canvas from "./components/canvas/canvas";
import Sidebar from "./components/sidebar";

function App() {
  const canvas = useRef<HTMLCanvasElement>(null);

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <div className="w-full h-full">
        <Canvas ref={canvas} />
        <div
          className="absolute w-full h-full z-0 bg-neutral-800"
          style={{
            backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
    `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>
    </div>
  );
}

export default App;
