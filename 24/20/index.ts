import { Day } from "../../main";
import { setup, part1, part2, Input } from "./20";

export default {
  name: "Race Condition",
  year: 24,
  day: 20,
  setup,
  parts: [
    {
      runner: part1,
      expected: "1384",
    },
    {
      runner: part2,
      expected: "1008542",
    },
  ],
} as Day<Input>;
