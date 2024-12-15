import { Day } from "../../main";
import { Grid, run as run1 } from "./06";
import { run as run2 } from "./04";

export default {
  name: "Ceres Search",
  year: 24,
  day: 4,
  setup: (input: string) =>
    input
      .split("\n")
      .filter(Boolean)
      .map((l) => l.split("")),
  parts: [
    {
      runner: (input) => {
        return run1(input);
      },
      expected: "2496",
    },
    {
      runner: (input) => {
        return "";
      },
      expected: "1967",
    },
  ],
} as Day<Grid>;
