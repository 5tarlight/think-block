import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Canvas from "./components/canvas/canvas";
import Sidebar from "./components/sidebar/sidebar";
import {
  screenToWorld,
  uid,
  useCameraState,
  useEdgeState,
  useNodeState,
  worldToScreen,
  type Camera,
  type Node,
  type Vec2,
} from "./store/graphics";

function App() {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { camera, setCamera } = useCameraState();
  const { nodes, setNodes } = useNodeState();
  const { edges, setEdges } = useEdgeState();

  const [menu, setMenu] = useState<{
    open: boolean;
    screen: Vec2;
    world: Vec2;
  } | null>(null);
  const dragState = useRef<
    | { kind: "pan"; start: Vec2; camera0: Camera }
    | { kind: "node"; nodeId: string; start: Vec2; node0: Vec2 }
    | { kind: "wire"; from: { node: string; port: string }; cur: Vec2 }
    | null
  >(null);

  const resizeGrid = useCallback(() => {
    const el = gridRef.current;
    if (!el) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = el.parentElement?.getBoundingClientRect();
    if (!rect) return;
    el.width = Math.floor(rect.width * dpr);
    el.height = Math.floor(rect.height * dpr);
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGrid();
  }, []);

  useEffect(() => {
    resizeGrid();
    window.addEventListener("resize", resizeGrid);
    return () => window.removeEventListener("resize", resizeGrid);
  }, [resizeGrid]);

  useEffect(() => {
    drawGrid();
  }, [camera]);

  const drawGrid = useCallback(() => {
    const canvas = gridRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, width, height);

    // Grid spacing scales with zoom, clamp to reasonable pixel size
    const base = 24; // world units
    const step = base * camera.scale;
    const bigEvery = 5;

    const origin = worldToScreen({ x: 0, y: 0 }, camera);

    ctx.beginPath();
    for (let x = origin.x % step; x < width; x += step) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let y = origin.y % step; y < height; y += step) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.strokeStyle = "#1f2937"; // neutral-800-ish
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bold lines
    ctx.beginPath();
    for (
      let i = Math.floor((origin.x % (step * bigEvery)) / step);
      i * step < width + step * bigEvery;
      i++
    ) {
      const x = (origin.x % (step * bigEvery)) + i * step;
      if (Math.round(((x - origin.x) / step) % bigEvery) === 0) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
      }
    }
    for (
      let j = Math.floor((origin.y % (step * bigEvery)) / step);
      j * step < height + step * bigEvery;
      j++
    ) {
      const y = (origin.y % (step * bigEvery)) + j * step;
      if (Math.round(((y - origin.y) / step) % bigEvery) === 0) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
      }
    }
    ctx.strokeStyle = "#111827"; // neutral-900-ish
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [camera]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom to cursor
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        const rect = (
          e.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        const cursor: Vec2 = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        const worldBefore = screenToWorld(cursor, camera);
        const nextScale = Math.min(2.5, Math.max(0.25, camera.scale * factor));
        const worldAfter = worldBefore;
        const screenAfter = {
          x: worldAfter.x * nextScale,
          y: worldAfter.y * nextScale,
        };
        setCamera(() => ({
          scale: nextScale,
          tx: cursor.x - screenAfter.x,
          ty: cursor.y - screenAfter.y,
        }));
      } else {
        setCamera((c) => ({ ...c, tx: c.tx - e.deltaX, ty: c.ty - e.deltaY }));
      }
    },
    [camera]
  );

  const onBackgroundDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const pt: Vec2 = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (e.button === 2) {
        // Right click -> open context menu to add node
        setMenu({ open: true, screen: pt, world: screenToWorld(pt, camera) });
        return;
      }
      if (e.button === 0) {
        dragState.current = { kind: "pan", start: pt, camera0: { ...camera } };
      }
    },
    [camera]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const pt: Vec2 = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const ds = dragState.current;
      if (!ds) return;
      if (ds.kind === "pan") {
        const dx = pt.x - ds.start.x;
        const dy = pt.y - ds.start.y;
        setCamera(() => ({
          ...ds.camera0,
          tx: ds.camera0.tx + dx,
          ty: ds.camera0.ty + dy,
        }));
      } else if (ds.kind === "node") {
        const dx = (pt.x - ds.start.x) / camera.scale;
        const dy = (pt.y - ds.start.y) / camera.scale;
        setNodes((prev) =>
          prev.map((n) =>
            n.id === ds.nodeId
              ? { ...n, pos: { x: ds.node0.x + dx, y: ds.node0.y + dy } }
              : n
          )
        );
      } else if (ds.kind === "wire") {
        ds.cur = screenToWorld(pt, camera);
        // Force re-render by updating state (no-op update via setEdges)
        setEdges((eds) => [...eds]);
      }
    },
    [camera.scale, camera.tx, camera.ty]
  );

  const onMouseUp = useCallback(() => {
    dragState.current = null;
  }, []);

  // Prevent default context menu
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onCtx = (e: MouseEvent) => {
      e.preventDefault();
    };
    el.addEventListener("contextmenu", onCtx);
    return () => el.removeEventListener("contextmenu", onCtx);
  }, []);

  // --- Node interactions -------------------------------------------------
  const startNodeDrag = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLDivElement).closest(
        "[data-world]"
      ) as HTMLDivElement;
      const containerRect = containerRef.current!.getBoundingClientRect();
      const pt: Vec2 = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      };

      const node = nodes.find((n) => n.id === nodeId)!;
      dragState.current = {
        kind: "node",
        nodeId,
        start: pt,
        node0: { ...node.pos },
      };
    },
    [nodes]
  );

  const portScreenPos = useCallback(
    (nodeId: string, portId: string): Vec2 => {
      const node = nodes.find((n) => n.id === nodeId)!;
      // Port layout: inputs on left, outputs on right; 28px row height
      const idxIn = node.inputs.findIndex((p) => p.id === portId);
      const idxOut = node.outputs.findIndex((p) => p.id === portId);
      const nodeSize = {
        w: 200,
        h: Math.max(
          80,
          32 + 28 * Math.max(node.inputs.length, node.outputs.length)
        ),
      };
      let anchor: Vec2;
      if (idxIn >= 0) {
        anchor = { x: node.pos.x, y: node.pos.y + 32 + 14 + idxIn * 28 };
      } else if (idxOut >= 0) {
        anchor = {
          x: node.pos.x + nodeSize.w,
          y: node.pos.y + 32 + 14 + idxOut * 28,
        };
      } else {
        anchor = {
          x: node.pos.x + nodeSize.w / 2,
          y: node.pos.y + nodeSize.h / 2,
        };
      }
      return worldToScreen(anchor, camera);
    },
    [nodes, camera]
  );

  const startWireFrom = useCallback(
    (e: React.MouseEvent, from: { node: string; port: string }) => {
      e.stopPropagation();
      const rect = containerRef.current!.getBoundingClientRect();
      const pt: Vec2 = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      dragState.current = {
        kind: "wire",
        from,
        cur: screenToWorld(pt, camera),
      };
    },
    [camera]
  );

  const tryCompleteWire = useCallback((to: { node: string; port: string }) => {
    const ds = dragState.current;
    if (!ds || ds.kind !== "wire") return;
    if (ds.from.node === to.node && ds.from.port === to.port) return;
    const id = uid("edge");
    setEdges((prev) => [...prev, { id, from: ds.from, to }]);
    dragState.current = null;
  }, []);

  // --- Add Node via context menu ----------------------------------------
  const addNode = useCallback(
    (kind: "Number" | "Add" | "Multiply" | "Output") => {
      if (!menu) return;
      const id = uid("node");
      const common = { id, pos: menu.world, title: kind } as const;
      const node: Node =
        kind === "Number"
          ? {
              ...common,
              inputs: [],
              outputs: [{ id: uid("p"), name: "value", kind: "out" }],
            }
          : kind === "Output"
          ? {
              ...common,
              inputs: [{ id: uid("p"), name: "in", kind: "in" }],
              outputs: [],
            }
          : {
              ...common,
              inputs: [
                { id: uid("p"), name: "a", kind: "in" },
                { id: uid("p"), name: "b", kind: "in" },
              ],
              outputs: [
                {
                  id: uid("p"),
                  name: kind === "Add" ? "sum" : "prod",
                  kind: "out",
                },
              ],
            };
      setNodes((prev) => [...prev, node]);
      setMenu(null);
    },
    [menu]
  );

  // --- Render ------------------------------------------------------------
  const transformStyle = useMemo(
    () => ({
      transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
      transformOrigin: "0 0",
    }),
    [camera]
  );

  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 h-full relative overflow-hidden">
        <Canvas ref={gridRef} />
      </div>
    </div>
  );
}

export default App;
