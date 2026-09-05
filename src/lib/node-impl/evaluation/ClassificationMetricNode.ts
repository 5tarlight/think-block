import type { ReactNode } from "react";
import type { NodeType } from "../../node";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { classificationReport, type ClassificationReport } from "./classification";

type ClassificationMetric = "accuracy" | "precision" | "recall" | "f1";

export default class ClassificationMetricNode extends NodeImpl {
  private metric: ClassificationMetric;

  constructor(
    nodeId: string,
    nodeType: NodeType,
    metric: ClassificationMetric
  ) {
    super(
      nodeId,
      nodeType,
      [{ name: "predictions" }, { name: "targets" }],
      [{ name: metric }]
    );
    this.metric = metric;
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const report: ClassificationReport = await classificationReport(
      inputs.predictions,
      inputs.targets
    );
    return { [this.metric]: report[this.metric] };
  }

  render(): ReactNode {
    return null;
  }
}
