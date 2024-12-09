import fs from "fs";

type Graph = Map<string, Map<string, number>>;

// Create a new graph
function createGraph(): Graph {
  return new Map();
}

// Add an edge to the graph
function addEdge(graph: Graph, u: string, v: string, weight: number = 1): void {
  if (!graph.has(u)) graph.set(u, new Map());
  if (!graph.has(v)) graph.set(v, new Map());
  graph.get(u)!.set(v, (graph.get(u)!.get(v) || 0) + weight);
  graph.get(v)!.set(u, (graph.get(v)!.get(u) || 0) + weight);
}

// Remove an edge from the graph
function removeEdge(graph: Graph, u: string, v: string): void {
  graph.get(u)?.delete(v);
  graph.get(v)?.delete(u);
}

// Clone a graph deeply
function cloneGraph(graph: Graph): Graph {
  const newGraph = createGraph();
  for (const [node, neighbors] of graph.entries()) {
    for (const [neighbor, weight] of neighbors) {
      addEdge(newGraph, node, neighbor, weight);
    }
  }
  return newGraph;
}

// Get sizes of connected components
function getConnectedComponentsSizes(graph: Graph): number[] {
  const visited = new Set<string>();
  const sizes: number[] = [];

  function dfs(node: string): number {
    const stack = [node];
    let size = 0;

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      size++;
      for (const neighbor of graph.get(current) || []) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }
    return size;
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) sizes.push(dfs(node));
  }

  return sizes;
}

// Generate all combinations of 3 edges
function* generateEdgeCombinations(
  edges: [string, string][]
): Generator<[string, string][]> {
  const n = edges.length;
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        yield [edges[i], edges[j], edges[k]];
      }
    }
  }
}

// Main function to solve the 3-edge removal problem
function solveThreeEdgeRemoval(graph: Graph): {
  maxProduct: number;
  bestEdges: string[];
} {
  // Get all edges in the graph
  const edges: [string, string][] = [];
  for (const [node, neighbors] of graph.entries()) {
    for (const neighbor of neighbors.keys()) {
      if (node < neighbor) edges.push([node, neighbor]);
    }
  }

  let maxProduct = 0;
  let bestEdges: string[] = [];

  console.log(`Total edges: ${edges.length}`);
  console.log(
    `Total combinations to evaluate: ${
      (edges.length * (edges.length - 1) * (edges.length - 2)) / 6
    }`
  );

  // Iterate through all combinations of three edges
  let count = 0;
  for (const edgeCombination of generateEdgeCombinations(edges)) {
    count++;
    if (count % 100000 === 0)
      console.log(`Progress: Evaluated ${count} combinations...`);

    // Clone the graph and remove the edges
    const tempGraph = cloneGraph(graph);
    for (const [u, v] of edgeCombination) {
      removeEdge(tempGraph, u, v);
    }

    // Get sizes of resulting connected components
    const sizes = getConnectedComponentsSizes(tempGraph).sort((a, b) => b - a);

    // Only consider cases where the graph is split into exactly 2 groups
    if (sizes.length === 2) {
      const product = sizes[0] * sizes[1];
      if (product > maxProduct) {
        maxProduct = product;
        bestEdges = edgeCombination.map(([u, v]) => [u, v].sort().join("-"));
      }
    }
  }

  return { maxProduct, bestEdges };
}

// Load graph from 25-input.txt
function loadGraphFromFile(filePath: string): Graph {
  const graph = createGraph();

  const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n");
  for (const line of lines) {
    const [node, neighbors] = line.split(":");
    const neighborList = neighbors.trim().split(/\s+/);
    for (const neighbor of neighborList) {
      addEdge(graph, node.trim(), neighbor.trim(), 1); // Unweighted edges
    }
  }

  return graph;
}

// Main function
function main(): void {
  const inputFile = "25-input.txt";
  const graph = loadGraphFromFile(inputFile);
  console.log("Graph loaded successfully!");

  console.time("Execution Time");
  const { maxProduct, bestEdges } = solveThreeEdgeRemoval(graph);
  console.timeEnd("Execution Time");

  console.log(`Maximum product of group sizes: ${maxProduct}`);
  console.log(`Edges to disconnect: ${bestEdges.join(", ")}`);
}

main();
