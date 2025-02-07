let qtree;
let bounds;
let mousepos;
var highlightcheckbox;
let lineMode = false;    
let combinedMode = false;  
let tileSelector;
let allowedTileTypes = null;

let stateHistory = [];
const MAX_HISTORY = 50; 

window.updateAllowedTileTypes = function(types) {
  allowedTileTypes = types.length > 0 ? types : null;
}

function saveState() {
  stateHistory.push(qtree.getState());
  if (stateHistory.length > MAX_HISTORY) {
    stateHistory.shift();
  }
}

function undo() {
  if (stateHistory.length > 0) {
    const previousState = stateHistory.pop();
    qtree.setState(previousState);
  }
}

function exportHighRes() {
  let scaleFactor = 4;
  let highResCanvas = createGraphics(width * scaleFactor, height * scaleFactor);
  highResCanvas.scale(scaleFactor);
  
  if (lineMode && !combinedMode) {
    highResCanvas.background(255);
    qtree.drawtiles(true, highResCanvas);
  } else if (combinedMode) {
    highResCanvas.background(qtree.color[1]);
    qtree.drawtiles(false, highResCanvas);
    qtree.drawtiles(true, highResCanvas);
  } else {
    highResCanvas.background(qtree.color[1]);
    qtree.drawtiles(false, highResCanvas);
  }

  let timestamp = year() + nf(month(), 2) + nf(day(), 2) + "-" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  save(highResCanvas, 'truchet-' + timestamp + '.png');
  highResCanvas.remove();
}

function setup() {
  window.addEventListener('keydown', function(e) {
    if(e.key === ' ') {
      e.preventDefault();
      return false;
    }
  });

  canvasSize = windowHeight * 1.7;
  let canvasW = canvasSize;
  let canvasH = canvasSize / 2;

  cnv = createCanvas(canvasSize, canvasH);

  // Create a single boundary for the top half
  bounds = new Rectangle(canvasSize/2, 0, canvasW/2, canvasH);
  qtree = new QuadTree(bounds, 0);
  
  // Initial subdivision with specific pattern
  qtree.divide();
  
  // Set specific patterns for each quadrant
  qtree.divisions[0].motif = '/';  // Northeast quadrant
  qtree.divisions[0].motifindex = qtree.divisions[0].motiflist.indexOf('/');
  qtree.divisions[0].tile = new wingtile('fsw', qtree.divisions[0].phase, qtree.divisions[0].boundary, 
    [...qtree.divisions[0].color, qtree.divisions[0].lineColors[qtree.divisions[0].currentLineColor]]);
  
  qtree.divisions[1].motif = '/';  // Northwest quadrant
  qtree.divisions[1].motifindex = qtree.divisions[1].motiflist.indexOf('/');
  qtree.divisions[1].tile = new wingtile('fse', qtree.divisions[1].phase, qtree.divisions[1].boundary,
    [...qtree.divisions[1].color, qtree.divisions[1].lineColors[qtree.divisions[1].currentLineColor]]);
  
  qtree.divisions[2].motif = '/';  // Southeast quadrant
  qtree.divisions[2].motifindex = qtree.divisions[2].motiflist.indexOf('/');
  qtree.divisions[2].tile = new wingtile('fnw', qtree.divisions[2].phase, qtree.divisions[2].boundary,
    [...qtree.divisions[2].color, qtree.divisions[2].lineColors[qtree.divisions[2].currentLineColor]]);
  
  qtree.divisions[3].motif = '/';  // Southwest quadrant
  qtree.divisions[3].motifindex = qtree.divisions[3].motiflist.indexOf('/');
  qtree.divisions[3].tile = new wingtile('fne', qtree.divisions[3].phase, qtree.divisions[3].boundary,
    [...qtree.divisions[3].color, qtree.divisions[3].lineColors[qtree.divisions[3].currentLineColor]]);

  mousepos = new point(mouseX, mouseY);
  tileSelector = new TileSelector();

  let checkboxContainer = createDiv('');
  checkboxContainer.position(width / 2 - 200, height + 20);
  checkboxContainer.style('font-family', 'monospace');
  checkboxContainer.style('background-color', '#ffffff');
  checkboxContainer.style('padding', '10px');
  checkboxContainer.style('border-radius', '5px');
  checkboxContainer.style('text-align', 'center');
  checkboxContainer.style('width', '400px');
  
  highlightcheckbox = createCheckbox('Show Tile Boundaries + Highlight Selection', false);
  highlightcheckbox.parent(checkboxContainer);
  highlightcheckbox.style('font-family', 'monospace');
  highlightcheckbox.style('display', 'block');
  highlightcheckbox.style('text-align', 'center');
  highlightcheckbox.style('margin-bottom', '15px');

  instructions = createDiv(
    'Controls:<br>' +
    'Left Click: Rotate Tile<br>' +
    'Right Click: Subdivide Tile<br>' +
    'Space: Change Tile Pattern<br>' +
    'C: Cycle Colors<br>' +
    'Z: Undo<br>' +
    'X: Export High-Res PNG<br>' +
    'L: Toggle Line Mode<br>' +
    'K: Toggle Combined Mode<br>' +
    'V: Cycle Line Color (Black/White/Sky Blue)<br>' +
    'R: Reverse Subdivision<br>' +
    'I: Random Subdivision'
  );
  instructions.style('font-family', 'monospace');
  instructions.style('background-color', '#ffffff');
  instructions.style('padding', '10px');
  instructions.style('border-radius', '5px');
  instructions.style('font-size', '14px');
  instructions.position(20, height + 20);

  credits = createDiv(
    'Multi-scale Truchet Pattern Composer assembled by ChiLab.<br><br>' +
    'Developed using techniques researched by Christopher Carlson and published in <a href="https://archive.bridgesmathart.org/2018/bridges2018-39.pdf" target="_blank" style="color: inherit; text-decoration: underline;"><em>Bridges Conference Proceedings</em>, Stockholm, 2018</a><br><br>' +
    'Introduced by Sébastien Truchet in 1704, and expanded by Smith and Boucher in their <a href="https://www.jstor.org/stable/1578535?origin=crossref" target="_blank" style="color: inherit; text-decoration: underline;">1987 article in Leonardo</a>, Truchet tiles are square tiles with asymmetric patterns that can be assembled into complex unique compositions.<br><br>' +
    'Special thanks to <a href="https://github.com/DRynne/Multiscale-Truchet" target="_blank" style="color: inherit; text-decoration: underline;">Donovan Rynne</a> for his original Javascript conversion.'
  );
  credits.style('font-family', 'monospace');
  credits.style('background-color', '#ffffff');
  credits.style('padding', '10px');
  credits.style('border-radius', '5px');
  credits.style('font-size', '14px');
  credits.style('text-align', 'right');
  credits.style('position', 'absolute');
  credits.position(windowWidth - 440, height + 20);
  credits.style('max-width', '400px');

  saveState();
  document.addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
  if (lineMode && !combinedMode) {
    background(255);
    qtree.drawtiles(true);
  } else if (combinedMode) {
    background(qtree.color[1]);
    qtree.drawtiles(false);
    qtree.drawtiles(true);
  } else {
    background(qtree.color[1]);
    qtree.drawtiles(false);
  }

  mousepos = new point(mouseX, mouseY);

  if (highlightcheckbox.checked()) {
    qtree.highlight(mousepos);
    qtree.show();
  }
}

function keyPressed() {
  if (key === ' ') {
    event.preventDefault();
    saveState();
    mousepos = new point(mouseX, mouseY);
    qtree.cycleTile(mousepos);
  } else if (key === 'c' || key === 'C') {
    saveState();
    qtree.cycleColorScheme();
  } else if (key === 'x' || key === 'X') {
    exportHighRes();
  } else if (key === 'z' || key === 'Z') {
    undo();
  } else if (key === 'l' || key === 'L') {
    if (combinedMode) {
      combinedMode = false;
    }
    lineMode = !lineMode;
  } else if (key === 'k' || key === 'K') {
    if (lineMode) {
      lineMode = false;
    }
    combinedMode = !combinedMode;
  } else if (key === 'i' || key === 'I') {
    mousepos = new point(mouseX, mouseY);
    // Only proceed if mouse is within the visible canvas area
    if (mouseY >= 0 && mouseY <= height) {
      saveState();
      let maxDepth = 8;
      let subdivisions = 8;
      qtree.randomSubdivide(subdivisions, maxDepth);
    }
  } else if (key === 'v' || key === 'V') {
    saveState();
    qtree.cycleLineColor();
  } else if (key === 'r' || key === 'R') {
    mousepos = new point(mouseX, mouseY);
    // Don't allow reversal of base quadrants
    if (!qtree.isBaseQuadrant(mousepos)) {
      let changed = qtree.reverseSubdivide(mousepos);
      if (changed) saveState();
    }
  }
}

function mouseClicked(event) {
  mousepos = new point(mouseX, mouseY);
  if (mouseButton === LEFT) {
    saveState();
    qtree.rotateTile(mousepos);
  }
}

function mousePressed() {
  mousepos = new point(mouseX, mouseY);
  if (mouseButton === RIGHT) {
    saveState();
    qtree.split(mousepos);
  }
}
