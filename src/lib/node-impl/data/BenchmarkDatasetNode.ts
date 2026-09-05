import type { ReactNode } from "react";
import * as tf from "@tensorflow/tfjs";
import irisRaw from "../../data/datasets/iris.data?raw";
import wineRaw from "../../data/datasets/wine.data?raw";
import breastCancerRaw from "../../data/datasets/breast-cancer-4f.data?raw";
import type { NodeType } from "../../node";
import NodeImpl, { type NodeOutputs } from "../NodeImpl";

type BenchmarkId = "iris" | "wine" | "breast-cancer";

const irisLabels: Record<string, number> = {
  "Iris-setosa": 0,
  "Iris-versicolor": 1,
  "Iris-virginica": 2,
};

function rows(raw: string) {
  return raw
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(","));
}

function parseBenchmark(id: BenchmarkId) {
  if (id === "iris") {
    const parsed = rows(irisRaw);
    return {
      features: parsed.map((row) => row.slice(0, 4).map(Number)),
      labels: parsed.map((row) => irisLabels[row[4]]),
      classCount: 3,
    };
  }
  if (id === "wine") {
    const parsed = rows(wineRaw);
    return {
      features: parsed.map((row) => row.slice(1).map(Number)),
      labels: parsed.map((row) => Number(row[0]) - 1),
      classCount: 3,
    };
  }
  const parsed = rows(breastCancerRaw);
  return {
    features: parsed.map((row) => row.slice(0, 4).map(Number)),
    labels: parsed.map((row) => Number(row[4])),
    classCount: 2,
  };
}

export default class BenchmarkDatasetNode extends NodeImpl {
  private datasetId: BenchmarkId;

  constructor(nodeId: string, nodeType: NodeType, datasetId: BenchmarkId) {
    super(
      nodeId,
      nodeType,
      [],
      [{ name: "features" }, { name: "targets" }, { name: "labels" }]
    );
    this.datasetId = datasetId;
  }

  async process(): Promise<NodeOutputs> {
    const dataset = parseBenchmark(this.datasetId);
    const labels = tf.tensor1d(dataset.labels, "int32");
    const features = tf.tensor2d(dataset.features);
    const targets =
      dataset.classCount === 2
        ? labels.toFloat().reshape([labels.shape[0], 1])
        : tf.oneHot(labels, dataset.classCount);
    return { features, targets, labels };
  }

  render(): ReactNode {
    return null;
  }
}
