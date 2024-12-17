import { Day } from "../../main";
import { part1 } from "./03";
import { part2 } from "./03-2";

export default {
  name: "Mull It Over",
  year: 24,
  day: 3,
  parts: [
    {
      runner: part1,
      expected: "159892596",
    },
    {
      runner: part2,
      expected: "92626942",
    },
  ],
} as Day<string>;
