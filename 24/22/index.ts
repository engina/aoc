import { Day } from "../../main";
import { setup, part1, part2, Input } from "./22";

export default {
  name: "Monkey Market",
  year: 24,
  day: 22,
  setup,
  parts: [
    {
      runner: part1,
      expected: "13584398738",
    },
    {
      runner: part2,
      expected: "1612",
    },
  ],
} as Day<Input>;
