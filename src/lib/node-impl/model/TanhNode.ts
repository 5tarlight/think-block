import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { appendLayer } from "./module-spec";

export default class TanhNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "tanh", [{ name: "module" }], [{ name: "module" }], "small");
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    return { module: appendLayer(inputs.module, { kind: "tanh" }) };
  }

  render(): ReactNode {
    return null;
  }
}
