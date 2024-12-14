import { parseArr } from "../../lib/parse";
import { Day } from "../../main";
import { run as run1 } from "./09";
import { run as run2 } from "./09-02";

export default {
  name: "Disk Fragmenter",
  year: 24,
  day: 9,
  parts: [
    {
      runner: (input) => {
        return run1(input).toString();
      },
      expected: "6242766523059",
    },
    {
      runner: (input) => {
        return run2(input).toString();
      },
      expected: "6272188244509",
    },
  ],
} as Day<string>;
