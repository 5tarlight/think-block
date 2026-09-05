import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { isModuleChain } from "./module-spec";

export default class SequentialNode extends NodeImpl {
  constructor(nodeId: string) {
    super(nodeId, "sequential", [{ name: "modules" }], [{ name: "model" }]);
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    if (!isModuleChain(inputs.modules) || inputs.modules.layers.length === 0) {
      throw new Error("modules 입력에 하나 이상의 nn.Module을 연결하세요.");
    }
    if (!inputs.modules.layers.some((layer) => layer.kind === "linear")) {
      throw new Error("Sequential에는 Linear 레이어가 하나 이상 필요합니다.");
    }
    return {
      model: { kind: "sequential-spec", layers: inputs.modules.layers },
    };
  }

  render(): ReactNode {
    return null;
  }
}
