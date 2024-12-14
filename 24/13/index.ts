import { Day } from "../../main";
import { parse, cost, Machine } from "./13";

export default {
  name: "Claw Contraption",
  year: 24,
  day: 13,
  setup: (input: string) => parse(input),
  parts: [
    {
      runner: (machines) => {
        return machines
          .map(cost)
          .filter((c) => c !== null)
          .reduce((a, b) => a + b, 0)
          .toString();
      },
      expected: "26005",
    },
    {
      runner: (machines) => {
        return machines
          .map((m) => ({
            ...m,
            prize: m.prize.clone().addScalar(10000000000000),
          }))
          .map(cost)
          .filter((c) => c !== null)
          .reduce((a, b) => a + b, 0)
          .toString();
      },
      expected: "105620095782547",
    },
  ],
} as Day<Machine[]>;
