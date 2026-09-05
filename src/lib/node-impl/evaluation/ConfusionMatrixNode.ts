import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { classificationReport } from "./classification";

export default class ConfusionMatrixNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "confusion matrix",
      [{ name: "predictions" }, { name: "targets" }],
      [{ name: "matrix" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const report = await classificationReport(inputs.predictions, inputs.targets);
    return { matrix: report.confusionMatrix };
  }

  render(): ReactNode {
    return null;
  }
}
