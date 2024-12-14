import { parseArr } from "../../lib/parse";
import { Day } from "../../main";
import { run as run1 } from "./08";
import { run as run2 } from "./08-02";

export default {
  name: "Resonant Collinearity",
  year: 24,
  day: 8,
  setup: (input: string) => parseArr(input),
  parts: [
    {
      runner: (input) => {
        return run1(input);
      },
      expected: "359",
    },
    {
      runner: (input) => {
        return run2(input).toString();
      },
      expected: "1293",
    },
  ],
} as Day<string[][]>;
