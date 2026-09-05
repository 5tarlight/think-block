import type { ReactNode } from "react";
import NodeImpl, { type NodeOutputs } from "../NodeImpl";

export default class CrossEntropyLossNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "cross entropy loss", [], [{ name: "criterion" }], "small");
  }

  async process(): Promise<NodeOutputs> {
    return {
      criterion: { kind: "loss-spec", name: "categoricalCrossentropy" },
    };
  }

  render(): ReactNode {
    return null;
  }
}
