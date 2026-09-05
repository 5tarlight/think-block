import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import type { NodeType } from "../../node";
import NodeImpl, { type NodeInputs, type NodeOutputs } from "../NodeImpl";
import { finiteNumber } from "../tensor-utils";

type SyntheticId = "moons" | "blobs";

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(next: () => number) {
  const u = Math.max(next(), Number.EPSILON);
  const v = next();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default class SyntheticClassificationNode extends NodeImpl {
  private datasetId: SyntheticId;

  constructor(nodeId: string, nodeType: NodeType, datasetId: SyntheticId) {
    super(
      nodeId,
      nodeType,
      [{ name: "n" }, { name: "noise" }, { name: "seed" }],
      [{ name: "features" }, { name: "targets" }, { name: "labels" }]
    );
    this.datasetId = datasetId;
  }

  async process(inputs: NodeInputs): Promise<NodeOutputs> {
    const sampleCount = Math.min(2000, Math.round(finiteNumber(inputs.n, 240, 30)));
    const noise = Math.min(1, finiteNumber(inputs.noise, 0.12, 0));
    const seed = Math.round(finiteNumber(inputs.seed, 42));
    const next = random(seed);
    const features: number[][] = [];
    const labels: number[] = [];

    if (this.datasetId === "moons") {
      for (let index = 0; index < sampleCount; index += 1) {
        const label = index % 2;
        const angle = next() * Math.PI;
        const x = label === 0 ? Math.cos(angle) : 1 - Math.cos(angle);
        const y = label === 0 ? Math.sin(angle) : 0.5 - Math.sin(angle);
        features.push([x + normal(next) * noise, y + normal(next) * noise]);
        labels.push(label);
      }
    } else {
      const centers = [[-1.4, -0.8], [1.3, -0.7], [0, 1.35]];
      for (let index = 0; index < sampleCount; index += 1) {
        const label = index % centers.length;
        const center = centers[label];
        features.push([
          center[0] + normal(next) * Math.max(noise, 0.18),
          center[1] + normal(next) * Math.max(noise, 0.18),
        ]);
        labels.push(label);
      }
    }

    const labelTensor = tf.tensor1d(labels, "int32");
    const targets =
      this.datasetId === "moons"
        ? labelTensor.toFloat().reshape([sampleCount, 1])
        : tf.oneHot(labelTensor, 3);
    return {
      features: tf.tensor2d(features),
      targets,
      labels: labelTensor,
    };
  }

  render(): ReactNode {
    return null;
  }
}
