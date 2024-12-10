import { bench, combinations } from "../../../lib";
import * as THREE from "three";
import { parseDict } from "../../../lib/parse";
import { SampleInputs } from "../sample-data";

function vectorFactory() {
  return new THREE.Vector2();
}

const input = SampleInputs[0];

class Connection {
  public static readonly all: Record<string, Connection> = {};
  public static create(aid: string, bid: string) {
    const key = [aid, bid].sort().join("-");
    if (!Connection.all[key]) {
      Connection.all[key] = new Connection(
        Node.get(aid),
        Node.get(bid),
        false,
        key
      );
    }
    return Connection.all[key];
  }

  private constructor(
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
  public static readonly all: Record<string, Node> = {};
  public static get(id: string) {
    if (Node.all[id] === undefined) {
      Node.all[id] = new Node(id);
    }
    return Node.all[id];
  }

  public readonly conns: Set<Connection> = new Set();
  private constructor(public readonly id: string) {}
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

const data = parseDict(input);

data.forEach(([id, nextIds]) => {
  nextIds.forEach((nextId) => {
    Connection.create(id, nextId);
  });
});

const nodes = Object.values(Node.all);
const conns = Object.values(Connection.all);

const nodeCombosIter = combinations(nodes, 2);
const nodeCombos = Array.from(nodeCombosIter);
const forceV = vectorFactory();

interface Config {
  force: number;
  stiffness: number;
  restLength: number;
}

function step(dt: number, cfg: Config) {
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

  for (const node of nodes) {
    node.pos.add(node.force);
    node.force.set(0, 0);
  }
}

function longestConnections(top = 3) {
  const sorted = conns.slice().sort((a, b) => {
    return a.a.pos.distanceTo(a.b.pos) - b.a.pos.distanceTo(b.b.pos);
  });

  return sorted.slice(-top);
}

const DefaultCriteria: VerifyCallback<boolean> = (networks) =>
  Object.values(networks).length > 1;

type VerifyCallback<R> = (networks: Record<string, number>) => R;

function verify<R>(cuts: Connection[], cb: VerifyCallback<R>): R {
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

const config: Config = {
  force: 10,
  stiffness: 0.1,
  restLength: 10,
};

function run(maxIter = 1000, connections = 3) {
  const rnd = new THREE.Vector3(1, 2, 3).normalize();
  nodes.forEach((node, i) => {
    // rotate the rnd vector around the very center and add it to the node position
    node.pos.add(rnd.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), i));
  });

  for (let i = 0; i < maxIter; i++) {
    bench(() => step(1, config), "step", true);

    const result = bench(
      () => longestConnections(connections),
      "longestConnections",
      true
    );
    let ver:
      | false
      | {
          networks: Record<string, number>;
          mul: number;
        } = false;

    if (i > 20)
      ver = bench(
        () =>
          verify(result, (networks) => {
            const sizes = Object.values(networks);
            if (sizes.length !== 2) return false;
            return {
              networks,
              mul: sizes.reduce((acc, s) => acc * s, 1),
            };
          }),
        "verify"
      );

    if (ver) {
      console.log(
        `Found a configuration that meets the criteria in ${i} steps`,
        result.map((r) => r.toString()).join(", ")
      );

      const totalNodes = nodes.length;
      console.log("Total nodes", totalNodes);
      console.log("Visited * Remaining", ver.mul);
      break;
    }
  }
}

bench(() => run());
