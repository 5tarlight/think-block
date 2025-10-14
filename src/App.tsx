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
import { getNodeImpl, type NodeType } from "./lib/node";
import type { ContextMenuState } from "./components/canvas/context-menu";
import ContextMenu from "./components/canvas/context-menu";
import WindowContainer from "./components/window/window-container";
import Vertex from "./components/canvas/vertex";

function App() {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { camera, setCamera } = useCameraState();
  const {
    nodes,
    setNodes,
    selectedNodes,
    setSelectedNodes,
    clearSelectedNodes,
  } = useNodeState();
  const { edges, setEdges, removeEdge } = useEdgeState();

  const spacePressed = useRef(false);
  const isDragging = useRef(false);
  const dragState = useRef<
    | { kind: "pan"; start: Vec2; camera0: Camera }
    | { kind: "node"; nodeId: string; start: Vec2; node0: Vec2 }
    | { kind: "wire"; from: { node: string; port: string }; cur: Vec2 }
    | null
  >(null);

  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    start: Vec2;
    end: Vec2;
  } | null>(null);

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
        const factor = e.deltaY < 0 ? 1.01 : 0.99;
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

      if (e.button == 1 || (e.button === 0 && spacePressed.current)) {
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

        // Clean wire drag state and force re-render
        dragState.current = null;
        setEdges((eds) => [...eds]);
      } else {
        // Screen drag
        dragState.current = null;
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

      if (selectedNodes.includes(nodeId)) {
        // Drag all selected nodes
      }

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
        h: -1,
      };

      if (node.size === "full") {
        nodeSize.h = Math.max(80, 56 + 28 * rows + 4 * (rows - 1));
      } else if (node.size === "small") {
        nodeSize.h = 16 + 28 * rows + 4 * (rows - 1);
        nodeSize.w = 164;
      } else if (node.size === "input") {
        nodeSize.h = 44;
        nodeSize.w = 124;
      }

      let anchor: Vec2;
      if (idxIn >= 0) {
        anchor = { x: node.pos.x + 10, y: node.pos.y + 48 + 32 * idxIn + 15 };
        if (node.size === "input" || node.size === "small") {
          anchor.y -= 40;
        }
      } else if (idxOut >= 0) {
        anchor = {
          x: node.pos.x + nodeSize.w - 10,
          y: node.pos.y + 48 + 32 * idxOut + 15,
        };
        if (node.size === "input" || node.size === "small") {
          anchor.y -= 40;
        }
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

      const nodeId = uid("node");
      const impl = getNodeImpl(nodeId, kind);

      const node: Node = {
        id: nodeId,
        pos: menu.world,
        title: kind,
        type: kind,
        inputs: impl ? impl.inputs : [],
        outputs: impl ? impl.outputs : [],
        size: impl ? impl.size : "full",
        impl,
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // --- Space key for panning ----------------------------------------
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spacePressed.current) {
        e.preventDefault();
        spacePressed.current = true;

        if (containerRef.current) {
          containerRef.current.style.cursor = "grab";
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        spacePressed.current = false;
        isDragging.current = false;

        if (containerRef.current) {
          containerRef.current.style.cursor = "default";
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && spacePressed.current) {
        isDragging.current = true;

        if (containerRef.current) {
          containerRef.current.style.cursor = "grabbing";
        }
      } else if (e.button === 0 && !spacePressed.current) {
        // Start selection box
        clearSelectedNodes();
        const rect = containerRef.current!.getBoundingClientRect();
        const pt: Vec2 = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setSelectionBox({ start: pt, end: pt });
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;

        if (containerRef.current) {
          // Return to grab if space is still pressed
          containerRef.current.style.cursor = spacePressed.current
            ? "grab"
            : "default";
        }
      } else if (selectionBox) {
        // Select nodes within selection box
        const box = {
          x1: Math.min(selectionBox.start.x, selectionBox.end.x),
          y1: Math.min(selectionBox.start.y, selectionBox.end.y),
          x2: Math.max(selectionBox.start.x, selectionBox.end.x),
          y2: Math.max(selectionBox.start.y, selectionBox.end.y),
        };

        const selectedNodes = nodes
          .filter((n) => {
            const nodeSize = {
              w: 256,
              h: -1,
            };
            const rows = Math.max(n.inputs.length, n.outputs.length);
            if (n.size === "full") {
              nodeSize.h = Math.max(80, 56 + 28 * rows + 4 * (rows - 1));
            } else if (n.size === "small") {
              nodeSize.h = 16 + 28 * rows + 4 * (rows - 1);
              nodeSize.w = 164;
            } else if (n.size === "input") {
              nodeSize.h = 44;
              nodeSize.w = 124;
            }

            const nodeScreenPos = worldToScreen(n.pos, camera);
            const nodeBox = {
              x1: nodeScreenPos.x,
              y1: nodeScreenPos.y,
              x2: nodeScreenPos.x + nodeSize.w,
              y2: nodeScreenPos.y + nodeSize.h,
            };

            // AABB intersection
            return !(
              box.x2 < nodeBox.x1 ||
              box.x1 > nodeBox.x2 ||
              box.y2 < nodeBox.y1 ||
              box.y1 > nodeBox.y2
            );
          })
          .map((n) => n.id);

        setSelectedNodes(() => selectedNodes);

        setSelectionBox(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Update selection box
      if (selectionBox) {
        const rect = containerRef.current!.getBoundingClientRect();
        const pt: Vec2 = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setSelectionBox({
          start: selectionBox.start,
          end: pt,
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [selectionBox]);

  const handleNodeClick = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation();
      if (e.shiftKey) {
        // Toggle selection
        setSelectedNodes((prev) =>
          prev.includes(nodeId)
            ? prev.filter((id) => id !== nodeId)
            : [...prev, nodeId]
        );
      } else {
        setSelectedNodes(() => [nodeId]);
      }
    },
    [setSelectedNodes]
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
          {/* SVG edges */}
          <svg
            className="absolute inset-0 pointer-events-none w-full h-full z-1"
            style={{ filter: "drop-shadow(0 0 1px rgba(0,0,0,0.6))" }}
          >
            <g style={transformStyle as React.CSSProperties}>
              {edges.map((e) => (
                <Vertex
                  edge={e}
                  camera={camera}
                  portScreenPos={portScreenPos}
                  screenToWorld={screenToWorld}
                  onRemove={() => removeEdge(e.id)}
                  key={e.id}
                />
              ))}
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
            {/* Selection box rect */}
            {selectionBox && (
              <rect
                x={Math.min(selectionBox.start.x, selectionBox.end.x)}
                y={Math.min(selectionBox.start.y, selectionBox.end.y)}
                width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
                height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
                fill="rgba(147, 197, 253, 0.3)"
                stroke="#93c5fd"
                strokeWidth={1}
              />
            )}
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
                impl={n.impl}
                selected={selectedNodes.includes(n.id)}
                onClick={handleNodeClick}
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
