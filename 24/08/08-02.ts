import "colors";
import colors from "colors";
import { combinations } from "../../lib";

// const input = `............
// ........0...
// .....0......
// .......0....
// ....0.......
// ......A.....
// ............
// ............
// ........A...
// .........A..
// ............
// ............
// `;

class Canvas {
  public readonly width: number;
  public readonly height: number;
  constructor(public readonly input: string[][]) {
    input.forEach((row) => {
      if (row.length !== input[0].length) {
        throw new Error("Invalid input");
      }
    });
    this.width = input[0].length;
    this.height = input.length;
  }

  clone() {
    const clone = new Canvas(structuredClone(this.input));
    return clone;
  }

  clear(ch = " ") {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.input[y][x] = ch;
      }
    }
    return this;
  }

  get(x: number, y: number) {
    return this.input[y][x];
  }

  set(x: number, y: number, value: string) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      // throw new Error("Out of bounds");
      return;
    }
    this.input[y][x] = value;
  }

  *iter(regex?: RegExp) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const ch = this.get(x, y);
        if (regex && !regex.test(ch)) continue;
        yield [x, y, ch] as [number, number, string];
      }
    }
  }

  print() {
    console.log(`+${"-".repeat(this.width)}+`);
    for (let y = 0; y < this.height; y++) {
      console.log(`|${this.input[y].join("")}|`);
    }
    console.log(`+${"-".repeat(this.width)}+`);
  }
}

class City {
  private antennaRegex = /[a-zA-Z]|\d/;
  private frequencySet = new Set<string>();
  private antennas: [string, Antenna][] = [];
  private antennaCanvas: Canvas;
  private antinodeCanvas: Canvas;
  public readonly width: number;
  public readonly height: number;

  constructor(public readonly input: string[][]) {
    this.width = input[0].length;
    this.height = input.length;

    this.antennaCanvas = new Canvas(input);
    this.antinodeCanvas = this.antennaCanvas.clone().clear();

    // find antennas
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = input[y][x];
        if (this.antennaRegex.test(cell)) {
          this.frequencySet.add(cell);
          this.antennas.push([cell, new Antenna(cell, new Vector(x, y))]);
        }
      }
    }
  }

  compute() {
    const uniqueFrequencies = Array.from(this.frequencySet);
    this.antinodeCanvas.clear();
    for (const freq of uniqueFrequencies) {
      const antennas = this.antennas
        .filter(([f, _]) => f === freq)
        .map(([_, a]) => a);
      for (const comb of combinations(antennas, 2)) {
        const [a1, a2] = comb;
        const antitodes = Antenna.antinodes(
          a1,
          a2,
          this.width * 2,
          this.height * 2
        );
        for (const a of antitodes) {
          this.antinodeCanvas.set(a.x, a.y, a1.freq);
        }
      }
      // if an antenna is not alone in his frequency range
      // it has an antinode on itself as well
      for (const a of antennas) {
        if (this.antennas.filter(([f, _]) => f === a.freq).length < 1) {
          continue;
        }
        this.antinodeCanvas.set(a.pos.x, a.pos.y, a.freq);
      }
    }

    const resultCanvas = this.antennaCanvas.clone().clear();
    let antinodeCount = 0;
    for (const [x, y] of this.antinodeCanvas.iter(this.antennaRegex)) {
      resultCanvas.set(x, y, "#".blue);
      antinodeCount++;
    }

    for (const [x, y, f] of this.antennaCanvas.iter(this.antennaRegex)) {
      const target = resultCanvas.get(x, y);
      let value = f;
      if (target !== " ") {
        value = colors.red(f);
      }
      resultCanvas.set(x, y, value);
    }
    //resultCanvas.print();
    return antinodeCount;
  }
}

class Antenna {
  constructor(public readonly freq: string, public readonly pos: Vector) {}

  static antinodes(
    a: Antenna,
    b: Antenna,
    width: number,
    height: number
  ): Vector[] {
    const result: Vector[] = [];
    // imagine A is at (1, 1) and B is at (2, 2)
    const d = a.pos.clone().sub(b.pos); // d = (-1, -1)
    const a1 = a.pos.clone();
    const a2 = b.pos.clone();
    while (true) {
      a1.add(d); // (0, 0)
      a2.sub(d); // (3, 3)
      const count = result.length;
      if (a1.isIn(width, height)) result.push(a1.clone());
      if (a2.isIn(width, height)) result.push(a2.clone());
      if (count === result.length) {
        break;
      }
    }
    return result;
  }
}

class Vector {
  constructor(public x: number, public y: number) {}

  add(v: Vector) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  isIn(width: number, height: number) {
    return this.x >= 0 && this.x < width && this.y >= 0 && this.y < height;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

export function run(parsed: string[][]) {
  const city = new City(parsed);
  const result = city.compute();
  return result.toString();
}
