import type { Edge, Node } from "../../store/graphics";

export function buildLayers(nodes: Node[], edges: Edge[]): string[][] {
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    indeg.set(n.id, 0);
    adj.set(n.id, []);
  }

  for (const e of edges) {
    adj.get(e.from.node)?.push(e.to.node);
    indeg.set(e.to.node, (indeg.get(e.to.node) ?? 0) + 1);
  }

  const layers: string[][] = [];
  let cur: string[] = nodes
    .filter((n) => (indeg.get(n.id) ?? 0) === 0)
    .map((n) => n.id);

  while (cur.length > 0) {
    layers.push(cur);
    const next: string[] = [];
    for (const u of cur) {
      for (const v of adj.get(u) ?? []) {
        indeg.set(v, (indeg.get(v) ?? 0) - 1);
        if (indeg.get(v) === 0) next.push(v);
      }
    }
    cur = next;
  }

  // Check for cycles
  const allNodes = layers.flat();
  if (allNodes.length < nodes.length) {
    throw new Error("Cycle detected in node graph");
  }

  return layers;
}
