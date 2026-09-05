import { Tensor } from "@tensorflow/tfjs";
import { useEffect, useState } from "react";
import CSV from "../../lib/data/csv";
import { isConfusionMatrixData } from "../../lib/node-impl/evaluation/classification";
import { isTrainedSequentialModel } from "../../lib/node-impl/model/module-spec";
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

  if (isTrainedSequentialModel(data)) {
    return (
      <div className="model-summary">
        <span>nn.Sequential</span>
        <dl>
          <div><dt>Modules</dt><dd>{data.layers.map((layer) => layer.kind).join(" → ")}</dd></div>
          <div><dt>Linear layers</dt><dd>{data.denseWeights.length}</dd></div>
          <div><dt>Epochs</dt><dd>{data.lossHistory.length}</dd></div>
          <div><dt>Final loss</dt><dd>{data.lossHistory.at(-1)?.toFixed(6) ?? "-"}</dd></div>
        </dl>
      </div>
    );
  }

  if (isConfusionMatrixData(data)) {
    return (
      <div className="confusion-matrix">
        <div className="confusion-matrix__summary">
          <strong>Confusion matrix</strong>
          <span>{data.correct}/{data.total} correct</span>
        </div>
        <div className="confusion-matrix__axis">Predicted class</div>
        <table>
          <thead>
            <tr>
              <th>Actual</th>
              {data.labels.map((label) => <th key={label}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map((row, rowIndex) => (
              <tr key={data.labels[rowIndex]}>
                <th>{data.labels[rowIndex]}</th>
                {row.map((count, columnIndex) => (
                  <td
                    key={`${rowIndex}-${columnIndex}`}
                    className={rowIndex === columnIndex ? "is-correct" : ""}
                  >
                    {count}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
