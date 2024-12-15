import fs from "fs";

const input = fs.readFileSync("25-input.txt", "utf-8");
// const input = `jqt: rhn xhk nvd
// rsh: frs pzl lsr
// xhk: hfx
// cmg: qnr nvd lhk bvb
// rhn: xhk bvb hfx
// bvb: xhk hfx
// pzl: lsr hfx nvd
// qnr: nvd
// ntq: jqt hfx bvb xhk
// nvd: lhk
// lsr: lhk
// rzs: qnr cmg lsr rsh
// frs: qnr lhk lsr
// `;

class Connection {
  public static readonly all: Record<string, Connection> = {};
  public static create(aid: string, bid: string) {
    const key = [aid, bid].sort().join("-");
    if (!Connection.all[key]) {
      // console.log("Creating connection", key);
      Connection.all[key] = new Connection(
        MNode.get(aid),
        MNode.get(bid),
        false,
        key
      );
    }
    // console.log("Returning connection", key);
    return Connection.all[key];
  }

  private constructor(
    private readonly a: MNode,
    private readonly b: MNode,
    public cut: boolean = false,
    private readonly key = ""
  ) {
    a.conns.add(this);
    b.conns.add(this);
  }

  toString() {
    return this.key;
  }

  public other(node: MNode) {
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
import * as THREE from "three";

class MNode {
  public pos: THREE.Vector3 = new THREE.Vector3();
  public force: THREE.Vector3 = new THREE.Vector3();
  public static readonly all: Record<string, MNode> = {};
  public static get(id: string) {
    if (MNode.all[id] === undefined) {
      // console.log("Creating node", id);
      MNode.all[id] = new MNode(id);
    }
    // console.log("Returning node", id);
    return MNode.all[id];
  }

  public readonly conns: Set<Connection> = new Set();
  private constructor(public readonly id: string) {}
}

input
  .split("\n")
  .filter((i) => !!i)
  .forEach((line) => {
    const [_id, ...nextIds] = line.split(" ");
    let id = _id.slice(0, 3);

    nextIds.forEach((nextId) => {
      // console.log("Creating connection", id, nextId);
      Connection.create(id, nextId);
    });
  });

// Connection.all["hfx-pzl"].cut = true;
// Connection.all["bvb-cmg"].cut = true;
// Connection.all["jqt-nvd"].cut = true;

// print node graph with circular structure handling
export function walk<T>(
  node: MNode,
  cb: (n: MNode, payload?: T) => boolean = () => true,
  payload?: T,
  visited: Set<MNode> = new Set()
) {
  if (visited.has(node)) {
    return 0;
  }

  visited.add(node);
  let sum = 1;
  node.conns.forEach((conn) => {
    if (conn.cut) {
      // console.log(`Not walking ${conn.toString()}`);
      return;
    }
    // console.log(`${node.id} -> ${conn.other(node).id}`);
    sum += walk(conn.other(node), cb, payload, visited);
  });
  return sum;
}

/* a1 -\          /- d1
 * a2 -> b1 -> c1 <- d2
 * a3 -/          \- d3 -|
 * a4 -\          /- d4 -|
 * a5 -> b2 -> c2 <- d5
 * a6 -/          \- d6 -|
 * a7 -\          /- d7 -|
 * a8 -> b3 -> c3 <- d8
 * a9 -/          \- d9
 */
Connection.create("a1", "b1");
Connection.create("a2", "b1");
Connection.create("a3", "b1");
Connection.create("a4", "b2");
Connection.create("a5", "b2");
Connection.create("a6", "b2");
Connection.create("a7", "b3");
Connection.create("a8", "b3");
Connection.create("a9", "b3");
Connection.create("b1", "c1");
Connection.create("b2", "c2");
Connection.create("b3", "c3");
Connection.create("c1", "d1");
Connection.create("c1", "d2");
Connection.create("c1", "d3");
Connection.create("c2", "d4");
Connection.create("c2", "d5");
Connection.create("c2", "d6");
Connection.create("c3", "d7");
Connection.create("c3", "d8");
Connection.create("c3", "d9");
Connection.create("d3", "d4");
Connection.create("d6", "d7");

// const visited = walk(MNode.get("jqt"));
const visited = walk(MNode.get("a1"));
console.log(visited, Object.keys(MNode.all).length);
console.log(Object.keys(Connection.all).length, Object.keys(MNode.all).length);
process.exit(0);
const connections = Object.values(Connection.all);

console.log(`Total connections: ${connections.length}`);
console.log(`Total nodes: ${Object.keys(MNode.all).length}`);

let result: {
  conn: Connection[];
  groupA: number;
  groupB: number;
  diff: number;
}[] = [];

// create all possible combinations of 3 connections
function* combinations<T>(arr: T[], n: number): Generator<T[]> {
  const result: T[] = [];
  function* helper(start: number, depth: number): Generator<T[]> {
    if (depth === 0) {
      yield result.slice();
      return;
    }
    for (let i = start; i <= arr.length - depth; i++) {
      result[result.length - depth] = arr[i];
      yield* helper(i + 1, depth - 1);
    }
  }
  yield* helper(0, n);
}
// console.log("Computing combinations for", connections.length);
// const combGen = combinations(connections, 3);
// let count = 0;
// for (const comb of combGen) {
//   count++;
//   // Process each combination here
// }
// process.exit(0);

const totalNodes = Object.keys(MNode.all).length;
let log: string[] = [];
// const calculated = new Set<string>();
for (let i = 0; i < connections.length; i++) {
  console.log(`Progress: ${((i * 100) / connections.length).toFixed(4)}`);
  const a = connections[i];
  // console.log("Trying cutting", a.toString());
  for (let j = 0; j < connections.length; j++) {
    if (i === j) continue;
    const b = connections[j];
    // console.log("         ", b.toString());
    for (let k = 0; k < connections.length; k++) {
      if (j === k || i === k) continue;
      const c = connections[k];
      // console.log("                  ", c.toString());
      // if (i === j || j === k || i === k) continue;
      // console.log(i, j, k);
      // if (a.isEqual(b) || a.isEqual(c) || b.isEqual(c)) continue;
      // const consStr = [a, b, c]
      //   .map((conn) => conn.toString())
      //   .sort()
      //   .join(" ");
      if (a.toString() < b.toString() && b.toString() < c.toString()) {
        continue;
      }

      // log.push(`Trying cutting ${consStr}`);
      // console.log(`Trying cutting ${consStr}`);
      a.cut = b.cut = c.cut = true;
      const visited = walk(MNode.get("jqt"));
      if (visited !== totalNodes) {
        // console.log(
        //   "Found it",
        //   a.toString(),
        //   b.toString(),
        //   c.toString(),
        //   visited
        // );
        // console.log(visited, totalNodes);
        const groupA = visited;
        const groupB = totalNodes - visited;
        const diff = Math.abs(groupA - groupB);
        if (diff < 1000) {
          console.log(
            "Found it",
            a.toString(),
            b.toString(),
            c.toString(),
            groupA,
            groupB,
            diff
          );
          result.push({
            conn: [a, b, c],
            groupA,
            groupB,
            diff,
          });
        }
      } else {
        // console.log("Nope", a.toString(), b.toString(), c.toString());
      }
      a.cut = b.cut = c.cut = false;
    }
  }
}

// console.log(log.sort().join("\n"));

console.log(
  result
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 10)
    .map(
      (r) =>
        `${r.conn.map((c) => c.toString()).join(" ")} ${r.groupA} ${r.groupB} ${
          r.diff
        }`
    )
    .join("\n")
);
