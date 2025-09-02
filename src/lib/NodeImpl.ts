import type { ReactNode } from "react";
import type { NodeType } from "./node";
import { uid } from "../store/graphics";

export type Port = {
  id: string;
  name: string;
  kind: "in" | "out";
};

export default abstract class NodeImpl {
  private nodeId: string;
  private nodeType: NodeType;
  private inputs: Port[];
  private outputs: Port[];

  constructor(
    nodeId: string,
    nodeType: NodeType,
    inputs: { name: string }[],
    outputs: { name: string }[]
  ) {
    this.nodeId = nodeId;
    this.nodeType = nodeType;
    this.inputs = inputs.map(({ name }) => ({
      id: uid("p"),
      name,
      kind: "in",
    }));
    this.outputs = outputs.map(({ name }) => ({
      id: uid("p"),
      name,
      kind: "out",
    }));
  }

  abstract render(): ReactNode;
}
