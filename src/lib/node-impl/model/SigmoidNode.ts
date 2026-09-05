import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { appendLayer } from "./module-spec";

export default class SigmoidNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "sigmoid", [{ name: "module" }], [{ name: "module" }], "small");
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    return { module: appendLayer(inputs.module, { kind: "sigmoid" }) };
  }

  render(): ReactNode {
    return null;
  }
}
