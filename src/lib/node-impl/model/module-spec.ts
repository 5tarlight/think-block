export type LayerSpec =
  | {
      kind: "linear";
      inFeatures: number;
      outFeatures: number;
      bias: true;
    }
  | { kind: "relu" }
  | { kind: "sigmoid" }
  | { kind: "dropout"; probability: number };

export interface ModuleChain {
  kind: "module-chain";
  layers: LayerSpec[];
}

export interface SequentialModelSpec {
  kind: "sequential-spec";
  layers: LayerSpec[];
}

export interface OptimizerSpec {
  kind: "optimizer-spec";
  name: "adam" | "sgd";
  learningRate: number;
}

export interface LossSpec {
  kind: "loss-spec";
  name: "meanSquaredError" | "binaryCrossentropy";
}

export interface DenseWeights {
  kernel: number[];
  kernelShape: [number, number];
  bias: number[];
}

export interface TrainedSequentialModel {
  kind: "sequential-model";
  layers: LayerSpec[];
  denseWeights: DenseWeights[];
  lossHistory: number[];
}

export function isModuleChain(value: unknown): value is ModuleChain {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Partial<ModuleChain>).kind === "module-chain" &&
    Array.isArray((value as Partial<ModuleChain>).layers)
  );
}

export function isSequentialModelSpec(
  value: unknown
): value is SequentialModelSpec {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Partial<SequentialModelSpec>).kind === "sequential-spec" &&
    Array.isArray((value as Partial<SequentialModelSpec>).layers)
  );
}

export function isOptimizerSpec(value: unknown): value is OptimizerSpec {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Partial<OptimizerSpec>).kind === "optimizer-spec"
  );
}

export function isLossSpec(value: unknown): value is LossSpec {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Partial<LossSpec>).kind === "loss-spec"
  );
}

export function isTrainedSequentialModel(
  value: unknown
): value is TrainedSequentialModel {
  return (
    !!value &&
    typeof value === "object" &&
    (value as Partial<TrainedSequentialModel>).kind === "sequential-model" &&
    Array.isArray((value as Partial<TrainedSequentialModel>).denseWeights)
  );
}

export function appendLayer(value: unknown, layer: LayerSpec): ModuleChain {
  if (value === undefined || value === null) {
    return { kind: "module-chain", layers: [layer] };
  }
  if (!isModuleChain(value)) {
    throw new Error("module 입력에는 다른 nn.Module 블록을 연결하세요.");
  }
  return { kind: "module-chain", layers: [...value.layers, layer] };
}

export function lastLinearOutput(value: unknown): number | undefined {
  if (!isModuleChain(value)) return undefined;
  return [...value.layers]
    .reverse()
    .find((layer) => layer.kind === "linear")?.outFeatures;
}
