import type { ReactNode } from "react";
import type { NodeType } from "../../node";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { toTensor } from "../tensor-utils";

type RegressionMetric = "mae" | "rmse" | "r2";

export default class RegressionMetricNode extends NodeImpl {
  private metric: RegressionMetric;

  constructor(nodeId: string, nodeType: NodeType, metric: RegressionMetric) {
    super(
      nodeId,
      nodeType,
      [{ name: "predictions" }, { name: "targets" }],
      [{ name: metric }]
    );
    this.metric = metric;
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const predictionTensor = toTensor(inputs.predictions, "predictions");
    const targetTensor = toTensor(inputs.targets, "targets");
    const [predictions, targets] = await Promise.all([
      predictionTensor.data(),
      targetTensor.data(),
    ]);
    if (predictions.length !== targets.length || predictions.length === 0) {
      throw new Error("predictions와 targets의 값 개수가 같아야 합니다.");
    }

    const errors = Array.from(predictions, (prediction, index) => prediction - targets[index]);
    if (this.metric === "mae") {
      return { mae: errors.reduce((sum, error) => sum + Math.abs(error), 0) / errors.length };
    }
    if (this.metric === "rmse") {
      const mse = errors.reduce((sum, error) => sum + error ** 2, 0) / errors.length;
      return { rmse: Math.sqrt(mse) };
    }

    const targetMean = Array.from(targets).reduce((sum, value) => sum + value, 0) / targets.length;
    const residual = errors.reduce((sum, error) => sum + error ** 2, 0);
    const total = Array.from(targets).reduce(
      (sum, value) => sum + (value - targetMean) ** 2,
      0
    );
    return { r2: total === 0 ? (residual === 0 ? 1 : 0) : 1 - residual / total };
  }

  render(): ReactNode {
    return null;
  }
}
