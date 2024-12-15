import { Vector2 } from "../../lib/grid";
import { Day } from "../../main";
import { Robot, run, run2 } from "./14";

export default {
  name: "Restroom Redoubt",
  year: 24,
  day: 14,
  setup: (input) =>
    input
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [p, v] = line.split(" ");
        const [px, py] = p.slice(2).split(",").map(Number);
        const [vx, vy] = v.slice(2).split(",").map(Number);
        return { position: new Vector2(px, py), velocity: new Vector2(vx, vy) };
      }),
  parts: [
    {
      runner: (robots) => {
        return run(robots, 100, 101, 103);
      },
      expected: "231782040",
    },
    {
      runner: (robots) => {
        return run2(robots, 100, 101, 103);
      },
      expected: "6475",
    },
  ],
} as Day<Robot[]>;
