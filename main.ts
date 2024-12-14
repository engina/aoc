import fs from "fs";
import path from "path";
import "colors";
import colors from "colors";
import { bench, BenchOpts } from "./lib";
import aoc2406 from "./24/06";
import aoc2407 from "./24/07";
import aoc2408 from "./24/08";
import aoc2409 from "./24/09";
import aoc2410 from "./24/10";
import aoc2411 from "./24/11";
import aoc2412 from "./24/12";
import aoc2413 from "./24/13";
import aoc2414 from "./24/14";

export type Runner<T> = (input: T) => string;

export type Day<S> = {
  year: number;
  day: number;
  name: string;
  setup?: (input: string) => S;
  parts: {
    name?: string;
    runner: Runner<S>;
    expected: string;
  }[];
};

const days: Day<any>[] = [
  // aoc2406,
  // aoc2407,
  aoc2408,
  aoc2409,
  aoc2410,
  aoc2411,
  aoc2412,
  aoc2413,
  aoc2414,
];

const runnerOpts: BenchOpts = {
  runs: 5,
  disablePrint: true,
};

const f = Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

for (const d of days) {
  const { year, day, name, parts, setup } = d;
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
    const s = bench(() => (setup ? setup(inputStr) : inputStr), {
      disablePrint: true,
      runs: 1,
    });
    const benchResult = bench(() => runner(s.results[0].result), runnerOpts);
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
        result += actual; //.replaceAll(/./g, "*");
      } else {
        result += ` FAIL: ${actual} (expected ${expected})`;
        result = result.red;
      }

      const time = (
        t: number,
        opts: {
          color?: colors.Color;
          prefix?: (t: number) => string;
          suffix?: (t: number) => string;
        } = {}
      ) => {
        const { color = colors.white, prefix, suffix } = opts;
        let str = prefix ? prefix(t) : "";
        if (t < 1) {
          // us
          str += color(f.format(t * 1000)) + "μs".green;
        } else if (t < 1000) {
          // ms
          str += color(f.format(t)) + "ms".blue;
        } else {
          // s
          str += color(f.format(t / 1000)) + "s".red;
        }
        str += suffix ? suffix(t) : "";
        return str;
      };

      result +=
        ` (`.dim +
        `${
          time(benchResult.avg, {
            prefix: (t) => (t < 0.1 ? "🔥" : ""),
          }).underline
        }` +
        ` ${time(s.avg)}` +
        `) `.dim;
    }
    console.log(result);
  }
  console.log();
}

console.log(
  `+-------------------------------+\n| `.dim +
    `(`.dim +
    `${"[🔥]Run".underline}` +
    `<`.underline +
    `μs`.green.underline +
    "|".underline +
    `ms`.blue.underline +
    `>`.underline +
    ` Setup` +
    `<` +
    `μs`.green +
    "|" +
    `ms`.blue +
    `>` +
    `) | (🔥 = < 100μs )
+-------------------------------+
`.dim
);
