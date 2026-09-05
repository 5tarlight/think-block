import type { ReactNode } from "react";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber } from "../tensor-utils";
import { appendLayer, lastLinearOutput } from "./module-spec";

export default class LinearNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "linear",
      [
        { name: "module" },
        { name: "in_features" },
        { name: "out_features" },
      ],
      [{ name: "module" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const inferredInput = lastLinearOutput(inputs.module);
    const inFeatures = Math.round(
      finiteNumber(inputs.in_features, inferredInput ?? 1, 1)
    );
    const outFeatures = Math.round(
      finiteNumber(inputs.out_features, 1, 1)
    );
    if (inferredInput !== undefined && inFeatures !== inferredInput) {
      throw new Error(
        `in_features는 앞 레이어의 출력 크기 ${inferredInput}와 같아야 합니다.`
      );
    }
    return {
      module: appendLayer(inputs.module, {
        kind: "linear",
        inFeatures,
        outFeatures,
        bias: true,
      }),
    };
  }

  render(): ReactNode {
    return null;
  }
}
