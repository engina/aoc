"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const input = fs.readFileSync('input.txt', 'utf8');
var input = "....#.....\n.........#\n..........\n..#.......\n.......#..\n..........\n.#..^.....\n........#.\n#.........\n......#...\n";
var grid = input
    .split("\n")
    .filter(Boolean)
    .map(function (l) { return l.split(""); });
function guardGetVector(grid) {
    // guard characters are '^', 'v', '<', '>'
    for (var y = 0; y < grid.length; y++) {
        for (var x = 0; x < grid[y].length; x++) {
            var dir = grid[y][x];
            if (dir === "^" || dir === "v" || dir === "<" || dir === ">") {
                return { pos: [x, y], dir: dir };
            }
        }
    }
    throw Error("No guard found");
}
function gridGetLingOfSight(grid, guardVector) {
    var _a = guardVector.pos, x = _a[0], y = _a[1];
    var dir = guardVector.dir;
    var result = [];
    var x2 = x;
    var y2 = y;
    while (true) {
        switch (dir) {
            case "^":
                y2--;
                break;
            case "v":
                y2++;
                break;
            case "<":
                x2--;
                break;
            case ">":
                x2++;
                break;
        }
        if (y2 < 0 || y2 >= grid.length || x2 < 0 || x2 >= grid[y2].length) {
            break;
        }
        if (grid[y2][x2] === "#") {
            break;
        }
        result.push(grid[y2][x2]);
    }
    return result.length;
}
function guardRotateRight(grid, guard) {
    var _a = guard.pos, x = _a[0], y = _a[1];
    switch (guard.dir) {
        case "^":
            grid[y][x] = ">";
            guard.dir = ">";
            break;
        case "v":
            grid[y][x] = "<";
            guard.dir = "<";
            break;
        case "<":
            grid[y][x] = "^";
            guard.dir = "^";
            break;
        case ">":
            grid[y][x] = "v";
            guard.dir = "v";
            break;
    }
}
function guardMove(grid) {
    var guard = guardGetVector(grid);
    var steps = gridGetLingOfSight(grid, guard) + 1;
    console.log({ guard: guard, steps: steps });
    for (var i = 0; i < steps; i++) {
        var _a = guard.pos, x = _a[0], y = _a[1];
        var x2 = x;
        var y2 = y;
        switch (guard.dir) {
            case "^":
                y2--;
                break;
            case "v":
                y2++;
                break;
            case "<":
                x2--;
                break;
            case ">":
                x2++;
                break;
        }
        console.log("testing", x2, y2, grid[y2][x2]);
        if (y2 < 0 || y2 >= grid.length || x2 < 0 || x2 >= grid[y2].length) {
            console.log("out");
            return "out";
        }
        if (grid[y2][x2] === "#") {
            console.log("hit");
            guardRotateRight(grid, guard);
            return "hit";
        }
        grid[y2][x2] = "X";
        guard.pos = [x2, y2];
    }
    throw Error("Guard did not hit anything");
}
function printGrid(grid) {
    console.log("Grid:");
    for (var _i = 0, grid_1 = grid; _i < grid_1.length; _i++) {
        var row = grid_1[_i];
        console.log(row.join(""));
    }
}
var pos = guardGetVector(grid);
console.log(pos);
var lineOfSight = gridGetLingOfSight(grid, pos);
console.log(lineOfSight);
printGrid(grid);
guardMove(grid);
printGrid(grid);
guardMove(grid);
printGrid(grid);
guardMove(grid);
printGrid(grid);
