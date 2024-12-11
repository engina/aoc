import { bench, combinations } from "../../../lib";
import * as THREE from "three";
import { parseDict } from "../../../lib/parse";
import { SampleInputs } from "../sample-data";

function vectorFactory() {
  return new THREE.Vector2();
}

const input = SampleInputs[0];

class ConnectionFactory {
  public readonly all: Record<string, Connection> = {};
  public create(aid: string, bid: string, nodeFactory: NodeFactory) {
    const key = [aid, bid].sort().join("-");
    if (!this.all[key]) {
      this.all[key] = new Connection(
        nodeFactory.get(aid),
        nodeFactory.get(bid),
        false,
        key
      );
    }
    return this.all[key];
  }
}

class Connection {
  public constructor(
    public readonly a: Node,
    public readonly b: Node,
    public cut: boolean = false,
    private readonly key = ""
  ) {
    a.conns.add(this);
    b.conns.add(this);
  }

  toString() {
    return this.key;
  }

  public other(node: Node) {
    if (node === this.a) {
      return this.b;
    }
    if (node === this.b) {
      return this.a;
    }
    throw new Error("Node not in connection");
  }

  public isEqual(conn: Connection) {
    return (
      (conn.a === this.a && conn.b === this.b) ||
      (conn.a === this.b && conn.b === this.a)
    );
  }
}

class Node {
  public pos = vectorFactory();
  public force = vectorFactory();
  public network: string = "";
  public readonly conns: Set<Connection> = new Set();
  public constructor(public readonly id: string) {}
}

class NodeFactory {
  public readonly all: Record<string, Node> = {};
  public get(id: string) {
    if (this.all[id] === undefined) {
      this.all[id] = new Node(id);
    }
    return this.all[id];
  }
}

export function walk<T>(
  node: Node,
  cb: (n: Node, payload?: T) => boolean = () => true,
  payload?: T,
  visited: Set<Node> = new Set()
) {
  if (visited.has(node)) {
    return 0;
  }
  cb(node, payload);
  visited.add(node);
  let sum = 1;
  node.conns.forEach((conn) => {
    if (conn.cut) {
      return;
    }
    sum += walk(conn.other(node), cb, payload, visited);
  });
  return sum;
}

const DefaultCriteria: VerifyCallback<boolean> = (networks) =>
  Object.values(networks).length > 1;

type VerifyCallback<R> = (networks: Record<string, number>) => R | false;

export interface Config<R> {
  maxIter: number;
  edges: number;
  skipVerificationFor: number;
  verifyCB: VerifyCallback<R>;
  force: number;
  stiffness: number;
  restLength: number;
}

export function PhysicalMinCut(input: string) {
  const data = parseDict(input);
  const nodeFactory = new NodeFactory();
  const connFactory = new ConnectionFactory();

  data.forEach(([id, nextIds]) => {
    nextIds.forEach((nextId) => {
      connFactory.create(id, nextId, nodeFactory);
    });
  });
  const nodes = Object.values(nodeFactory.all);
  const conns = Object.values(connFactory.all);

  const nodeCombosIter = combinations(nodes, 2);
  const nodeCombos = Array.from(nodeCombosIter);

  const rnd = new THREE.Vector3(1, 2, 3).normalize();
  nodes.forEach((node, i) => {
    // rotate the rnd vector around the very center and add it to the node position
    node.pos.add(rnd.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), i));
  });

  const forceV = vectorFactory();

  function step<R>(dt: number, cfg: Config<R>) {
    const { force, stiffness, restLength } = cfg;

    for (const node of nodeCombos) {
      const [a, b] = node;
      const distance = a.pos.distanceTo(b.pos);
      const repulsiveForce = force / distance ** 2;
      forceV.copy(a.pos).sub(b.pos).normalize().multiplyScalar(repulsiveForce);
      a.force.add(forceV);
      b.force.sub(forceV);
    }

    for (const conn of conns) {
      const { a, b } = conn;
      const distance = a.pos.distanceTo(b.pos);
      const extension = distance - restLength;
      const springForce = stiffness * extension;
      forceV.copy(a.pos).sub(b.pos).normalize().multiplyScalar(springForce);
      a.force.sub(forceV);
      b.force.add(forceV);
    }

    let i = 0;
    for (const node of nodes) {
      node.pos.add(node.force.multiplyScalar(0.000001));
      node.force.set(0, 0);
    }
  }

  function longestEdges(top = 3) {
    const sorted = conns.sort((a, b) => {
      return a.a.pos.distanceTo(a.b.pos) - b.a.pos.distanceTo(b.b.pos);
    });

    return sorted.slice(-top);
  }

  function verify<R>(cuts: Connection[], cb: VerifyCallback<R>): R | false {
    const nodesOfInterest: Node[] = [];
    for (const conn of cuts) {
      conn.cut = true;
      nodesOfInterest.push(conn.a, conn.b);
    }

    nodesOfInterest.forEach((node) => {
      walk(node, (n) => {
        n.network = node.id;
        return true;
      });
    });

    const networkSizes: Record<string, number> = {};
    nodes.forEach((node) => {
      if (!networkSizes[node.network]) {
        networkSizes[node.network] = 0;
      }
      networkSizes[node.network]++;
    });

    for (const conn of cuts) {
      conn.cut = false;
    }
    return cb(networkSizes);
  }

  function run<R>(cfg: Config<R>):
    | (R & {
        nodes: Node[];
        conns: Connection[];
        result: Connection[];
        iter: number;
      })
    | false {
    const { maxIter, edges, verifyCB, skipVerificationFor } = cfg;

    for (let i = 0; i < maxIter; i++) {
      bench(() => step(1, cfg), "step", true);

      const result = bench(
        () => longestEdges(edges),
        "longestConnections",
        true
      );

      let ver: false | R = false;

      if (i > skipVerificationFor)
        ver = bench(() => verify(result, verifyCB), "verify");

      if (ver) {
        return { ...ver, nodes, conns, result, iter: i };
      }
    }
    return false;
  }

  return {
    run,
    step,
    verify,
    longestEdges,
    nodes,
    conns,
  };
}

// const f = PhysicalMinCut(SampleInputs[0]);

// const config: Config<{
//   networks: Record<string, number>;
//   mul: number;
// }> = {
//   maxIter: 1000,
//   skipVerificationFor: 20,
//   verifyCB: (networks) => {
//     const sizes = Object.values(networks);
//     if (sizes.length !== 2) return false;
//     return {
//       networks,
//       mul: sizes.reduce((acc, s) => acc * s, 1),
//     };
//   },
//   edges: 3,
//   force: 10,
//   stiffness: 0.1,
//   restLength: 10,
// };

// const runResult = bench(() => f.run(config), "run");

// if (runResult) {
//   const { nodes, mul, result, iter } = runResult;
//   console.log(
//     `Found a configuration that meets the criteria in ${iter} steps`,
//     result.map((r) => r.toString()).join(", ")
//   );

//   const totalNodes = nodes.length;
//   console.log("Total nodes", totalNodes);
//   console.log("Visited * Remaining", mul);
// }
