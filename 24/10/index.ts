import { parseArr } from "../../lib/parse";
import { Day } from "../../main";
import { run } from "./10";

export default {
  name: "Hoof It",
  year: 24,
  day: 10,
  setup: (input: string) => parseArr(input),
  parts: [
    {
      runner: (input) => {
        return run(input).summits.toString();
      },
      expected: "587",
    },
    {
      runner: (input) => {
        return run(input).totalTrails.toString();
      },
      expected: "1340",
    },
  ],
} as Day<string[][]>;
