import fs from "fs";
import path from "path";
import "colors";
import { bench, BenchOpts } from "./lib";
import aoc2411 from "./24/11";
import aoc2412 from "./24/12";

export type Runner = (input: string) => string;

export type Day = {
  year: number;
  day: number;
  name: string;
  parts: {
    name?: string;
    runner: Runner;
    expected: string;
  }[];
};

const days: Day[] = [aoc2411, aoc2412];

const runnerOpts: BenchOpts = {
  runs: 5,
  disablePrint: true,
};

for (const d of days) {
  const { year, day, name, parts } = d;
  const input = path.join(
    __dirname,
    year.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
    "input.txt"
  );
  const inputStr = fs.readFileSync(input, "utf-8");
  console.log(`📅 ${year}/${day}, ${name}`);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const { name, runner, expected } = part;
    const benchResult = bench(() => runner(inputStr), runnerOpts);
    let result = `Part ${name ?? i + 1}`;

    const assertAllSame = benchResult.results.every(
      (r) => r.result === benchResult.results[0].result
    );

    if (!assertAllSame) {
      result += " Results are not the same across all runs";
      result = result.red;
    } else {
      const actual = benchResult.results[0].result;
      const pass = actual === expected;
      if (pass) {
        result += " PASS: ";
        result = result.green;
        result += actual;
      } else {
        result += ` FAIL: ${actual} (expected ${expected})`;
        result = result.red;
      }
      result += ` (${benchResult.avg.toFixed(2)}ms)`.dim;
    }
    console.log(result);
  }
}
