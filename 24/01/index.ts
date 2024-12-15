import { Day } from "../../main";
import { part1, part2 } from "./01";

export default {
  name: "Historian Hysteria",
  year: 24,
  day: 1,
  setup: (input: string) => {
    const a: number[] = [];
    const b: number[] = [];
    input.split("\n").forEach((line) => {
      // /(\d+)\s+\(d+)/

      const [aa, bb] = line
        .trim()
        .split("   ")
        .map((x) => parseInt(x.trim()));
      if (isNaN(aa) || isNaN(bb)) {
        return;
      }
      a.push(aa);
      b.push(bb);
    });
    return [a, b];
  },
  parts: [
    {
      runner: part1,
      expected: "1970720",
    },
    {
      runner: part2,
      expected: "17191599",
    },
  ],
} as Day<[number[], number[]]>;
