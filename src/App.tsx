import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Canvas from "./components/canvas/canvas";
import Sidebar from "./components/sidebar/sidebar";
import {
  cubicPath,
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
import cn from "@yeahx4/cn";
import NodeView from "./components/canvas/node-view";
import { getNodeData, type NodeType } from "./lib/node";
import type { ContextMenuState } from "./components/canvas/context-menu";
import ContextMenu from "./components/canvas/context-menu";
import WindowContainer from "./components/window/window-container";

function App() {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { camera, setCamera } = useCameraState();
  const { nodes, setNodes } = useNodeState();
  const { edges, setEdges } = useEdgeState();

  const [menu, setMenu] = useState<ContextMenuState | null>(null);
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
    ctx.strokeStyle = "#151c2d";
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [camera]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      // e.preventDefault();
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

      if (menu?.open) {
        setMenu({ ...menu, open: false });
      }

      if (e.button === 0) {
        dragState.current = { kind: "pan", start: pt, camera0: { ...camera } };
      }
    },
    [camera, menu]
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
    const ds = dragState.current;
    if (ds) {
      if (ds.kind === "node") {
        const node = nodes.find((n) => n.id === ds.nodeId);
        console.log("Node drag ended:", {
          nodeId: ds.nodeId,
          nodeTitle: node?.title,
          finalPosition: node?.pos,
        });
        dragState.current = null;
      } else if (ds.kind === "wire" && ds.from) {
        console.log("Wire drag cancelled:", {
          fromNode: ds.from.node,
          fromPort: ds.from.port,
        });

        // Delete wire and force re-render
        dragState.current = null;
        setEdges((eds) => [...eds]);
      }
    }
  }, [nodes]);

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

      console.log("Node drag started:", {
        nodeId: nodeId,
        nodeTitle: node.title,
        position: node.pos,
        mousePosition: pt,
      });
    },
    [nodes]
  );

  const portScreenPos = useCallback(
    (nodeId: string, portId: string): Vec2 => {
      const node = nodes.find((n) => n.id === nodeId)!;
      // Port layout: inputs on left, outputs on right; 28px row height
      const idxIn = node.inputs.findIndex((p) => p.id === portId);
      const idxOut = node.outputs.findIndex((p) => p.id === portId);
      const rows = Math.max(node.inputs.length, node.outputs.length);
      const nodeSize = {
        w: 256,
        h: Math.max(80, 56 + 28 * rows + 4 * (rows - 1)),
      };

      let anchor: Vec2;
      if (idxIn >= 0) {
        anchor = { x: node.pos.x + 10, y: node.pos.y + 48 + 32 * idxIn + 15 };
      } else if (idxOut >= 0) {
        anchor = {
          x: node.pos.x + nodeSize.w - 10,
          y: node.pos.y + 48 + 32 * idxOut + 15,
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
    (e: React.MouseEvent, from: { nodeId: string; portId: string }) => {
      e.stopPropagation();
      const rect = containerRef.current!.getBoundingClientRect();
      const pt: Vec2 = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      dragState.current = {
        kind: "wire",
        from: { node: from.nodeId, port: from.portId },
        cur: screenToWorld(pt, camera),
      };
      console.log("Wire drag started:", {
        fromNode: from.nodeId,
        fromPort: from.portId,
        position: pt,
      });
    },
    [camera]
  );

  const tryCompleteWire = useCallback(
    (to: { nodeId: string; portId: string }) => {
      const ds = dragState.current;
      if (!ds || ds.kind !== "wire") return;
      if (ds.from.node === to.nodeId && ds.from.port === to.portId) return;
      const id = uid("edge");

      console.log("Wire connection completed:", {
        id: id,
        from: {
          node: ds.from.node,
          port: ds.from.port,
        },
        to: {
          node: to.nodeId,
          port: to.portId,
        },
      });

      setEdges((prev) => [
        ...prev,
        { id, from: ds.from, to: { node: to.nodeId, port: to.portId } },
      ]);
      dragState.current = null;
    },
    []
  );

  // --- Add Node via context menu ----------------------------------------
  const addNode = useCallback(
    (kind: NodeType) => {
      if (!menu) return;

      const node: Node = {
        id: uid("node"),
        pos: menu.world,
        title: kind,
        ...getNodeData(kind),
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
        <div
          ref={containerRef}
          onWheel={onWheel}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseDown={onBackgroundDown}
          className={cn(
            "relative w-full h-full select-none overflow-hidden",
            "rounded-2xl border border-neutral-800 shadow-inner"
          )}
        >
          {/* SVG edges (under nodes) */}
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full z-1"
            style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.6))" }}
          >
            <g style={transformStyle as React.CSSProperties}>
              {edges.map((e) => {
                const a = portScreenPos(e.from.node, e.from.port);
                const b = portScreenPos(e.to.node, e.to.port);
                // convert back to world (we rendered in screen above)
                const aw = screenToWorld(a, camera);
                const bw = screenToWorld(b, camera);
                return (
                  <path
                    key={e.id}
                    d={cubicPath(aw, bw)}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth={2}
                  />
                );
              })}
              {/* Ghost wire while dragging */}
              {dragState.current &&
                dragState.current.kind === "wire" &&
                (() => {
                  const ds = dragState.current;
                  const a = screenToWorld(
                    portScreenPos(ds.from.node, ds.from.port),
                    camera
                  );
                  const b = ds.cur;
                  return (
                    <path
                      d={cubicPath(a, b)}
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth={2}
                      strokeDasharray="6 6"
                    />
                  );
                })()}
            </g>
          </svg>

          {/* Nodes layer */}
          <div
            data-world
            className="absolute inset-0"
            style={transformStyle as React.CSSProperties}
          >
            {nodes.map((n) => (
              <NodeView
                key={n.id}
                node={n}
                onDragStart={startNodeDrag}
                onPortDown={startWireFrom}
                onPortUp={tryCompleteWire}
              />
            ))}
          </div>

          {/* Context menu */}
          {menu?.open && (
            <ContextMenu menu={menu} addNode={addNode} setMenu={setMenu} />
          )}
        </div>

        <WindowContainer />
      </div>
    </div>
  );
}

export default App;
