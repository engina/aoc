import * as React from "react";
import input from "../../input.txt?raw";

// import {} from "../../04";

const CELL_SIZE = 10;
const fontSize = "7px";

type Vector2 = [number, number];
type VectorData = {
  vector: Vector2[];
  str: string;
  occurances: Vector2[][];
};

function countOccurancesForward(needle: string, haystack: string): Vector2[] {
  let pos = 0;
  const result: Vector2[] = [];
  while (true) {
    const foundPos = haystack.indexOf(needle, pos);
    if (foundPos === -1) {
      break;
    }
    result.push([foundPos, foundPos + needle.length]);
    pos = foundPos + 1;
  }
  return result;
}

function countOccurances(needle: string, haystack: string): Vector2[] {
  return countOccurancesForward(needle, haystack).concat(
    countOccurancesForward(needle.split("").reverse().join(""), haystack)
  );
}

function App() {
  const lines = React.useMemo(() => input.split("\n").filter(Boolean), []);

  const HEIGHT = lines.length;
  const WIDTH = lines[0].length;

  const get = React.useCallback(
    (x: number, y: number): string => {
      const r = lines[y]?.[x];
      if (!r) {
        console.error(`get(${x}, ${y}) is undefined`);
      }
      return r;
    },
    [lines]
  );

  const diagCreate = React.useCallback((w: number, h: number): Vector2[] => {
    if (w !== h) {
      throw Error(`diagCreate: width ${w} is not equal to height ${h}`);
    }
    const result: Vector2[] = [];
    for (let i = 0; i < w; i++) {
      result.push([i, i]);
    }
    return result;
  }, []);

  const diagMirror = React.useCallback(
    (diag: Vector2[]): Vector2[] => {
      return diag.map(([x, y]) => [WIDTH - x - 1, y]);
    },
    [WIDTH]
  );

  const diagShift = React.useCallback(
    (diag: Vector2[], shiftX: number, shiftY: number): Vector2[] => {
      return diag
        .map<Vector2>(([x, y]) => [x + shiftX, y + shiftY])
        .filter(([x, y]) => x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT);
    },
    [WIDTH, HEIGHT]
  );

  const diag2Str = React.useCallback(
    (diag: Vector2[]) => {
      return diag.map(([x, y]) => get(x, y)).join("");
    },
    [get]
  );

  const needle = "XMAS";

  // const diagonals: Vector2[][] = [diag1, diag2];
  const vectors: Vector2[][] = React.useMemo(() => {
    const diag1 = diagCreate(WIDTH, HEIGHT);
    const diag2 = diagMirror(diag1);
    const result: Vector2[][] = [];
    // add horizontal line vectors
    for (let y = 0; y < HEIGHT; y++) {
      const lineVector: Vector2[] = [];
      for (let x = 0; x < WIDTH; x++) {
        lineVector.push([x, y]);
      }
      result.push(lineVector);
    }

    // add vertical line vectors
    for (let x = 0; x < WIDTH; x++) {
      const lineVector: Vector2[] = [];
      for (let y = 0; y < HEIGHT; y++) {
        lineVector.push([x, y]);
      }
      result.push(lineVector);
    }

    // start from top right to bottom left
    for (let i = WIDTH - needle.length; i > 0; i--) {
      const diag1Shifted = diagShift(diag1, i, 0);
      result.push(diag1Shifted);
    }

    for (let i = 0; i < WIDTH - needle.length + 1; i++) {
      const diag1ShiftedNeg = diagShift(diag1, 0, i);
      result.push(diag1ShiftedNeg);
    }

    // start from top left to bottom right
    for (let i = WIDTH - needle.length; i > 0; i--) {
      const diag2Shifted = diagShift(diag2, -i, 0);
      result.push(diag2Shifted);
    }
    for (let i = 0; i < WIDTH - needle.length + 1; i++) {
      const diag2ShiftedNeg = diagShift(diag2, 0, i);
      result.push(diag2ShiftedNeg);
    }
    return result;
  }, [HEIGHT, WIDTH, diagCreate, diagMirror, diagShift]);

  const vectorData: VectorData[] = React.useMemo(() => {
    return vectors.map((v) => {
      const str = diag2Str(v);
      const occurances = countOccurances(needle, str);
      return {
        vector: v,
        str,
        occurances: occurances.map(([start, end]) => v.slice(start, end)),
      };
    });
  }, [vectors, diag2Str]);

  const [selected, setSelected] = React.useState<VectorData | undefined>();
  const nodes = React.useMemo(() => {
    const nodes: React.ReactNode[] = [];
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const isSelected = selected?.vector.some(
          ([sx, sy]) => sx === x && sy === y
        );

        let borderWidth = "1px";
        let borderColor = "rgba(125,125,125,.5)";
        if (isSelected) {
          borderColor = "red";
        }

        // check if this cell is part of the needle, if so border color is green
        if (
          selected?.occurances.some((o) =>
            o.some(([ox, oy]) => ox === x && oy === y)
          )
        ) {
          borderColor = "green";
          borderWidth = "2px";
        }
        // console.log(selected?.occurances);
        nodes.push(
          <div
            key={`${x}-${y}`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              fontSize,
              justifyContent: "center",
              display: "flex",
              alignItems: "center",
              borderStyle: "solid",
              borderWidth,
              borderColor,
              boxSizing: "border-box",
            }}>
            {get(x, y)}
          </div>
        );
      }
    }
    return nodes;
  }, [WIDTH, HEIGHT, get, selected]);

  const sum = React.useMemo(() => {
    return vectorData.reduce((acc, v) => acc + v.occurances.length, 0);
  }, [vectorData]);

  const [playing, setPlaying] = React.useState(false);

  const next = React.useCallback(() => {
    setSelected((prev) => {
      const next = (prev ? vectorData.indexOf(prev) : -1) + 1;
      return vectorData[next % vectorData.length];
    });
  }, [vectorData]);

  const prev = React.useCallback(() => {
    setSelected((prev) => {
      const next = (prev ? vectorData.indexOf(prev) : -1) - 1;
      return vectorData[(next + vectorData.length) % vectorData.length];
    });
  }, [vectorData]);

  React.useEffect(() => {
    if (playing) {
      const interval = setInterval(next, 20);
      return () => clearInterval(interval);
    }
  }, [playing, vectorData, next]);
  // 2446 submitted
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        gap: "10px",
      }}>
      <div
        style={{
          display: "flex",
          width: CELL_SIZE * WIDTH,
          minWidth: CELL_SIZE * HEIGHT,
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}>
        {nodes}
      </div>

      <div style={{ overflow: "hidden", height: "100%" }}>
        <div style={{ display: "flex", gap: "5px" }}>
          <button onClick={prev}>Prev</button>
          <button onClick={() => setPlaying(!playing)}>
            {playing ? "Stop" : "Play"}
          </button>
          <button onClick={next}>Next</button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "500px",
            height: "700px",
            overflowY: "scroll",
            gap: "5px",
          }}>
          {vectorData.map((v, i) => (
            <div
              key={i}
              onClick={() => setSelected(v)}
              title={v.str}
              style={{
                cursor: "pointer",
                height: "1em",
                fontSize: "13px",
                maxWidth: "150px",
                whiteSpace: "nowrap",
                display: "flex",
                width: "100%",
              }}>
              {i}-{" "}
              <div
                style={{
                  maxWidth: "100%",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}>
                {v.str}
              </div>{" "}
              <div>({v.occurances.length})</div>
            </div>
          ))}
        </div>
        {sum}
      </div>
    </div>
  );
}

export default App;
