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

class MNode {
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
    return;
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
function walk<T>(
  node: MNode,
  cb: (n: MNode, payload?: T) => boolean = () => true,
  payload?: T,
  visited: Set<MNode> = new Set()
) {
  if (visited.has(node)) {
    return 0;
  }

  visited.add(node);
  // console.log(
  //   node.id,
  //   node.next.map((n) => n.id)
  // );
  // union of all visited nodes
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
// const visited = walk(MNode.get("a1"));
// console.log(visited, Object.keys(MNode.all).length);
// console.log(Object.keys(Connection.all).length, Object.keys(MNode.all).length);
// process.exit(0);
// const connections = Object.values(Connection.all);
// console.log(connections);

let result: {
  conn: Connection[];
  groupA: number;
  groupB: number;
  diff: number;
}[] = [];

const totalNodes = Object.keys(MNode.all).length;
let log: string[] = [];

// console.log(log.sort().join("\n"));

function nodeConnDiff(a: MNode, b: MNode): number {
  // find the diff of a.conn and b.conn
  const diffA = new Set<Connection>();
  a.conns.forEach((conn) => {
    if (!b.conns.has(conn)) {
      diffA.add(conn);
    }
  });
  const diffB = new Set<Connection>();
  b.conns.forEach((conn) => {
    if (!a.conns.has(conn)) {
      diffB.add(conn);
    }
  });
  return diffA.size + diffB.size;
}

const nodes = Object.values(MNode.all);
const r: {
  a: string;
  b: string;
  diff: number;
  conn: Connection;
}[] = [];
let count = 0;

for (let i = 0; i < nodes.length; i++) {
  const node = nodes[i];
  const conns = Array.from(node.conns);
  for (let j = 0; j < conns.length; j++) {
    const conn = conns[j];
    const other = conn.other(node);

    // Ensure that each pair is processed only once
    if (node.id < other.id) {
      const diff = nodeConnDiff(node, other);
      console.log(count++, node.id, other.id, diff);
      r.push({
        conn,
        a: node.id,
        b: other.id,
        diff,
      });
    }
  }
}

const topR = r.sort((a, b) => b.diff - a.diff).slice(0, 200);
console.log(
  topR
    .map((r) => `${[r.a, r.b].sort().join("-")} ${r.diff}`)
    // .sort()
    .join("\n")
);

const connections = topR.map((r) => r.conn);

// generator function retrieve N combinations of connections
function* combinations(connections: Connection[], N: number) {
  const indexes = Array.from({ length: N }, (_, i) => i);
  while (true) {
    const result = indexes.map((i) => connections[i]);
    yield result;
    let i = N - 1;
    while (i >= 0 && indexes[i] === connections.length - N + i) {
      i--;
    }
    if (i < 0) {
      break;
    }
    indexes[i]++;
    for (let j = i + 1; j < N; j++) {
      indexes[j] = indexes[i] + j - i;
    }
  }
}

console.log(`Connections: ${connections.length}`);
console.log(`Nodes: ${nodes.length}`);

// calculate total number of combinations
let totalCombinations = 1;
for (let i = 0; i < 3; i++) {
  totalCombinations *= connections.length - i;
}
for (let i = 1; i <= 3; i++) {
  totalCombinations /= i;
}
console.log(`Total combinations: ${totalCombinations}`);
count = 0;
for (const conn of combinations(connections, 3)) {
  count++;
  if (count % 100000 === 0) {
    console.log(`Progress: ${(count * 100) / totalCombinations}%`);
  }
  // console.log("comb", conn.map((c) => c.toString()).join(" "));
  const [a, b, c] = conn;
  conn.forEach((c) => (c.cut = true));
  const visited = walk(Object.values(MNode.all)[0]);
  if (visited !== totalNodes) {
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
      if (diff < 5) {
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
    }
  }
  conn.forEach((c) => (c.cut = false));
}

// for (let i = 0; i < connections.length; i++) {
//   console.log(`Progress: ${((i * 100) / connections.length).toFixed(4)}`);
//   const a = connections[i];
//   // console.log("Trying cutting", a.toString());
//   for (let j = 0; j < connections.length; j++) {
//     if (i === j) continue;
//     const b = connections[j];
//     // console.log("         ", b.toString());
//     for (let k = 0; k < connections.length; k++) {
//       if (j === k || i === k) continue;
//       const c = connections[k];
//       // console.log("                  ", c.toString());
//       // if (i === j || j === k || i === k) continue;
//       // console.log(i, j, k);
//       // if (a.isEqual(b) || a.isEqual(c) || b.isEqual(c)) continue;
//       // const consStr = [a, b, c].map((conn) => conn.toString()).join(" ");
//       // log.push(`Trying cutting ${consStr}`);
//       // console.log(`Trying cutting ${consStr}`);
//       a.cut = b.cut = c.cut = true;
//       const visited = walk(Object.values(MNode.all)[0]);
//       if (visited !== totalNodes) {
//         // console.log(
//         //   "Found it",
//         //   a.toString(),
//         //   b.toString(),
//         //   c.toString(),
//         //   visited
//         // );
//         // console.log(visited, totalNodes);
//         const groupA = visited;
//         const groupB = totalNodes - visited;
//         const diff = Math.abs(groupA - groupB);
//         if (diff < 2500) {
//           console.log("Found it", a.toString(), b.toString(), c.toString());
//           result.push({
//             conn: [a, b, c],
//             groupA,
//             groupB,
//             diff,
//           });
//         }
//       } else {
//         // console.log("Nope", a.toString(), b.toString(), c.toString());
//       }
//       a.cut = b.cut = c.cut = false;
//     }
//   }
// }

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
