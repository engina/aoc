export function* combinations<T>(arr: T[], N: number) {
  const indexes = Array.from({ length: N }, (_, i) => i);
  while (true) {
    const result = indexes.map((i) => arr[i]);
    yield result;
    let i = N - 1;
    while (i >= 0 && indexes[i] === arr.length - N + i) {
      i--;
    }
    if (i < 0) {
      break;
    }
    indexes[i]++;
    for (let j = i + 1; j < N; j++) {
      indexes[j] = indexes[i] + j - i;
    }
  }
}

// permutation generator
// can handle where arr.length < N
export function* permutations<T>(arr: T[], N: number) {
  let i = 0;
  let end = arr.length ** N;
  while (i < end) {
    const result = Array.from({ length: N }, (_, j) => {
      const index = Math.floor(i / arr.length ** j) % arr.length;
      return arr[index];
    });
    yield result;
    i++;
  }
}

// create a unique element from an array filter
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function* genRange(start, end, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

export function range(start, end, step = 1) {
  const forEach = (fn) => {
    for (const i of genRange(start, end, step)) {
      fn(i);
    }
    return this;
  };

  const map = <T>(fn: (...args: any[]) => T) => {
    const result: T[] = [];
    for (const i of genRange(start, end, step)) {
      result.push(fn(i));
    }

    return result;
  };
  return { forEach, map };
}

import "colors";
import { MinHeap } from "./min-heap";
import { LinkedList } from "./linked-list";
export type BenchOpts<F> = {
  label?: string;
  disablePrint?: boolean;
  runs?: number;
  discard?: number;
  setup?: () => F; // for generating input to benchmark runner, this is excluded from benchmark time
  progress?: (i: number) => void;
};

export const bench = <R, F>(
  fn: (input: F | undefined) => R,
  opts: BenchOpts<F> = {}
) => {
  const { label = "Bench", disablePrint = false, setup, progress } = opts;

  function run() {
    const setupStart = performance.now();
    const input = setup?.();
    const setupElapsed = performance.now() - setupStart;
    const start = performance.now();
    const result = fn(input);
    const elapsed = performance.now() - start;
    return { result, elapsed, setup: setupElapsed };
  }

  let runs = opts.runs ?? 10;

  if (runs < 1) runs = 1;

  let discard = opts.discard;

  if (discard === undefined) discard = Math.floor(runs / 4);

  if (runs - discard * 2 < 2) discard = 0;

  let progressCounter = 0;

  const results = range(0, runs)
    .map(() => {
      const r = run();
      progress?.(progressCounter++);
      return r;
    })
    .sort((a, b) => b.elapsed - a.elapsed);

  process.stdout.write("\b".repeat(runs));
  const max = results[0].elapsed;
  const min = results[runs - 1].elapsed;
  const avg =
    results
      .slice(discard, discard ? -discard : results.length)
      .reduce((acc, { elapsed }) => acc + elapsed, 0) /
    (results.length - discard * 2);
  if (!disablePrint) {
    console.log(
      `[${label ?? "Bench"}]`.gray +
        ` Avg: ${(avg.toFixed(2) + "ms").green} Max: ${
          (max.toFixed(2) + "ms").red
        } Min: ${(min.toFixed(2) + "ms").blue} Runs: ${
          runs.toString().magenta
        } Discard top/bottom: ${discard.toString().yellow}`
    );
  }
  return {
    results,
    avg,
    max,
    min,
  };
};

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function dijkstra<T extends { prev: T | undefined; distance: number }>(
  start: T | T[],
  all: T[],
  distance: (s: T, d: T) => number,
  edges: (s: T) => T[],
  goals?: Set<T>
) {
  const starts = Array.isArray(start) ? start : [start];
  const queue: T[] = [...starts, ...all];
  starts.forEach((s) => (s.distance = 0));
  while (queue.length) {
    const u = queue.shift();
    if (!u) continue;

    if (goals?.has(u)) {
      return u;
    }

    const neighbors = edges(u);

    for (const neighbor of neighbors) {
      if (!neighbor) continue;
      const ni = queue.indexOf(neighbor);
      if (ni === -1) continue;
      const d = distance(u, neighbor);
      if (d < neighbor.distance) {
        neighbor.distance = d;
        queue.sort((a, b) => a.distance - b.distance);
        neighbor.prev = u;
      }
    }
  }
}

// dijkstra with priority queue
// user must set distance and prev values beforehand
export function dijkstraPQ<
  T extends { prev: T | undefined; distance: number; index: number }
>(
  start: T | T[],
  all: T[],
  distance: (s: T, d: T) => number,
  edges: (s: T) => T[],
  goals?: Set<T>
) {
  const queue = LinkedList.fromArray(
    [...all],
    (a, b) => a.distance - b.distance
  );

  while (queue.head) {
    const u = queue.shift();
    if (!u) continue;
    if (goals?.has(u.value)) {
      return u.value;
    }

    const neighbors = edges(u.value);
    for (const neighbor of neighbors) {
      if (!neighbor) continue;
      if (!queue.has(neighbor)) continue;
      const d = distance(u.value, neighbor);
      if (d < neighbor.distance) {
        queue.remove(neighbor);
        neighbor.distance = d;
        queue.pushSorted(neighbor);
        neighbor.prev = u.value;
      }
    }
  }
}

// Breadth-first search
// 1  procedure BFS(G, root) is
// 2      let Q be a queue
// 3      label root as explored
// 4      Q.enqueue(root)
// 5      while Q is not empty do
// 6          v := Q.dequeue()
// 7          if v is the goal then
// 8              return v
// 9          for all edges from v to w in G.adjacentEdges(v) do
// 10              if w is not labeled as explored then
// 11                  label w as explored
// 12                  w.parent := v
// 13                  Q.enqueue(w)
export function bfs<T extends { explored: boolean; prev?: T }>(
  start: T | T[],
  goal: (s: T) => boolean,
  edges: (s: T) => T[]
) {
  const starts = Array.isArray(start) ? start : [start];
  const queue: [T, number][] = starts.map((s) => [s, 0]);
  starts.forEach((s) => (s.explored = true));

  while (queue.length) {
    const [u, cost] = queue.shift()!;
    if (!u) continue;
    if (goal(u)) {
      return { goal: u, cost };
    }

    const neighbors = edges(u);

    for (const neighbor of neighbors) {
      if (!neighbor || neighbor.explored) continue;
      neighbor.explored = true;
      neighbor.prev = u;
      queue.push([neighbor, cost + 1]);
    }
  }
}

export function binarySearch<T>(
  arr: T[],
  target: T,
  compare: (a: T, b: T) => number
): number {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const cmp = compare(arr[mid], target);
    if (cmp === 0) {
      return mid;
    } else if (cmp < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}
