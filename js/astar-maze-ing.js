function createMaze() {
  executeMaze = true;
}

function findPath() {
  executeAStar = true;
}

function removeFromArray(arr, elem) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elem) {
      arr.splice(i, 1);
    }
  }
}

function heuristic(a, b) {
  let d = dist(a.i, a.j, b.i, b.j); // Distance between points A and B
  return d;
}

function index(i, j) {
  if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
    return -1;
  }
  return i + j * cols;
}

function removeWalls(a, b) {
  let x = a.i - b.i;
  if (x === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (x === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  let y = a.j - b.j;
  if (y === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (y === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

let fps = 60;
function mouseWheel(event) {
  fps += event.delta;
  if (fps > 60) {
    fps = 60;
  }
  else if (fps < 5) {
    fps = 5;
  }
  return false;
}

let executeAStar = false;
let executeMaze = false;

let cols, rows;
let w = 20;
let grid = [];
let path = []; // The road taken
let noSolution = false;

let openSet = []; // Array of nodes that are not evaluated
let closedSet = []; // Array of nodes that are evaluated
let start; // Starting node
let end; // Ending node

let current;
let stack = [];

function Cell(i, j) {
  // Location on grid
  this.i = i;
  this.j = j;

  this.f = 0; // Cost of shortest path
  this.g = 0; // Cost
  this.h = 0; // Heuristic

  this.neighbors = []; // Neighbors of the cell
  this.previous = undefined;
  //this.walls = [true, true, true, true]; // Top, Right, Bottom, Left
  this.walls = [true, true, true, true];
  this.visited = false;

  this.checkNeighbors = function () {
    let neighbors = [];

    let top = grid[index(i, j - 1)];
    let right = grid[index(i + 1, j)];
    let bottom = grid[index(i, j + 1)];
    let left = grid[index(i - 1, j)];

    if (top && !top.visited) {
      neighbors.push(top);
    }
    if (right && !right.visited) {
      neighbors.push(right);
    }
    if (bottom && !bottom.visited) {
      neighbors.push(bottom);
    }
    if (left && !left.visited) {
      neighbors.push(left);
    }

    if (neighbors.length > 0) {
      let r = floor(random(0, neighbors.length));
      return neighbors[r];
    } else {
      return undefined;
    }

  }
  this.highlight = function (colorVar) {
    let x = this.i * w;
    let y = this.j * w;
    noStroke();
    fill(colorVar);
    rect(x, y, w, w);
  }

  this.show = function () {
    let x = this.i * w;
    let y = this.j * w;
    stroke(255);
    if (this.walls[0]) {
      line(x, y, x + w, y);
    }
    if (this.walls[1]) {
      line(x + w - 1, y - 1, x + w - 1, y + w - 1);
    }
    if (this.walls[2]) {
      line(x + w - 1, y + w - 1, x - 1, y + w - 1);
    }
    if (this.walls[3]) {
      line(x, y + w, x, y);
    }

    if (this.visited) {
      noStroke();
      fill(121, 134, 203, 100);
      rect(x, y, w, w);
    }
  }

  this.addNeighbors = function (grid) {
    // For easy use
    let i = this.i;
    let j = this.j;

    if (j < rows - 1) {
      // Bottom
      this.neighbors.push(grid[index(i, j + 1)]);
    }
    if (j > 0) {
      // Top
      this.neighbors.push(grid[index(i, j - 1)]);
    }
    if (i < cols - 1) {
      // Right
      this.neighbors.push(grid[index(i + 1, j)]);
    }
    if (i > 0) {
      // Left
      this.neighbors.push(grid[index(i - 1, j)]);
    }
  }
}

function setup() {
  createCanvas(800, 800);
  cols = floor(width / w);
  rows = floor(height / w);
  frameRate(fps);

  // Create every cell in the grid
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j);
      grid.push(cell);
    }
  }

  // Add neighbors to every cell
  for (let i = 0; i < rows * cols; i++) {
    grid[i].addNeighbors(grid);
  }

  current = grid[0];

  // Starting point and ending point
  start = grid[0];
  end = grid[(cols * rows) - 1];

  openSet.push(start); // The first node to be evaluated is "start"
}

function draw() {
  frameRate(fps);
  console.log(fps);
  document.getElementById("fps").innerHTML = fps;
  background(0, 60);
  for (let i = 0; i < grid.length; i++) {
    grid[i].show();
  }

  if (executeMaze) {
    current.visited = true;
    current.highlight(color(0, 0, 255, 100));
    // STEP 1
    let next = current.checkNeighbors();
    if (next) {
      next.visited = true;

      // STEP 2
      stack.push(current);

      // STEP 3
      removeWalls(current, next);

      // STEP 4
      current = next;
    } else if (stack.length > 0) {
      current = stack.pop();
    }
  }

  if (executeAStar) {
    // Search for solution
    if (openSet.length > 0) {

      // Best next option
      let winner = 0;
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[winner].f) {
          winner = i;
        }
      }

      var currentCell = openSet[winner]; // Curret node

      if (currentCell === end) {
        noLoop();
        console.log("DONE!");
      }

      // The currentCell node is evaluated (it moves from openSet to closedSet)
      removeFromArray(openSet, currentCell);
      closedSet.push(currentCell);

      let neighbors = currentCell.neighbors;
      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        if (!closedSet.includes(neighbor)) {

          // Find which side the neighbor is
          let checkSide = [false, false, false, false]; // Top, Right, Bottom, Left

          // Top
          if (neighbor.j + 1 == currentCell.j && neighbor.i == currentCell.i) {
            checkSide[0] = true;
          }
          // Right
          if (neighbor.j == currentCell.j && neighbor.i - 1 == currentCell.i) {
            checkSide[1] = true;
          }
          // Bottom
          if (neighbor.j - 1 == currentCell.j && neighbor.i == currentCell.i) {
            checkSide[2] = true;
          }
          // Left
          if (neighbor.j == currentCell.j && neighbor.i + 1 == currentCell.i) {
            checkSide[3] = true;
          }

          // Save the index of the neighbor position
          let neighborSide = checkSide.indexOf(true);

          // Check that side if it has a wall
          if (!currentCell.walls[neighborSide]) {
            let tempG = currentCell.g + heuristic(neighbor, currentCell); // Increase the cost "g", because we moved at that spot

            // Is this a better path than before?
            let newPath = false;
            if (openSet.includes(neighbor)) {
              if (tempG < neighbor.g) {
                neighbor.g = tempG;
                newPath = true;
              }
            } else {
              neighbor.g = tempG;
              newPath = true;
              openSet.push(neighbor);
            }

            if (newPath) {
              neighbor.h = heuristic(neighbor, end);
              neighbor.f = neighbor.g + neighbor.h;
              neighbor.previous = currentCell;
            }
          }
        }
      }
    } else {
      console.log("No solution!");
      noSolution = true;
      noLoop();
    }

    // Find the path by working backwards
    if (!noSolution) {
      path = [];
      let temp = currentCell;
      path.push(temp);
      while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
      }
    }

    for (let i = 0; i < path.length; i++) {
      path[i].highlight(color(255, 0, 0, 100));
    }
  }
}