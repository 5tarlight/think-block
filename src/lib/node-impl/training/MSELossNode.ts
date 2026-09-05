import type { ReactNode } from "react";
import NodeImpl, { type NodeOutputs } from "../NodeImpl";

export default class MSELossNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "mse loss", [], [{ name: "criterion" }], "small");
  }

  async process(): Promise<NodeOutputs> {
    return {
      criterion: { kind: "loss-spec", name: "meanSquaredError" },
    };
  }

  render(): ReactNode {
    return null;
  }
}
