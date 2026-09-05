import { useMemo, useState } from "react";
import {
  TbBook2,
  TbBulb,
  TbCheck,
  TbChevronDown,
  TbClock,
  TbX,
} from "react-icons/tb";
import { lessons } from "../../lib/lessons";
import type { GraphTemplate } from "../../lib/graph-templates";
import { useExecutionStore } from "../../store/executionStore";
import { useNodeState } from "../../store/graphics";
import { useNodeDataState } from "../../store/nodeDataStore";

export default function LessonPanel({
  onClose,
  onLoadTemplate,
}: {
  onClose: () => void;
  onLoadTemplate: (id: GraphTemplate["id"]) => void;
}) {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const nodes = useNodeState((state) => state.nodes);
  const nodeData = useNodeDataState((state) => state.data);
  const executionStatus = useExecutionStore((state) => state.status);
  const activeLesson =
    lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0];

  const checks = useMemo(
    () =>
      activeLesson.checks.map((check) => {
        const hasTypes =
          !check.nodeTypes ||
          check.nodeTypes.every((type) => nodes.some((node) => node.type === type));
        const hasMse =
          !check.needsMse ||
          nodes.some(
            (node) =>
              node.type === "mean squared error" &&
              typeof nodeData[node.id]?.mse === "number"
          );
        const hasAccuracy =
          !check.needsAccuracy ||
          nodes.some(
            (node) =>
              node.type === "accuracy" &&
              typeof nodeData[node.id]?.accuracy === "number"
          );
        const hasRun = !check.needsSuccess || executionStatus === "success";
        return { ...check, complete: hasTypes && hasMse && hasAccuracy && hasRun };
      }),
    [activeLesson, executionStatus, nodeData, nodes]
  );
  const completed = checks.filter((check) => check.complete).length;
  const progress = completed / checks.length;

  return (
    <aside className="lesson-panel" aria-label="학습 가이드">
      <div className="lesson-panel__header">
        <div>
          <TbBook2 aria-hidden="true" />
          <span>학습 가이드</span>
        </div>
        <button type="button" onClick={onClose} aria-label="학습 가이드 닫기">
          <TbX />
        </button>
      </div>

      <div className="lesson-picker">
        <button
          type="button"
          className="lesson-picker__trigger"
          onClick={() => setPickerOpen((open) => !open)}
          aria-expanded={pickerOpen}
        >
          <span>
            <small>{activeLesson.level}</small>
            <strong>{activeLesson.title}</strong>
          </span>
          <TbChevronDown aria-hidden="true" />
        </button>
        {pickerOpen && (
          <div className="lesson-picker__menu">
            {lessons.map((lesson) => (
              <button
                type="button"
                key={lesson.id}
                onClick={() => {
                  setActiveLessonId(lesson.id);
                  setPickerOpen(false);
                }}
              >
                <span>{lesson.title}</span>
                <small>{lesson.duration}</small>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lesson-panel__body">
        <div className="lesson-meta">
          <span><TbClock /> {activeLesson.duration}</span>
          <span>{completed}/{checks.length} 완료</span>
        </div>
        <div className="lesson-progress" aria-label={`수업 진행률 ${Math.round(progress * 100)}%`}>
          <span style={{ width: `${progress * 100}%` }} />
        </div>

        <section className="lesson-concept">
          <h3>오늘 이해할 것</h3>
          <p>{activeLesson.concept}</p>
        </section>

        <section className="lesson-checks">
          <h3>직접 해보기</h3>
          <ol>
            {checks.map((check) => (
              <li key={check.id} className={check.complete ? "is-complete" : ""}>
                <span>{check.complete ? <TbCheck /> : null}</span>
                <p>{check.label}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="lesson-hint">
          <TbBulb aria-hidden="true" />
          <p>{activeLesson.hint}</p>
        </div>
      </div>

      <div className="lesson-panel__footer">
        <button
          type="button"
          onClick={() => onLoadTemplate(activeLesson.templateId)}
        >
          시작 예제 다시 열기
        </button>
        <span>현재 그래프가 예제로 바뀝니다.</span>
      </div>
    </aside>
  );
}
