import "@tensorflow/tfjs-backend-webgpu";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import cn from "@yeahx4/cn";
import { TbInfoCircle, TbMouse, TbZoomIn } from "react-icons/tb";
import Canvas from "./components/canvas/canvas";
import ContextMenu, {
  type ContextMenuState,
} from "./components/canvas/context-menu";
import NodeView from "./components/canvas/node-view";
import Vertex from "./components/canvas/vertex";
import LessonPanel from "./components/lesson/lesson-panel";
import Sidebar from "./components/sidebar/sidebar";
import CanvasEmptyState from "./components/workspace/canvas-empty-state";
import WorkspaceToolbar from "./components/workspace/workspace-toolbar";
import WindowContainer from "./components/window/window-container";
import { createsCycle } from "./lib/execution/execution";
import {
  getGraphTemplate,
  type GraphTemplate,
} from "./lib/graph-templates";
import { getNodeDefinition, getNodeImpl, type NodeType } from "./lib/node";
import {
  restoreProject,
  serializeProject,
  type SerializedProject,
} from "./lib/project-file";
import { useExecutionStore } from "./store/executionStore";
import {
  cubicPath,
  getNodeSize,
  getPortAnchor,
  screenToWorld,
  uid,
  useCameraState,
  useEdgeState,
  useNodeState,
  worldToScreen,
  type Camera,
  type Edge,
  type Node,
  type Vec2,
} from "./store/graphics";
import { useNodeDataState } from "./store/nodeDataStore";

const AUTO_SAVE_KEY = "think-block:project:v1";

type DragState =
  | { kind: "pan"; start: Vec2; camera: Camera }
  | { kind: "nodes"; start: Vec2; positions: Record<string, Vec2> }
  | { kind: "wire"; from: { node: string; port: string }; current: Vec2 };

function createGraphNode(type: NodeType, pos: Vec2, id = uid("node")): Node {
  const impl = getNodeImpl(id, type);
  return {
    id,
    pos,
    title: getNodeDefinition(type).label,
    type,
    inputs: impl?.inputs ?? [],
    outputs: impl?.outputs ?? [],
    size: impl?.size ?? "full",
    impl,
  };
}

function materializeTemplate(template: GraphTemplate): {
  nodes: Node[];
  edges: Edge[];
  settings: Record<string, Record<string, unknown>>;
} {
  const keyedNodes = new Map<string, Node>();
  const settings: Record<string, Record<string, unknown>> = {};
  const nodes = template.nodes.map((templateNode) => {
    const node = createGraphNode(templateNode.type, templateNode.pos);
    keyedNodes.set(templateNode.key, node);
    if (templateNode.value !== undefined) {
      settings[node.id] = { value: templateNode.value };
    }
    return node;
  });

  const edges = template.edges.map((templateEdge) => {
    const fromNode = keyedNodes.get(templateEdge.from.node);
    const toNode = keyedNodes.get(templateEdge.to.node);
    const fromPort = fromNode?.outputs.find(
      (port) => port.name === templateEdge.from.port
    );
    const toPort = toNode?.inputs.find(
      (port) => port.name === templateEdge.to.port
    );
    if (!fromNode || !toNode || !fromPort || !toPort) {
      throw new Error("예제의 블록 연결 정보를 읽지 못했습니다.");
    }
    return {
      id: uid("edge"),
      from: { node: fromNode.id, port: fromPort.id },
      to: { node: toNode.id, port: toPort.id },
    };
  });

  return { nodes, edges, settings };
}

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

function App() {
  const gridRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragState | null>(null);
  const spacePressed = useRef(false);

  const { camera, setCamera } = useCameraState();
  const {
    nodes,
    setNodes,
    selectedNodes,
    setSelectedNodes,
    clearSelectedNodes,
    errorNode,
  } = useNodeState();
  const { edges, setEdges, removeEdge, removeEdgesConnectedToNode } =
    useEdgeState();
  const { data: nodeData, replaceData, removeNodeData, clearData } =
    useNodeDataState();
  const resetExecution = useExecutionStore((state) => state.reset);

  const [projectName, setProjectName] = useState("나의 첫 AI 실험");
  const [lessonOpen, setLessonOpen] = useState(() => window.innerWidth >= 1600);
  const [hydrated, setHydrated] = useState(false);
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [selectionBox, setSelectionBox] = useState<{
    start: Vec2;
    end: Vec2;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const drawGrid = useCallback(() => {
    const canvas = gridRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#0d1821";
    context.fillRect(0, 0, rect.width, rect.height);

    const minorStep = 24 * camera.scale;
    const majorStep = minorStep * 5;
    const origin = worldToScreen({ x: 0, y: 0 }, camera);

    const drawLines = (step: number, color: string) => {
      if (step < 6) return;
      context.beginPath();
      for (let x = ((origin.x % step) + step) % step; x < rect.width; x += step) {
        context.moveTo(Math.round(x) + 0.5, 0);
        context.lineTo(Math.round(x) + 0.5, rect.height);
      }
      for (let y = ((origin.y % step) + step) % step; y < rect.height; y += step) {
        context.moveTo(0, Math.round(y) + 0.5);
        context.lineTo(rect.width, Math.round(y) + 0.5);
      }
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
    };

    drawLines(minorStep, "rgba(92, 145, 164, 0.09)");
    drawLines(majorStep, "rgba(92, 145, 164, 0.16)");
  }, [camera]);

  const resizeGrid = useCallback(() => {
    const canvas = gridRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    drawGrid();
  }, [drawGrid]);

  useEffect(() => {
    resizeGrid();
    const observer = new ResizeObserver(resizeGrid);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeGrid]);

  useEffect(() => drawGrid(), [drawGrid]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const fitNodes = useCallback(
    (items: Node[]) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || items.length === 0) {
        setCamera(() => ({ scale: 1, tx: 48, ty: 72 }));
        return;
      }
      const minX = Math.min(...items.map((node) => node.pos.x));
      const minY = Math.min(...items.map((node) => node.pos.y));
      const maxX = Math.max(
        ...items.map((node) => node.pos.x + getNodeSize(node).w)
      );
      const maxY = Math.max(
        ...items.map((node) => node.pos.y + getNodeSize(node).h)
      );
      const width = Math.max(1, maxX - minX);
      const height = Math.max(1, maxY - minY);
      const scale = Math.max(
        0.62,
        Math.min(1, (rect.width - 100) / width, (rect.height - 120) / height)
      );
      setCamera(() => ({
        scale,
        tx: (rect.width - width * scale) / 2 - minX * scale,
        ty: (rect.height - height * scale) / 2 - minY * scale,
      }));
    },
    [setCamera]
  );

  const applyProject = useCallback(
    (
      name: string,
      nextNodes: Node[],
      nextEdges: Edge[],
      settings: Record<string, Record<string, unknown>>
    ) => {
      setProjectName(name);
      setNodes(() => nextNodes);
      setEdges(() => nextEdges);
      replaceData(settings);
      clearSelectedNodes();
      resetExecution();
      requestAnimationFrame(() => fitNodes(nextNodes));
    },
    [clearSelectedNodes, fitNodes, replaceData, resetExecution, setEdges, setNodes]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTO_SAVE_KEY);
      if (raw) {
        const restored = restoreProject(JSON.parse(raw) as SerializedProject);
        applyProject(
          restored.name,
          restored.nodes,
          restored.edges,
          restored.settings
        );
      }
    } catch {
      localStorage.removeItem(AUTO_SAVE_KEY);
      setNotice("자동 저장 내용을 읽지 못해 새 프로젝트로 시작합니다.");
    } finally {
      setHydrated(true);
    }
  }, [applyProject]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(
          AUTO_SAVE_KEY,
          JSON.stringify(serializeProject(projectName, nodes, edges, nodeData))
        );
      } catch {
        setNotice("브라우저 자동 저장 공간을 사용할 수 없습니다.");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [edges, hydrated, nodeData, nodes, projectName]);

  const loadTemplate = useCallback(
    (id: GraphTemplate["id"]) => {
      if (
        nodes.length > 0 &&
        !window.confirm("현재 그래프를 예제로 바꿀까요? 기존 내용은 자동 저장에서 교체됩니다.")
      ) {
        return;
      }
      const template = getGraphTemplate(id);
      const graph = materializeTemplate(template);
      applyProject(template.title, graph.nodes, graph.edges, graph.settings);
      setNotice(`‘${template.title}’ 예제를 열었습니다. 그래프 실행을 눌러 보세요.`);
    },
    [applyProject, nodes.length]
  );

  const newProject = useCallback(() => {
    if (
      nodes.length > 0 &&
      !window.confirm("빈 프로젝트를 만들까요? 현재 그래프는 내보내기 하지 않으면 교체됩니다.")
    ) {
      return;
    }
    clearData();
    applyProject("이름 없는 실험", [], [], {});
    setCamera(() => ({ scale: 1, tx: 48, ty: 72 }));
  }, [applyProject, clearData, nodes.length, setCamera]);

  const exportProject = useCallback(() => {
    const project = serializeProject(projectName, nodes, edges, nodeData);
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${projectName.trim().replace(/[^a-zA-Z0-9가-힣-_]+/g, "-") || "think-block"}.thinkblock.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("프로젝트 파일을 저장했습니다.");
  }, [edges, nodeData, nodes, projectName]);

  const importProject = useCallback(
    async (file: File) => {
      try {
        const restored = restoreProject(
          JSON.parse(await file.text()) as SerializedProject
        );
        applyProject(
          restored.name,
          restored.nodes,
          restored.edges,
          restored.settings
        );
        setNotice("프로젝트를 불러왔습니다.");
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "프로젝트 파일을 읽지 못했습니다."
        );
      }
    },
    [applyProject]
  );

  const addNodeAt = useCallback(
    (type: NodeType, pos: Vec2) => {
      const node = createGraphNode(type, pos);
      setNodes((current) => [...current, node]);
      setSelectedNodes(() => [node.id]);
      resetExecution();
      return node;
    },
    [resetExecution, setNodes, setSelectedNodes]
  );

  const addNodeFromLibrary = useCallback(
    (type: NodeType) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const center = screenToWorld(
        { x: rect.width / 2, y: rect.height / 2 },
        camera
      );
      const offset = (nodes.length % 5) * 18;
      addNodeAt(type, { x: center.x - 136 + offset, y: center.y - 60 + offset });
      setNotice(`${getNodeDefinition(type).label} 블록을 추가했습니다.`);
    },
    [addNodeAt, camera, nodes.length]
  );

  const addNodeFromMenu = useCallback(
    (type: NodeType) => {
      if (!menu) return;
      addNodeAt(type, menu.world);
      setMenu(null);
    },
    [addNodeAt, menu]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((current) => current.filter((node) => node.id !== nodeId));
      removeEdgesConnectedToNode(nodeId);
      removeNodeData(nodeId);
      resetExecution();
    },
    [removeEdgesConnectedToNode, removeNodeData, resetExecution, setNodes]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.code === "Space") {
        event.preventDefault();
        spacePressed.current = true;
      } else if (event.code === "Delete" || event.code === "Backspace") {
        if (selectedNodes.length > 0) {
          event.preventDefault();
          selectedNodes.forEach(deleteNode);
          clearSelectedNodes();
        }
      } else if (event.key === "Escape") {
        setMenu(null);
        setSelectionBox(null);
        clearSelectedNodes();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") spacePressed.current = false;
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [clearSelectedNodes, deleteNode, selectedNodes]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    element.addEventListener("contextmenu", preventContextMenu);
    return () => element.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        const rect = event.currentTarget.getBoundingClientRect();
        const cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        const world = screenToWorld(cursor, camera);
        const factor = event.deltaY < 0 ? 1.08 : 0.92;
        const scale = Math.min(2.2, Math.max(0.25, camera.scale * factor));
        setCamera(() => ({
          scale,
          tx: cursor.x - world.x * scale,
          ty: cursor.y - world.y * scale,
        }));
      } else {
        setCamera((current) => ({
          ...current,
          tx: current.tx - event.deltaX,
          ty: current.ty - event.deltaY,
        }));
      }
    },
    [camera, setCamera]
  );

  const onBackgroundDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (event.button === 2) {
        setMenu({ open: true, screen: point, world: screenToWorld(point, camera) });
        return;
      }
      if (event.button !== 0 && event.button !== 1) return;
      setMenu(null);
      if (event.button === 1 || spacePressed.current) {
        dragState.current = { kind: "pan", start: point, camera: { ...camera } };
      } else {
        clearSelectedNodes();
        setSelectionBox({ start: point, end: point });
      }
    },
    [camera, clearSelectedNodes]
  );

  const startNodeDrag = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.stopPropagation();
      event.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const draggedIds = selectedNodes.includes(nodeId) ? selectedNodes : [nodeId];
      if (!selectedNodes.includes(nodeId)) setSelectedNodes(() => [nodeId]);
      dragState.current = {
        kind: "nodes",
        start: point,
        positions: Object.fromEntries(
          nodes
            .filter((node) => draggedIds.includes(node.id))
            .map((node) => [node.id, { ...node.pos }])
        ),
      };
    },
    [nodes, selectedNodes, setSelectedNodes]
  );

  const startWireFrom = useCallback(
    (event: React.MouseEvent, from: { nodeId: string; portId: string }) => {
      event.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      dragState.current = {
        kind: "wire",
        from: { node: from.nodeId, port: from.portId },
        current: screenToWorld(point, camera),
      };
    },
    [camera]
  );

  const tryCompleteWire = useCallback(
    (to: { nodeId: string; portId: string }) => {
      const drag = dragState.current;
      if (!drag || drag.kind !== "wire") return;
      if (drag.from.node === to.nodeId) {
        setNotice("같은 블록 안에서는 포트를 연결할 수 없습니다.");
        dragState.current = null;
        return;
      }
      const nextEdge: Edge = {
        id: uid("edge"),
        from: drag.from,
        to: { node: to.nodeId, port: to.portId },
      };
      const nextEdges = [
        ...edges.filter(
          (edge) => !(edge.to.node === to.nodeId && edge.to.port === to.portId)
        ),
        nextEdge,
      ];
      if (createsCycle(nodes, nextEdges)) {
        setNotice("블록이 다시 앞 단계로 이어지는 순환 연결은 만들 수 없습니다.");
      } else {
        setEdges(() => nextEdges);
        resetExecution();
      }
      dragState.current = null;
    },
    [edges, nodes, resetExecution, setEdges]
  );

  const finishSelection = useCallback(() => {
    if (!selectionBox) return;
    const box = {
      x1: Math.min(selectionBox.start.x, selectionBox.end.x),
      y1: Math.min(selectionBox.start.y, selectionBox.end.y),
      x2: Math.max(selectionBox.start.x, selectionBox.end.x),
      y2: Math.max(selectionBox.start.y, selectionBox.end.y),
    };
    const selected = nodes
      .filter((node) => {
        const topLeft = worldToScreen(node.pos, camera);
        const size = getNodeSize(node);
        const right = topLeft.x + size.w * camera.scale;
        const bottom = topLeft.y + size.h * camera.scale;
        return !(box.x2 < topLeft.x || box.x1 > right || box.y2 < topLeft.y || box.y1 > bottom);
      })
      .map((node) => node.id);
    setSelectedNodes(() => selected);
    setSelectionBox(null);
  }, [camera, nodes, selectionBox, setSelectedNodes]);

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const drag = dragState.current;
      if (drag?.kind === "pan") {
        setCamera(() => ({
          ...drag.camera,
          tx: drag.camera.tx + point.x - drag.start.x,
          ty: drag.camera.ty + point.y - drag.start.y,
        }));
      } else if (drag?.kind === "nodes") {
        const dx = (point.x - drag.start.x) / camera.scale;
        const dy = (point.y - drag.start.y) / camera.scale;
        setNodes((current) =>
          current.map((node) => {
            const start = drag.positions[node.id];
            return start
              ? { ...node, pos: { x: start.x + dx, y: start.y + dy } }
              : node;
          })
        );
      } else if (drag?.kind === "wire") {
        drag.current = screenToWorld(point, camera);
        setEdges((current) => [...current]);
      } else if (selectionBox) {
        setSelectionBox((current) => current && { ...current, end: point });
      }
    },
    [camera, selectionBox, setCamera, setEdges, setNodes]
  );

  const onMouseUp = useCallback(() => {
    if (dragState.current?.kind === "wire") {
      dragState.current = null;
      setEdges((current) => [...current]);
    } else {
      dragState.current = null;
    }
    finishSelection();
  }, [finishSelection, setEdges]);

  const portScreenPos = useCallback(
    (nodeId: string, portId: string) => {
      const node = nodes.find((item) => item.id === nodeId);
      if (!node) return { x: 0, y: 0 };
      return worldToScreen(getPortAnchor(node, portId), camera);
    },
    [camera, nodes]
  );

  const transformStyle = useMemo(
    () => ({
      transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
      transformOrigin: "0 0",
    }),
    [camera]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.stopPropagation();
      if (event.shiftKey) {
        setSelectedNodes((current) =>
          current.includes(nodeId)
            ? current.filter((id) => id !== nodeId)
            : [...current, nodeId]
        );
      } else {
        setSelectedNodes(() => [nodeId]);
      }
    },
    [setSelectedNodes]
  );

  return (
    <div className="app-shell">
      <Sidebar onAddNode={addNodeFromLibrary} />
      <div className="workspace">
        <WorkspaceToolbar
          projectName={projectName}
          onProjectNameChange={setProjectName}
          onNew={newProject}
          onExport={exportProject}
          onImport={importProject}
          onLoadTemplate={loadTemplate}
          onResetView={() => fitNodes(nodes)}
          lessonOpen={lessonOpen}
          onToggleLesson={() => setLessonOpen((open) => !open)}
        />

        <div className="workspace__body">
          <main className="canvas-stage">
            <Canvas ref={gridRef} />
            <div
              ref={containerRef}
              onWheel={onWheel}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onMouseDown={onBackgroundDown}
              className={cn("canvas-surface", spacePressed.current ? "is-pannable" : "")}
            >
              {nodes.length === 0 && (
                <CanvasEmptyState onOpenExample={() => loadTemplate("regression")} />
              )}

              <svg className="edge-layer" aria-hidden="true">
                <g style={transformStyle as React.CSSProperties}>
                  {edges.map((edge) => (
                    <Vertex
                      edge={edge}
                      camera={camera}
                      portScreenPos={portScreenPos}
                      screenToWorld={screenToWorld}
                      onRemove={() => {
                        removeEdge(edge.id);
                        resetExecution();
                      }}
                      key={edge.id}
                    />
                  ))}
                  {dragState.current?.kind === "wire" && (
                    <path
                      d={cubicPath(
                        screenToWorld(
                          portScreenPos(
                            dragState.current.from.node,
                            dragState.current.from.port
                          ),
                          camera
                        ),
                        dragState.current.current
                      )}
                      fill="none"
                      stroke="#9adcf6"
                      strokeWidth={2}
                      strokeDasharray="6 6"
                    />
                  )}
                </g>
                {selectionBox && (
                  <rect
                    x={Math.min(selectionBox.start.x, selectionBox.end.x)}
                    y={Math.min(selectionBox.start.y, selectionBox.end.y)}
                    width={Math.abs(selectionBox.end.x - selectionBox.start.x)}
                    height={Math.abs(selectionBox.end.y - selectionBox.start.y)}
                    fill="rgba(79, 183, 232, 0.12)"
                    stroke="#4fb7e8"
                    strokeWidth={1}
                  />
                )}
              </svg>

              <div className="node-layer" style={transformStyle as React.CSSProperties}>
                {nodes.map((node) => (
                  <NodeView
                    key={node.id}
                    node={node}
                    onDragStart={startNodeDrag}
                    onPortDown={startWireFrom}
                    onPortUp={tryCompleteWire}
                    impl={node.impl}
                    selected={selectedNodes.includes(node.id)}
                    onClick={handleNodeClick}
                    hasError={errorNode === node.id}
                  />
                ))}
              </div>

              {menu?.open && (
                <ContextMenu menu={menu} addNode={addNodeFromMenu} setMenu={setMenu} />
              )}

              <div className="canvas-help" aria-label="캔버스 조작법">
                <span><TbMouse /> 드래그 선택</span>
                <span><TbZoomIn /> Ctrl/⌘ + 스크롤 확대</span>
                <span><kbd>Space</kbd> 이동</span>
              </div>
            </div>
          </main>

          {lessonOpen && (
            <LessonPanel
              onClose={() => setLessonOpen(false)}
              onLoadTemplate={loadTemplate}
            />
          )}
          <WindowContainer />
        </div>
      </div>

      {notice && (
        <div className="app-notice" role="status">
          <TbInfoCircle />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}

export default App;
