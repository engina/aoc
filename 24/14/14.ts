import { Vector2 } from "../../lib/grid";
import fs from "fs";
const input = fs.readFileSync(__dirname + "/input.txt", "utf-8");
const WIDTH = 101;
const HEIGHT = 103;

// const input = `p=0,4 v=3,-3
// p=6,3 v=-1,-3
// p=10,3 v=-1,2
// p=2,0 v=2,-1
// p=0,0 v=1,3
// p=3,0 v=-2,-2
// p=7,6 v=-1,-3
// p=3,0 v=-1,-2
// p=9,3 v=2,3
// p=7,3 v=-1,2
// p=2,4 v=2,-3
// p=9,5 v=-3,-3
// `;
// const WIDTH = 11;
// const HEIGHT = 7;

export type Robot = {
  position: Vector2;
  velocity: Vector2;
};

const parsed: Robot[] = input
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [p, v] = line.split(" ");
    const [px, py] = p.slice(2).split(",").map(Number);
    const [vx, vy] = v.slice(2).split(",").map(Number);
    return { position: new Vector2(px, py), velocity: new Vector2(vx, vy) };
  });

const duration = 100;

function mod(n, m) {
  return ((n % m) + m) % m;
}

function stripRobotsFromAxes(m: Vector2, width = WIDTH, height = HEIGHT) {
  return (m) => m.x !== Math.floor(width / 2) && m.y !== Math.floor(height / 2);
}

function quadrantCount(positions: Vector2[], width: number, height: number) {
  const center = new Vector2(Math.floor(width / 2), Math.floor(height / 2));
  // N E S W
  const quadrants: [number, number, number, number] = [0, 0, 0, 0];
  for (const p of positions) {
    if (p.x < center.x && p.y < center.y) {
      quadrants[0]++;
    }
    if (p.x > center.x && p.y < center.y) {
      quadrants[1]++;
    }
    if (p.x > center.x && p.y > center.y) {
      quadrants[2]++;
    }
    if (p.x < center.x && p.y > center.y) {
      quadrants[3]++;
    }
  }
  return quadrants;
}

function printGrid(moved: Vector2[]) {
  for (let y = 0; y < HEIGHT; y++) {
    let row = "";
    for (let x = 0; x < WIDTH; x++) {
      const found = moved.filter((m) => m.x === x && m.y === y);
      row += found.length > 0 ? found.length.toString() : ".";
    }
    console.log(row);
  }
}

function move(robot: Robot, duration: number) {
  const newPosition = robot.position
    .clone()
    .add(robot.velocity.clone().mulScalar(duration));
  newPosition.x = mod(newPosition.x, WIDTH);
  newPosition.y = mod(newPosition.y, HEIGHT);
  return newPosition;
}

export function run(
  robots: Robot[],
  duration: number,
  width: number,
  height: number
) {
  // printGrid(robots.map(({ position }) => position));
  const robotsMoved = robots
    .map((r) => move(r, duration))
    .filter(stripRobotsFromAxes);
  const quadrants = quadrantCount(robotsMoved, width, height);
  return quadrants.reduce((acc, q) => acc * q, 1).toString();
}
