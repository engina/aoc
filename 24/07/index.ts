import { parseArr, parseDict, Transformers } from "../../lib/parse";
import { Day } from "../../main";
import { run as run1 } from "./07";
import { run as run2 } from "./07-02";

export default {
  name: "Bridge Repair",
  year: 24,
  day: 7,
  setup: (input: string) =>
    parseDict(input, Transformers.number, Transformers.number),
  parts: [
    {
      runner: (input) => {
        return run1(input);
      },
      expected: "4122618559853",
    },
    {
      runner: (input) => {
        return run2(input).toString();
      },
      expected: "227615740238334",
    },
  ],
} as Day<[number, number[]][]>;
