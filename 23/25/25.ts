import assert from "assert";
import { Connection, nodeConnDiff, walk } from "./lib";
import { combinations } from "../../lib";
import { parse } from "./parse";
import fs from "fs";

const data = parse(fs.readFileSync("./25-input.txt", "utf-8"));

const nodes = Object.values(data.nodeDict);
const conns = Object.values(data.connDict);

console.log(`Nodes: ${nodes.length}`);
console.log(`Connections: ${conns.length}`);

data.connDict["jxb-ksq"].cut = true;
data.connDict["nqq-pxp"].cut = true;
data.connDict["dct-kns"].cut = true;

const visited = walk(nodes[0]);
const rest = nodes.length - visited;
console.log({ visited, rest, mul: visited * rest });
process.exit(0);

let result: {
  conn: Connection[];
  groupA: number;
  groupB: number;
  diff: number;
}[] = [];

const totalNodes = nodes.length;

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
      // console.log(count++, node.id, other.id, diff);
      r.push({
        conn,
        a: node.id,
        b: other.id,
        diff,
      });
    }
  }
}

const topR = r.sort((a, b) => b.diff - a.diff).slice(0, conns.length);
// console.log(
//   topR
//     .map((r) => `${[r.a, r.b].sort().join("-")} ${r.diff}`)
//     // .sort()
//     .join("\n")
// );

const connections = topR.map((r) => r.conn);

// generator function retrieve N combinations of connections

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
const allCombinations = combinations(connections, 3);
const relevantNodes = new Set();
for (const conn of allCombinations) {
  count++;
  if (count % (totalCombinations / 4096) === 0) {
    console.log(`Progress: ${((count * 100) / totalCombinations).toFixed(2)}%`);
  }
  // console.log("comb", conn.map((c) => c.toString()).join(" "));
  const [a, b, c] = conn;
  assert(a);
  assert(b);
  assert(c);
  a.cut = b.cut = c.cut = true;
  relevantNodes.clear();
  relevantNodes.add(a.a);
  relevantNodes.add(a.b);
  relevantNodes.add(b.a);
  relevantNodes.add(b.b);
  relevantNodes.add(c.a);
  relevantNodes.add(c.b);

  const visited = walk(nodes[0]);
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
      if (diff < 4) {
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
  a.cut = b.cut = c.cut = false;
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
