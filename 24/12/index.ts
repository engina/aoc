import { Day } from "../../main";
import { parse, study } from "./12";

export default {
  name: "Garden Groups",
  year: 24,
  day: 12,
  parts: [
    {
      runner: (input: string) => {
        let { groups, grid } = parse(input);
        let costs = groups.map(study).map((r) => r.area * r.perimeter);
        return costs.reduce((acc, c) => acc + c, 0).toString();
      },
      expected: "1421958",
    },
    {
      runner: (input: string) => {
        let { groups, grid } = parse(input);
        let costs = groups.map(study).map((r) => r.area * r.sides);
        return costs.reduce((acc, c) => acc + c, 0).toString();
      },
      expected: "822173",
    },
  ],
} as Day;
