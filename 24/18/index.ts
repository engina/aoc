import { Day } from "../../main";
import { setup, part1, part2, Input } from "./18";

export default {
  name: "RAM Run",
  year: 24,
  day: 18,
  setup,
  parts: [
    {
      runner: part1,
      expected: "370",
    },
    {
      runner: part2,
      expected: "65,6",
    },
  ],
} as Day<Input>;
