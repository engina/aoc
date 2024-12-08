import fs from "fs";
import { parse, ParseResult } from "./parse";
import inputFile from "../25-input.txt?raw";

const input1 = inputFile; //fs.readFileSync("25-input.txt", "utf-8");

const input2 = `jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr
`;

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
const input3 = `b1: a1 a2 a3 c1
b2: a4 a5 a6 c2
b3: a7 a8 a9 c3
c1: d1 d2 d3
c2: d4 d5 d6
c3: d7 d8 d9
d3: d4
d6: d7
`;

const input4 = `a1: a2
a2: a3
a3: a4
`;

export const SampleInputs = [input1, input2, input3, input4];

export const SampleParsedData: ParseResult[] = SampleInputs.map((input) =>
  parse(input)
);
