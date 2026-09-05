import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber } from "../tensor-utils";

export default class AdamNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "adam", [{ name: "lr" }], [{ name: "optimizer" }], "small");
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    return {
      optimizer: {
        kind: "optimizer-spec",
        name: "adam",
        learningRate: Math.min(1, finiteNumber(inputs.lr, 0.03, 0.000001)),
      },
    };
  }

  render(): ReactNode {
    return null;
  }
}
