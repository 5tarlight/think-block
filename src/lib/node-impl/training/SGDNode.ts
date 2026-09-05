import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber } from "../tensor-utils";

export default class SGDNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "sgd", [{ name: "lr" }], [{ name: "optimizer" }], "small");
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    return {
      optimizer: {
        kind: "optimizer-spec",
        name: "sgd",
        learningRate: Math.min(1, finiteNumber(inputs.lr, 0.01, 0.000001)),
      },
    };
  }

  render(): ReactNode {
    return null;
  }
}
