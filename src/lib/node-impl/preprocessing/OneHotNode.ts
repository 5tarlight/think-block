import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber, toTensor } from "../tensor-utils";

export default class OneHotNode extends NodeImpl {
  constructor(nodeId: string) {
    super(
      nodeId,
      "one hot",
      [{ name: "labels" }, { name: "num_classes" }],
      [{ name: "one_hot" }]
    );
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const source = toTensor(inputs.labels, "labels");
    const values = Array.from(await source.data(), Number);
    if (values.length === 0) throw new Error("labels가 비어 있습니다.");
    const inferred = Math.max(...values.map((value) => Math.round(value))) + 1;
    const classCount = Math.min(
      100,
      Math.round(finiteNumber(inputs.num_classes, inferred, 2))
    );
    const labels = tf.tensor1d(values.map((value) => Math.round(value)), "int32");
    const oneHot = tf.oneHot(labels, classCount);
    labels.dispose();
    return { one_hot: oneHot };
  }

  render(): ReactNode {
    return null;
  }
}
