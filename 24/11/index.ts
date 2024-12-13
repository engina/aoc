import { Day } from "../../main";
import { run } from "./11-02";

export default {
  name: "Plutonian Pebbles",
  year: 24,
  day: 11,
  parts: [
    {
      runner: (input: string) => {
        return run(input, 25).toString();
      },
      expected: "218956",
    },
    {
      runner: (input: string) => {
        return run(input, 75).toString();
      },
      expected: "259593838049805",
    },
  ],
} as Day;
