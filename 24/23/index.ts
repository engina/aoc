import { Day } from "../../main";
import { setup, part1, part2, Input } from "./23";

export default {
  name: "LAN Party",
  year: 24,
  day: 23,
  setup,
  parts: [
    {
      runner: part1,
      expected: "1238",
    },
    {
      runner: part2,
      expected: "bg,bl,ch,fn,fv,gd,jn,kk,lk,pv,rr,tb,vw",
    },
  ],
} as Day<Input>;
