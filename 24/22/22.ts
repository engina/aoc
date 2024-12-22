let input = ``;

input = `1
10
100
2024
`;

import fs from "fs";
import { bench } from "../../lib";
input = fs.readFileSync("input.txt", "utf-8");

export function setup(input: string) {
  return input.trim().split("\n").map(Number);
}

export type Input = ReturnType<typeof setup>;

function mix(input: number, secret: number) {
  return (input >>> 0) ^ (secret >>> 0);
}

function unsignedmod(input: number, mod: number) {
  return ((input % mod) + mod) % mod;
}

function prune(input: number) {
  return unsignedmod(input, 16777216);
}

function forward(secret: number) {
  let result = secret;
  result = prune(mix(result, result * 64));
  result = prune(mix(result, Math.floor(result / 32)));
  result = prune(mix(result, result * 2048));
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

function stats(input: [number, number | undefined][]): [string, number][] {
  // [pattern, offer][]
  const stats: [string, number][] = [];
  const set = new Set<string>();
  for (let i = 4; i < input.length; i++) {
    const [buying, change] = input[i];
    const [, chm1] = input[i - 1]; // change minus 1
    const [, chm2] = input[i - 2];
    const [, chm3] = input[i - 3];
    const streak = [chm3, chm2, chm1, change].join(",");
    if (set.has(streak)) {
      continue;
    }
    set.add(streak);
    stats.push([streak, buying]);
  }
  return stats;
}

export function part1(secrets: Input) {
  let sum = 0;
  for (const secret of secrets) {
    let next = secret;
    for (let i = 0; i < 2000; i++) {
      next = forward(next);
    }
    sum += next;
    // console.log(next);
  }
  return sum.toString();
}

export function part2(secrets: Input) {
  const allStats = secrets.map((s) => stats(run(s, 2000)));
  const patterns: Record<string, number> = {};
  for (let i = 0; i < allStats.length; i++) {
    const stats = allStats[i];
    for (const [pattern, offer] of stats) {
      if (patterns[pattern] === undefined) {
        patterns[pattern] = 0;
      }
      patterns[pattern] += offer;
    }
  }
  const sorted = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
  const bananas = sorted[0][1].toString();
  return bananas.toString();
}

bench(
  () => {
    console.log(part2(setup(input)));
  },
  { runs: 10 }
);
