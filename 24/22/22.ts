import { bench } from "../../lib";
import { threads, init } from "../../lib/threads";

// init();

export function setup(input: string) {
  return input.trim().split("\n").map(Number);
}

export type Input = ReturnType<typeof setup>;

function forward(secret: number) {
  let result = secret >>> 0;
  result = (result ^ (result << 6)) & 0xffffff;
  result = (result ^ (result >> 5)) & 0xffffff;
  result = (result ^ (result << 11)) & 0xffffff;
  return result;
}

function run(
  secret: number,
  iterations: number
): [number, number | undefined][] {
  let next = secret;
  let result: [number, number | undefined][] = [[3, undefined]];
  for (let i = 0; i < iterations; i++) {
    next = forward(next);
    result.push([next % 10, (next % 10) - result[result.length - 1][0]]);
  }
  return result;
}

const seen = new Uint32Array(111150);

function stats(input: [number, number | undefined][]): [number, number][] {
  seen.fill(0);
  const stats: [number, number][] = [];

  for (let i = 4; i < input.length; i++) {
    const [buying, change] = input[i];
    const [, chm1] = input[i - 1]; // change minus 1
    const [, chm2] = input[i - 2];
    const [, chm3] = input[i - 3];
    const k0 = change! + 9;
    const k1 = chm1! + 9;
    const k2 = chm2! + 9;
    const k3 = chm3! + 9;
    const k = k0 + k1 * 18 + k2 * 18 ** 2 + k3 * 18 ** 3;
    // only include first pattern as our monkey will only buy once
    // and move to next buyer
    if (seen[k]) {
      continue;
    }
    seen[k] = 1;
    stats.push([k, buying]);
  }
  return stats;
}

export async function part1(secrets: Input) {
  let sum = 0;
  for (const secret of secrets) {
    let next = secret;
    for (let i = 0; i < 2000; i++) {
      next = forward(next);
    }
    sum += next;
  }
  return sum.toString();
}

const patterns = new Uint32Array(111150);

export async function part2(secrets: Input) {
  patterns.fill(0);
  // const sharedBuffer = new SharedArrayBuffer(
  //   Uint32Array.BYTES_PER_ELEMENT * secrets.length
  // );
  // const allStats = await threads(secrets, (s) => stats(run(s, 2000)), {
  //   n: 4,
  // });
  // console.log("allStats", allStats);
  const allStats = secrets.map((s) => stats(run(s, 2000)));
  for (let i = 0; i < allStats.length; i++) {
    const stats = allStats[i];
    for (const [pattern, offer] of stats) {
      patterns[pattern] += offer;
    }
  }
  const sorted = patterns.sort((a, b) => b - a);
  const bananas = sorted[0].toString();
  return bananas.toString();
}

// import fs from "fs";
// const input = fs.readFileSync("input.txt", "utf-8");
// bench(
//   async () => {
//     const r = await part2(setup(input));
//     console.log(r);
//   },
//   { runs: 1 }
// );

// export class SharedView {
//   constructor(secrets: number[]) {}
// }
