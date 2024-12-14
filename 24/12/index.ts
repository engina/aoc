import { Day } from "../../main";
import { parse, study } from "./12";

export default {
  name: "Garden Groups",
  year: 24,
  day: 12,
  setup: (input: string) => parse(input),
  parts: [
    {
      runner: (parsed) => {
        let { groups } = parsed;
        let costs = groups.map(study).map((r) => r.area * r.perimeter);
        return costs.reduce((acc, c) => acc + c, 0).toString();
      },
      expected: "1421958",
    },
    {
      runner: (parsed) => {
        let { groups } = parsed;
        let costs = groups.map(study).map((r) => r.area * r.sides);
        return costs.reduce((acc, c) => acc + c, 0).toString();
      },
      expected: "822173",
    },
  ],
} as Day<ReturnType<typeof parse>>;
