import { Vector2 } from "../../lib/grid";

const WIDTH = 101;
const HEIGHT = 103;

export type Robot = {
  position: Vector2;
  velocity: Vector2;
};

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
      // show quadrants
      if (x === Math.floor(WIDTH / 2) && y === Math.floor(HEIGHT / 2)) {
        row += "+";
        continue;
      }
      if (x === Math.floor(WIDTH / 2)) {
        row += "|";
        continue;
      }
      if (y === Math.floor(HEIGHT / 2)) {
        row += "-";
        continue;
      }
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

export function run2(
  robots: Robot[],
  duration: number,
  width: number,
  height: number
) {
  // printGrid(robots.map(({ position }) => position));
  let thunkMax = 0;
  const center = Math.floor(width / 2);
  const sqr = 30;
  for (let i = 0; i < 100000; i++) {
    const robotsMoved = robots.map((r) => move(r, i));
    const thunk = robotsMoved.filter(
      (v) => Math.abs(v.x - center) < sqr && Math.abs(v.y - center) < sqr
    ).length;
    if (thunk > thunkMax) {
      thunkMax = thunk;
    }

    if (thunk > 300) {
      return i.toString();
    }
  }
  return "";
}
