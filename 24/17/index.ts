import { Day } from "../../main";
import { setup, part1, Input } from "./17";

export default {
  name: "Chronospatial Computer",
  year: 24,
  day: 17,
  setup,
  parts: [
    {
      runner: part1,
      expected: "7,4,2,5,1,4,6,0,4",
    },
  ],
} as Day<Input>;
