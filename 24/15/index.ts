import { Day } from "../../main";
import { setup, part1, part2, Input } from "./15";

export default {
  name: "Warehouse Woes",
  year: 24,
  day: 15,
  setup,
  parts: [
    {
      runner: part1,
      expected: "1538871",
    },
    {
      runner: part2,
      expected: "1543338",
    },
  ],
} as Day<Input>;
