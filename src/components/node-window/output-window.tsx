import { Tensor } from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import CSV from "../../lib/data/csv";
import { isLinearRegressionModel } from "../../lib/node-impl/tensor-utils";
import { useNodeDataState } from "../../store/nodeDataStore";
import CSVViewer from "../window/csv-viewer";

export default function OutputWindow({ nodeId }: { nodeId: string }) {
  const data = useNodeDataState((state) => state.data[nodeId]?.data);
  const [csvData, setCsvData] = useState<CSV | null>(null);
  const isTabular = data instanceof CSV || data instanceof Tensor;

  useEffect(() => {
    let active = true;
    if (data instanceof CSV) {
      setCsvData(data);
    } else if (data instanceof Tensor) {
      void CSV.fromTensor(data).then((csv) => {
        if (active) setCsvData(csv);
      });
    } else {
      setCsvData(null);
    }
    return () => {
      active = false;
    };
  }, [data]);

  if (data === null || data === undefined) {
    return (
      <div className="output-empty">
        <strong>아직 결과가 없습니다</strong>
        <span>입력 포트를 연결한 뒤 그래프를 실행하세요.</span>
      </div>
    );
  }

  if (isLinearRegressionModel(data)) {
    return (
      <div className="model-summary">
        <span>선형 회귀 모델</span>
        <dl>
          <div><dt>특성 수</dt><dd>{data.featureCount}</dd></div>
          <div><dt>가중치</dt><dd>{data.weights.map((value) => value.toFixed(4)).join(", ")}</dd></div>
          <div><dt>편향</dt><dd>{data.bias.toFixed(4)}</dd></div>
          <div><dt>마지막 손실</dt><dd>{data.lossHistory.at(-1)?.toFixed(4) ?? "-"}</dd></div>
        </dl>
      </div>
    );
  }

  return (
    <div className="output-content">
      {isTabular && csvData && (
        <CSVViewer csv={csvData} maxRows={10} maxColumns={20} />
      )}
      {(["number", "string", "boolean"] as const).includes(
        typeof data as "number" | "string" | "boolean"
      ) && <div className="output-value">{String(data)}</div>}
    </div>
  );
}
