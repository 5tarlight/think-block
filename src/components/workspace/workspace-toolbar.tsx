import { useRef, useState } from "react";
import {
  TbBook2,
  TbChevronDown,
  TbDeviceFloppy,
  TbFileImport,
  TbFocusCentered,
  TbPlus,
} from "react-icons/tb";
import { graphTemplates, type GraphTemplate } from "../../lib/graph-templates";
import { useExecutionStore } from "../../store/executionStore";
import ExecuteButton from "../sidebar/execute-button";

export default function WorkspaceToolbar({
  projectName,
  onProjectNameChange,
  onNew,
  onExport,
  onImport,
  onLoadTemplate,
  onResetView,
  lessonOpen,
  onToggleLesson,
}: {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onNew: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onLoadTemplate: (id: GraphTemplate["id"]) => void;
  onResetView: () => void;
  lessonOpen: boolean;
  onToggleLesson: () => void;
}) {
  const [examplesOpen, setExamplesOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const { status, message, durationMs } = useExecutionStore();

  return (
    <header className="workspace-toolbar">
      <div className="workspace-toolbar__project">
        <span className="project-dot" aria-hidden="true" />
        <input
          value={projectName}
          onChange={(event) => onProjectNameChange(event.target.value)}
          aria-label="프로젝트 이름"
        />
        <span className="save-state">자동 저장됨</span>
      </div>

      <div className={`execution-chip execution-chip--${status}`}>
        <span />
        <p>{message}</p>
        {durationMs !== null && status !== "running" && (
          <small>{durationMs < 1000 ? `${Math.round(durationMs)}ms` : `${(durationMs / 1000).toFixed(1)}s`}</small>
        )}
      </div>

      <nav className="workspace-toolbar__actions" aria-label="프로젝트 도구">
        <button type="button" onClick={onNew} title="새 프로젝트">
          <TbPlus /><span>새로 만들기</span>
        </button>
        <div className="toolbar-menu">
          <button
            type="button"
            onClick={() => setExamplesOpen((open) => !open)}
            aria-expanded={examplesOpen}
          >
            예제 <TbChevronDown />
          </button>
          {examplesOpen && (
            <div className="toolbar-menu__popover">
              {graphTemplates.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => {
                    onLoadTemplate(template.id);
                    setExamplesOpen(false);
                  }}
                >
                  <strong>{template.title}</strong>
                  <small>{template.description}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={onResetView} title="캔버스 원점으로 이동">
          <TbFocusCentered /><span>화면 맞춤</span>
        </button>
        <button type="button" onClick={onExport} title="프로젝트 파일 저장">
          <TbDeviceFloppy /><span>내보내기</span>
        </button>
        <button type="button" onClick={() => importRef.current?.click()} title="프로젝트 파일 열기">
          <TbFileImport /><span>불러오기</span>
        </button>
        <input
          ref={importRef}
          className="sr-only"
          type="file"
          accept="application/json,.json,.thinkblock"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          className={lessonOpen ? "lesson-toggle is-active" : "lesson-toggle"}
          onClick={onToggleLesson}
          aria-label={lessonOpen ? "학습 가이드 닫기" : "학습 가이드 열기"}
        >
          <TbBook2 /><span>학습 가이드</span>
        </button>
        <ExecuteButton compact />
      </nav>
    </header>
  );
}
