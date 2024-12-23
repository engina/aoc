import fs from "fs";
import path from "path";
import "colors";
import { Command } from "@commander-js/extra-typings";

import colors from "colors";
import { bench, BenchOpts } from "./lib";
import aoc2325 from "./23/25/index";
import aoc2401 from "./24/01";
import aoc2402 from "./24/02";
import aoc2403 from "./24/03";
// import aoc2404 from "./24/04";
import aoc2406 from "./24/06";
import aoc2407 from "./24/07";
import aoc2408 from "./24/08";
import aoc2409 from "./24/09";
import aoc2410 from "./24/10";
import aoc2411 from "./24/11";
import aoc2412 from "./24/12";
import aoc2413 from "./24/13";
import aoc2414 from "./24/14";
import aoc2415 from "./24/15";
import aoc2417 from "./24/17";
import aoc2418 from "./24/18";
import aoc2419 from "./24/19";
import aoc2420 from "./24/20";
import aoc2422 from "./24/22";
import aoc2423 from "./24/23";

const days: Day<any>[] = [
  aoc2325,
  aoc2401,
  aoc2402,
  aoc2403,
  // aoc2404,
  // aoc2406,
  aoc2407,
  aoc2408,
  aoc2409,
  aoc2410,
  aoc2411,
  aoc2412,
  aoc2413,
  aoc2414,
  aoc2415,
  aoc2417,
  aoc2418,
  aoc2419,
  aoc2420,
  aoc2422,
  aoc2423,
];

const cmd = new Command()
  .name("e10n-ts-aoc")
  .description("Advent of Code solutions in TypeScript")
  .command("run")
  .description("Run a specific solution")
  .argument("[year]", "Year of the solution")
  .argument("[day]", "Day of the solution")
  .argument("[part]", "Part of the solution [0=all]", "0")
  .option("-r, --runs <runs>", "Number of runs")
  .option("-s, --show", "Show results", false)
  .option("-v, --verbose", "Verbose output", false)
  .action(async (year, day, part, opts) => {
    let y: number | undefined;
    let d: number | undefined;
    let runs = 10;
    let partSelected = 0;

    if (year) {
      y = parseInt(year, 10);
      if (isNaN(y)) {
        console.log("Invalid year", year);
        process.exit(1);
      }
      if (y > 2000) y -= 2000;

      if (y < 13) {
        console.log("Invalid year", year);
        process.exit(1);
      }
    }

    if (day) {
      d = parseInt(day, 10);
      if (isNaN(d) || d < 1 || d > 25) {
        console.log("Invalid day", day);
        process.exit(1);
      }
    }

    if (part) {
      partSelected = parseInt(part, 10);
      if (isNaN(partSelected)) {
        console.log("Invalid part", part);
        process.exit(1);
      }
      partSelected -= 1;
    }

    if (opts.runs) {
      runs = parseInt(opts.runs, 10);
      if (isNaN(runs)) {
        console.log("Invalid runs", runs);
        process.exit(1);
      }
    }

    if (opts.verbose) {
      console.log(
        `🚀 Running ${year}${day ? `/${day}` : ""} with ${runs} runs\n`
      );
    }

    const runnerOpts: BenchOpts<any> = {
      runs,
      disablePrint: true,
    };

    const f = Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
    const daysFiltered = days.filter(
      (day) => (!y || day.year === y) && (!d || day.day === d)
    );

    if (!daysFiltered.length) {
      console.log(`No solutions found for ${year}${day ? `/${day}` : ""}`);
      process.exit(1);
    }

    const started = performance.now();
    const avgs: number[] = [];
    for (const d of daysFiltered) {
      const { year, day, name, parts, setup } = d;
      const input = path.join(
        ".",
        year.toString().padStart(2, "0"),
        day.toString().padStart(2, "0"),
        "input.txt"
      );
      const inputStr = fs.readFileSync(input, "utf-8");
      console.log(`📅 ${year}/${day}, ${name}`.bold);

      for (let i = 0; i < parts.length; i++) {
        if (i !== partSelected && partSelected !== -1) continue;

        const part = parts[i];
        const { name, runner } = part;

        const benchResult = await bench((i) => runner(i), {
          ...runnerOpts,
          progress: (i) => {
            process.stdout.write(".");
          },
          setup: setup ? () => setup(inputStr, i + 1) : () => inputStr,
        });

        process.stdout.write("\b".repeat(runs));

        let result = `Part ${name ?? i + 1}`;

        const assertAllSame = benchResult.results.every(
          (r) => r.result === benchResult.results[0].result
        );

        avgs.push(benchResult.avg);
        if (!assertAllSame) {
          result += " Results are not the same across all runs";
          result = result.red;
        } else {
          let actual = benchResult.results[0].result;
          const pass = actual === part.expected;
          const expected = opts.show
            ? part.expected
            : part.expected.replaceAll(/./g, "*");
          actual = opts.show ? actual : actual.replaceAll(/./g, "*");
          if (pass) {
            result += " PASS: ";
            result = result.green;
            result += actual;
          } else {
            result += ` FAIL: ${actual} (expected ${expected})`;
            result = result.red;
          }

          const time = (
            t: number,
            opts: {
              color?: (t: number) => colors.Color;
              prefix?: (t: number) => string;
              suffix?: (t: number) => string;
            } = {}
          ) => {
            const { color = () => colors.white, prefix, suffix } = opts;
            const c = color(t);
            let str = prefix ? prefix(t) : "";
            if (t < 1) {
              // us
              str += c(f.format(t * 1000)) + "μs".green;
            } else if (t < 1000) {
              // ms
              str += c(f.format(t)) + "ms".blue;
            } else {
              // s
              str += c(f.format(t / 1000)) + "s".red;
            }
            str += suffix ? suffix(t) : "";
            return str;
          };

          result +=
            ` (`.dim +
            `${
              time(benchResult.avg, {
                prefix: (t) =>
                  t < 0.1 ? "🚀" : t < 1 ? "🔥" : t > 1000 ? "🤮" : "",
              }).underline
            }` +
            ` ${time(benchResult.results[0].setup)}` +
            `) `.dim;
        }
        console.log(result);
      }
      console.log();
    }
    const elapsed = performance.now() - started;
    console.log(
      // `+--------------------------------+\n| `.dim +
      `(`.dim +
        `${"[🔥|🚀|]Run"}` +
        `<`.underline +
        `μs`.green +
        "|" +
        `ms`.blue +
        `>` +
        ` Parse` +
        `<` +
        `μs`.green +
        "|" +
        `ms`.blue +
        `>` +
        `)
🚀 = < 100μs, 🔥 = < 1ms

Total run duration: ${f.format(avgs.reduce((acc, v) => acc + v, 0) / 1000)}s
`.dim
    );
  });

cmd.parse();

export type Runner<T> = (input: T) => string;

export type Day<S> = {
  year: number; // 23, 24, 25
  day: number; // 1-25
  name: string;
  // part is 1-indexed
  setup?: (input: string, part?: number) => S;
  parts: {
    name?: string;
    runner: Runner<S>;
    expected: string;
  }[];
};
