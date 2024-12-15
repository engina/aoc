import { Day } from "../../main";
import { part1, setup, PhysicalMinCut } from "./mincut/main";

export default {
  name: "Snowverload",
  year: 23,
  day: 25,
  setup,
  parts: [
    {
      runner: part1,
      expected: "583338",
    },
  ],
} as Day<PhysicalMinCut>;
