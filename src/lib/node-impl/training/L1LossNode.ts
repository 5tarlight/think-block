import type { ReactNode } from "react";
import NodeImpl, { type NodeOutputs } from "../NodeImpl";

export default class L1LossNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "l1 loss", [], [{ name: "criterion" }], "small");
  }

  async process(): Promise<NodeOutputs> {
    return {
      criterion: { kind: "loss-spec", name: "absoluteDifference" },
    };
  }

  render(): ReactNode {
    return null;
  }
}
