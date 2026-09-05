import type { ReactNode } from "react";
import NodeImpl, { type NodeOutputs } from "../NodeImpl";

export default class BCELossNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "bce loss", [], [{ name: "criterion" }], "small");
  }

  async process(): Promise<NodeOutputs> {
    return {
      criterion: { kind: "loss-spec", name: "binaryCrossentropy" },
    };
  }

  render(): ReactNode {
    return null;
  }
}
