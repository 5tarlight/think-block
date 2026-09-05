import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { appendLayer } from "./module-spec";

export default class SoftmaxNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "softmax", [{ name: "module" }], [{ name: "module" }], "small");
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    return { module: appendLayer(inputs.module, { kind: "softmax" }) };
  }

  render(): ReactNode {
    return null;
  }
}
