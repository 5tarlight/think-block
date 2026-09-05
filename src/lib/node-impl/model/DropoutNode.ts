import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber } from "../tensor-utils";
import { appendLayer } from "./module-spec";

export default class DropoutNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "dropout",
      [{ name: "module" }, { name: "p" }],
      [{ name: "module" }],
      "small"
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const probability = Math.min(0.95, finiteNumber(inputs.p, 0.5, 0));
    return {
      module: appendLayer(inputs.module, { kind: "dropout", probability }),
    };
  }

  render(): ReactNode {
    return null;
  }
}
