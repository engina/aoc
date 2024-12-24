export function setup(input: string) {
  const [initialsStr, connectionsStr] = input.trim().split("\n\n");
  const initials: Record<string, boolean> = {};
  initialsStr.split("\n").forEach((line) => {
    const [name, value] = line.split(": ");
    initials[name] = value === "1";
  });
  const dependencyGraph: Record<string, [string, string, string]> = {};
  const outs: Record<string, [string, string, string]> = {};
  const connections = connectionsStr.split("\n").map((line) => {
    const [left, op, right, arrow, target] = line.split(" ");
    dependencyGraph[target] = [op, left, right];
    if (target.startsWith("z")) {
      outs[target] = [op, left, right];
    }
    return [left, op, right, target];
  });
  return { initials, connections, dependencyGraph, outs };
}

export type Input = ReturnType<typeof setup>;

function get(
  node: string,
  initials: Record<string, boolean>,
  dependencyGraph: Record<string, string[]>,
  deps: string[] = []
): boolean {
  // if (initials[node] !== undefined) {
  //   return initials[node];
  // }
  deps.push(node);

  const [op, left, right] = dependencyGraph[node];

  let leftVal = initials[left] ?? get(left, initials, dependencyGraph, deps);

  let rightVal = initials[right] ?? get(right, initials, dependencyGraph, deps);

  switch (op) {
    case "AND":
      return leftVal && rightVal;
      return (initials[node] = leftVal && rightVal);
    case "OR":
      return leftVal || rightVal;
      return (initials[node] = leftVal || rightVal);
    case "XOR":
      return leftVal !== rightVal;
      return (initials[node] = leftVal !== rightVal);
    default:
      throw Error(`Unknown op ${op}`);
  }
}

export function part1(input: Input) {
  const { initials, dependencyGraph, outs } = input;
  for (const [k] of Object.entries(outs)) {
    const deps: string[] = [];
    get(k, initials, dependencyGraph, deps);
    console.log(k, deps);
  }

  let sum = 0;

  Object.entries(initials)
    .filter(([k]) => k[0] === "z")
    .forEach(([k, v]) => {
      const sh = parseInt(k.slice(1));
      sum += v ? 2 ** sh : 0;
    });

  return sum.toString();
}

export function part2(input: Input) {
  return input;
}
let input = ``;

input = `x00: 1
x01: 1
x02: 1
y00: 0
y01: 1
y02: 0

x00 AND y00 -> z00
x01 XOR y01 -> z01
x02 OR y02 -> z02
`;

input = `x00: 1
x01: 0
x02: 1
x03: 1
x04: 0
y00: 1
y01: 1
y02: 1
y03: 1
y04: 1

ntg XOR fgs -> mjb
y02 OR x01 -> tnw
kwq OR kpj -> z05
x00 OR x03 -> fst
tgd XOR rvg -> z01
vdt OR tnw -> bfw
bfw AND frj -> z10
ffh OR nrd -> bqk
y00 AND y03 -> djm
y03 OR y00 -> psh
bqk OR frj -> z08
tnw OR fst -> frj
gnj AND tgd -> z11
bfw XOR mjb -> z00
x03 OR x00 -> vdt
gnj AND wpb -> z02
x04 AND y00 -> kjc
djm OR pbm -> qhw
nrd AND vdt -> hwm
kjc AND fst -> rvg
y04 OR y02 -> fgs
y01 AND x02 -> pbm
ntg OR kjc -> kwq
psh XOR fgs -> tgd
qhw XOR tgd -> z09
pbm OR djm -> kpj
x03 XOR y03 -> ffh
x00 XOR y04 -> ntg
bfw OR bqk -> z06
nrd XOR fgs -> wpb
frj XOR qhw -> z04
bqk OR frj -> z07
y03 OR x01 -> nrd
hwm AND bqk -> z03
tgd XOR rvg -> z12
tnw OR pbm -> gnj
`;

import fs from "fs";
import { bench } from "../../lib";
input = fs.readFileSync("input.txt", "utf-8");
bench(
  () => {
    part1(setup(input));
    // console.log(part1(setup(input)));
  },
  { runs: 1 }
);

// tried and failed
// 1482885350
// 1482885350
// 1482885350
// 1482897638 too low
// 52898283422934
53190357879014;
