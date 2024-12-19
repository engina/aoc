import { parseDict, Transformers } from "../../lib/parse";
import { Day } from "../../main";
import { part1, part2 } from "./07-02";

export default {
  name: "Bridge Repair",
  year: 24,
  day: 7,
  setup: (input: string) =>
    parseDict(input, Transformers.number, Transformers.number),
  parts: [
    {
      runner: part1,
      expected: "4122618559853",
    },
    {
      runner: part2,
      expected: "227615740238334",
    },
  ],
} as Day<[number, number[]][]>;
