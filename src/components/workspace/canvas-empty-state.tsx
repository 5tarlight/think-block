import { TbArrowBackUp, TbTemplate } from "react-icons/tb";

export default function CanvasEmptyState({
  onOpenExample,
}: {
  onOpenExample: () => void;
}) {
  return (
    <div className="canvas-empty-state">
      <div className="empty-state__diagram" aria-hidden="true">
        <span />
        <i />
        <span />
        <i />
        <span />
      </div>
      <h2>첫 흐름을 만들어 볼까요?</h2>
      <p>왼쪽에서 블록을 추가하거나, 완성된 예제로 모델의 흐름부터 살펴보세요.</p>
      <button type="button" onClick={onOpenExample}>
        <TbTemplate /> 첫 선형 회귀 열기
      </button>
      <small><TbArrowBackUp /> 캔버스를 우클릭해도 블록을 빠르게 추가할 수 있어요.</small>
    </div>
  );
}
