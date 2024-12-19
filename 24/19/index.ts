import { Day } from "../../main";
import { setup, part1, part2, Input } from "./19";

export default {
  name: "Linen Layout",
  year: 24,
  day: 19,
  setup,
  parts: [
    {
      runner: part1,
      expected: "355",
    },
    {
      runner: part2,
      expected: "732978410442050",
    },
  ],
} as Day<Input>;
