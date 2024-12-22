import { bench, combinations } from "../../../lib";
import * as THREE from "three";
import { parseDict } from "../../../lib/parse";

function vectorFactory() {
  return new THREE.Vector2();
}

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

export function setup(input: string) {
  return new PhysicalMinCut(input);
}

export class PhysicalMinCut {
  public data: [string, string[]][];
  public nodeFactory = new NodeFactory();
  public connFactory = new ConnectionFactory();
  public nodes: Node[] = [];
  public conns: Connection[] = [];
  public nodeCombos: [Node, Node][] = [];
  private forceV = vectorFactory();
  constructor(input: string) {
    this.data = parseDict(input);
    this.data.forEach(([id, nextIds]) => {
      nextIds.forEach((nextId) => {
        this.connFactory.create(id, nextId, this.nodeFactory);
      });
    });
    this.nodes = Object.values(this.nodeFactory.all);
    this.conns = Object.values(this.connFactory.all);

    const nodeCombosIter = combinations(this.nodes, 2);
    this.nodeCombos = Array.from(nodeCombosIter) as [Node, Node][];

    const rnd = new THREE.Vector3(1, 2, 3).normalize();

    // randomize the initial positions -- this has impact on how many iterations are needed
    this.nodes.forEach((node, i) => {
      // rotate the rnd vector around the very center and add it to the node position
      node.pos.add(rnd.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), i));
    });
  }
  step<R>(dt: number, cfg: Config<R>) {
    const { force, stiffness, restLength } = cfg;

    for (const node of this.nodeCombos) {
      const [a, b] = node;
      const distance = a.pos.distanceTo(b.pos);
      const repulsiveForce = force / distance ** 2;
      this.forceV
        .copy(a.pos)
        .sub(b.pos)
        .normalize()
        .multiplyScalar(repulsiveForce);
      a.force.add(this.forceV);
      b.force.sub(this.forceV);
    }

    for (const conn of this.conns) {
      const { a, b } = conn;
      const distance = a.pos.distanceTo(b.pos);
      const extension = distance - restLength;
      const springForce = stiffness * extension;
      this.forceV
        .copy(a.pos)
        .sub(b.pos)
        .normalize()
        .multiplyScalar(springForce);
      a.force.sub(this.forceV);
      b.force.add(this.forceV);
    }

    let i = 0;
    for (const node of this.nodes) {
      node.pos.add(node.force);
      node.force.set(0, 0);
    }
  }

  longestEdges(top = 3) {
    const sorted = this.conns.sort((a, b) => {
      return a.a.pos.distanceTo(a.b.pos) - b.a.pos.distanceTo(b.b.pos);
    });

    return sorted.slice(-top);
  }

  verify<R>(cuts: Connection[], cb: VerifyCallback<R>): R | false {
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
    this.nodes.forEach((node) => {
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

  run<R>(cfg: Config<R>):
    | (R & {
        nodes: Node[];
        conns: Connection[];
        result: Connection[];
        iter: number;
      })
    | false {
    const { maxIter, edges, verifyCB, skipVerificationFor } = cfg;

    for (let i = 0; i < maxIter; i++) {
      this.step(1, cfg);
      if (i < skipVerificationFor) continue;
      const result = this.longestEdges(edges);

      let ver: false | R = false;

      ver = this.verify(result, verifyCB);

      if (ver) {
        // console.log("Found in", i, "iterations");
        return {
          ...ver,
          nodes: this.nodes,
          conns: this.conns,
          result,
          iter: i,
        };
      }
    }
    return false;
  }
}

const config: Config<{
  networks: Record<string, number>;
  mul: number;
}> = {
  maxIter: 100,
  skipVerificationFor: 20,
  verifyCB: (networks) => {
    const sizes = Object.values(networks);
    if (sizes.length !== 2) return false;
    return {
      networks,
      mul: sizes.reduce((acc, s) => acc * s, 1),
    };
  },
  edges: 3,
  force: 50,
  stiffness: 0.1,
  restLength: 5,
};

export function part1(mincut: PhysicalMinCut) {
  const result = mincut.run(config);
  if (result) {
    const { nodes, mul, iter } = result;
    return mul.toString();
  }
}

// import fs from "fs";
// console.log(part1(setup(fs.readFileSync("../25-input.txt", "utf-8"))));
