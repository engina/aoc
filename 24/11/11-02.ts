import fs from "fs";
import { bench } from "../../lib";

type Rule = {
  applies: (n: string) => boolean;
  transform: (n: string) => string[];
};

const rules: Rule[] = [
  {
    applies: (n) => n === "0",
    transform: (n) => {
      return ["1"];
    },
  },
  {
    applies: (n) => n.length % 2 === 0,
    transform: (n) => {
      const left = n.slice(0, n.length / 2);
      const right = parseInt(n.slice(n.length / 2), 10).toString();
      return [left, right];
    },
  },
  {
    applies: (n) => true,
    transform: (n) => {
      return [(parseInt(n, 10) * 2024).toString()];
    },
  },
];

const cache: Record<string, number> = {};

// walks a single stone through the rules for a given number of iterations
// returns the number of end stones
function walk(input: string, iterations) {
  const key = `${input}:${iterations}`;
  if (key in cache) {
    return cache[key];
  }

  if (iterations === 0) {
    // no more iterations, just return 1, as this is the single end stone of this path
    return 1;
  }

  const generated = rules.find((r) => r.applies(input))?.transform(input);
  if (!generated) {
    throw new Error(`No rule found for ${input}`);
  }

  let sum = 0;

  for (const g of generated) {
    sum += walk(g, iterations - 1);
  }

  cache[key] = sum;
  return sum;
}

function run(input: string, load = 1) {
  return input
    .trim()
    .split(" ")
    .map((stone) => walk(stone, load))
    .reduce((acc, curr) => acc + curr, 0);
}

function part1(input: string) {
  return run(input, 25);
}

function part2(input: string) {
  return run(input, 75);
}

function main(inputPath = "input.txt") {
  const input = fs.readFileSync(inputPath, "utf-8");
  bench(() => console.log("part1: ", part1(input)), "part1");
  bench(() => console.log("part2: ", part2(input)), "part2");
}

main(process.argv[2]);
