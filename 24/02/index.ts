import { Day } from "../../main";
import { part1 } from "./02";
import { part2 } from "./02-2";

export default {
  name: "HRed-Nosed Reports",
  year: 24,
  day: 2,
  setup: (input: string) =>
    input
      .trim()
      .split("\n")
      .map((line) => line.split(" ").map((x) => parseInt(x, 10))),
  parts: [
    {
      runner: part1,
      expected: "218",
    },
    {
      runner: part2,
      expected: "290",
    },
  ],
} as Day<number[][]>;
