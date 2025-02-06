let qtreeLeft;
let qtreeRight;
let bounds;
let mousepos;
var highlightcheckbox;
let lineMode = false;    
let combinedMode = false;  
let tileSelector;
let allowedTileTypes = null;

// Add state history arrays
let stateHistoryLeft = [];
let stateHistoryRight = [];
const MAX_HISTORY = 50; 

window.updateAllowedTileTypes = function(types) {
  allowedTileTypes = types.length > 0 ? types : null;
}

function saveState() {
  stateHistoryLeft.push(qtreeLeft.getState());
  stateHistoryRight.push(qtreeRight.getState());
  
  if (stateHistoryLeft.length > MAX_HISTORY) {
    stateHistoryLeft.shift();
    stateHistoryRight.shift();
  }
}

function undo() {
  if (stateHistoryLeft.length > 0 && stateHistoryRight.length > 0) {
    const previousStateLeft = stateHistoryLeft.pop();
    const previousStateRight = stateHistoryRight.pop();
    qtreeLeft.setState(previousStateLeft);
    qtreeRight.setState(previousStateRight);
  }
}

function exportHighRes() {
  let scaleFactor = 4;
  let highResCanvas = createGraphics(width * scaleFactor, height * scaleFactor);
  highResCanvas.scale(scaleFactor);
  
  if (lineMode && !combinedMode) {
    highResCanvas.background(255);
    qtreeLeft.drawtiles(true, highResCanvas);
    qtreeRight.drawtiles(true, highResCanvas);
  } else if (combinedMode) {
    highResCanvas.background(qtreeLeft.color[1]);
    qtreeLeft.drawtiles(false, highResCanvas);
    qtreeRight.drawtiles(false, highResCanvas);
    qtreeLeft.drawtiles(true, highResCanvas);
    qtreeRight.drawtiles(true, highResCanvas);
  } else {
    highResCanvas.background(qtreeLeft.color[1]);
    qtreeLeft.drawtiles(false, highResCanvas);
    qtreeRight.drawtiles(false, highResCanvas);
  }

  let timestamp = year() + nf(month(), 2) + nf(day(), 2) + "-" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
  save(highResCanvas, 'truchet-' + timestamp + '.png');
  highResCanvas.remove();
}

function setup() {
  // Prevent space bar scrolling globally
  window.addEventListener('keydown', function(e) {
    if(e.key === ' ') {
      e.preventDefault();
      return false;
    }
  });

  canvasSize = windowHeight * 0.85;
  canvasW = canvasSize * 0.5;
  canvasH = canvasSize * 0.5;

  cnv = createCanvas(canvasSize * 2, canvasSize);

  let boundsLeft = new Rectangle(canvasSize/2, canvasSize/2, canvasW, canvasH);
  qtreeLeft = new QuadTree(boundsLeft, 0);

  let boundsRight = new Rectangle(canvasSize * 1.5, canvasSize/2, canvasW, canvasH);
  qtreeRight = new QuadTree(boundsRight, 0);

  mousepos = new point(mouseX, mouseY);
  
  // Initialize TileSelector
  tileSelector = new TileSelector();

  // Create checkbox and note
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
  
  let note = createDiv('Note: Always subdivide the righthand tile first<br>to avoid glitching artifacts.');
  note.parent(checkboxContainer);
  note.style('font-family', 'monospace');
  note.style('font-size', '14px');
  note.style('margin-top', '15px');
  note.style('text-align', 'center');

  // Create instructions text
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

  // Create credits text
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

  // Save initial state
  saveState();

  document.addEventListener('contextmenu', event => event.preventDefault());
}

function draw() {
  if (lineMode && !combinedMode) {
    background(255);
    qtreeLeft.drawtiles(true);
    qtreeRight.drawtiles(true);
  } else if (combinedMode) {
    background(qtreeLeft.color[1]);
    qtreeLeft.drawtiles(false);
    qtreeRight.drawtiles(false);
    qtreeLeft.drawtiles(true);
    qtreeRight.drawtiles(true);
  } else {
    background(qtreeLeft.color[1]);
    qtreeLeft.drawtiles(false);
    qtreeRight.drawtiles(false);
  }

  mousepos = new point(mouseX, mouseY);

  if (highlightcheckbox.checked()) {
    qtreeLeft.highlight(mousepos);
    qtreeLeft.show();
    qtreeRight.highlight(mousepos);
    qtreeRight.show();
  }
}

function keyPressed() {
  if (key === ' ') {  // Space bar
    event.preventDefault();  // Prevent scrolling
    saveState();
    mousepos = new point(mouseX, mouseY);
    qtreeLeft.cycleTile(mousepos);
    qtreeRight.cycleTile(mousepos);
  } else if (key === 'c' || key === 'C') {  // Color cycling
    saveState();
    qtreeLeft.cycleColorScheme();
    qtreeRight.cycleColorScheme();
  } else if (key === 'x' || key === 'X') {  // Export high-res
    exportHighRes();
  } else if (key === 'z' || key === 'Z') {  // Undo
    undo();
  } else if (key === 'l' || key === 'L') {  // Toggle line mode
    if (combinedMode) {
      combinedMode = false;
    }
    lineMode = !lineMode;
  } else if (key === 'k' || key === 'K') {  // Toggle combined mode
    if (lineMode) {
      lineMode = false;
    }
    combinedMode = !combinedMode;
  } else if (key === 'i' || key === 'I') {  // Random Subdivision
    saveState();
    mousepos = new point(mouseX, mouseY);
    
    let maxDepth = 8; // Increased from 6 to 8
    let subdivisions = 8; // Increased from 3 to 8
    
    if (qtreeLeft.boundary.contains(mousepos)) {
      qtreeLeft.randomSubdivide(subdivisions, maxDepth);
    }
    if (qtreeRight.boundary.contains(mousepos)) {
      qtreeRight.randomSubdivide(subdivisions, maxDepth);
    }
  } else if (key === 'v' || key === 'V') {  // Cycle line color
    saveState();
    qtreeLeft.cycleLineColor();
    qtreeRight.cycleLineColor();
  } else if (key === 'r' || key === 'R') {  // Reverse subdivision
    mousepos = new point(mouseX, mouseY);
    let changed = false;
    
    if (qtreeLeft.boundary.contains(mousepos)) {
      saveState();
      changed = qtreeLeft.reverseSubdivide(mousepos);
    } else if (qtreeRight.boundary.contains(mousepos)) {
      saveState();
      changed = qtreeRight.reverseSubdivide(mousepos);
    }
  }
}

function mouseClicked(event) {
  mousepos = new point(mouseX, mouseY);
  
  if (mouseButton === LEFT) {
    saveState();
    qtreeLeft.rotateTile(mousepos);
    qtreeRight.rotateTile(mousepos);
  }
}

function mousePressed() {
  mousepos = new point(mouseX, mouseY);
  
  if (mouseButton === RIGHT) {
    saveState();
    qtreeLeft.split(mousepos);
    qtreeRight.split(mousepos);
  }
}
