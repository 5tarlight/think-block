import { useState } from "react";
import { cubicPath, type Edge } from "../../store/graphics";

export default function Vertex({
  edge,
  portScreenPos,
  screenToWorld,
  camera,
}: {
  edge: Edge;
  portScreenPos: (nodeId: string, portId: string) => { x: number; y: number };
  screenToWorld: (
    p: { x: number; y: number },
    camera: { scale: number; tx: number; ty: number }
  ) => {
    x: number;
    y: number;
  };
  camera: { scale: number; tx: number; ty: number };
}) {
  const a = portScreenPos(edge.from.node, edge.from.port);
  const b = portScreenPos(edge.to.node, edge.to.port);
  const aw = screenToWorld(a, camera);
  const bw = screenToWorld(b, camera);

  const [isHover, setIsHover] = useState(false);

  return (
    <>
      {/* fake hitbox */}
      <path
        d={cubicPath(aw, bw)}
        stroke="transparent"
        strokeWidth={10}
        fill="none"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => console.log("edge clicked")}
        className="pointer-events-auto"
        style={{ cursor: "pointer" }}
      />
      <path
        d={cubicPath(aw, bw)}
        stroke={isHover ? "#3b82f6" : "#60a5fa"}
        fill="none"
        strokeWidth={isHover ? 4 : 2}
        className="transition-all"
      />
    </>
  );
}
