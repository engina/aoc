import { Day } from "../../main";
import { Grid, run as run1 } from "./06";
import { run as run2 } from "./06-02";

export default {
  name: "Guard Gallivant",
  year: 24,
  day: 6,
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
      expected: "4580",
    },
    {
      runner: (input) => {
        return "";
        ("");
      },
      expected: "1480",
    },
  ],
} as Day<Grid>;
