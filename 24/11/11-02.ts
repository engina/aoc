import fs from "fs";
import { amemo, FileCacheStore } from "amemo";
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

function walk(input: string, iterations = 6) {
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
    sum += cachedWalk(g, iterations - 1);
  }

  return sum;
}

// Instead of a custom cache implementation, I'll just use a memoization
// library that I wrote

// Current FileCacheStore implementation is synchronous, so it's slow by
// itself. I'll disable autoSave and save the cache at the end of the
const cacheStore = new FileCacheStore({
  autoSave: false,
});

const cachedWalk = amemo(walk, {
  cacheStore,
});

process.on("exit", () => {
  console.log("Saving cache");
  cacheStore.save();
});

function run(input: string, load = 1) {
  return input
    .trim()
    .split(" ")
    .map((stone) => cachedWalk(stone, load))
    .reduce((acc, curr) => acc + curr, 0);
}

function main(inputPath: string = "input.txt", load = 1) {
  const input = fs.readFileSync(inputPath, "utf-8");
  bench(() => {
    const result = run(input, load);
    // print this humongous number as a string without scientific notation
    const resultBI = BigInt(result);
    console.log(resultBI.toString());
  }, "walk");
}

main(process.argv[2], 25);
main(process.argv[2], 75);
