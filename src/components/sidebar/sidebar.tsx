import { useState } from "react";
import { TbBlocks, TbFiles, TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import type { NodeType } from "../../lib/node";
import { useSidebarStore } from "../../store/sidebarStore";
import HorizontalIcon from "../icon/HoriontalIcon";
import FileUploader from "./file-uploader";
import GPUSelector from "./gpu-selector";
import NodeLibrary from "./node-library";

export default function Sidebar({
  onAddNode,
}: {
  onAddNode: (type: NodeType) => void;
}) {
  const { isOpen, toggle, close } = useSidebarStore();
  const [tab, setTab] = useState<"blocks" | "files">("blocks");

  if (!isOpen) {
    return (
      <aside className="sidebar sidebar--collapsed">
        <div className="brand-mark" aria-label="Think Block">T</div>
        <button type="button" onClick={toggle} aria-label="도구 패널 열기">
          <HorizontalIcon left={false} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand-mark" aria-hidden="true">T</div>
        <div>
          <strong>Think Block</strong>
          <span>AI 실험 작업대</span>
        </div>
        <button type="button" onClick={close} aria-label="도구 패널 닫기">
          <TbLayoutSidebarLeftCollapse />
        </button>
      </div>

      <div className="sidebar-tabs" role="tablist" aria-label="도구 선택">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "blocks"}
          className={tab === "blocks" ? "is-active" : ""}
          onClick={() => setTab("blocks")}
        >
          <TbBlocks /> 블록
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "files"}
          className={tab === "files" ? "is-active" : ""}
          onClick={() => setTab("files")}
        >
          <TbFiles /> 파일
        </button>
      </div>

      <div className="sidebar__content">
        {tab === "blocks" ? <NodeLibrary onAddNode={onAddNode} /> : <FileUploader />}
      </div>

      <div className="sidebar__footer">
        <GPUSelector />
        <p>블록을 클릭하면 화면 가운데에 추가됩니다.</p>
      </div>
    </aside>
  );
}
