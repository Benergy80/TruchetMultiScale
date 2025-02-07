class QuadTree {
  constructor(boundary, tier) {
    this.boundary = boundary;
    this.divided = false;
    this.divisions = {};
    this.tier = tier;
    this.overbox = false;
    this.motiflist = ["/","\\", "-", "|","+.","x.",  "+", "fne","fsw","fnw","fse","tn","ts","te","tw"];
    this.rotations = [0, 90, 180, 270];
    
    this.colorSchemes = {
      0: [color(255), color(255, 223, 0)],    // White and specified Yellow
      1: [color(255), color(0)],              // White and Black
      2: [color(255), color(250, 128, 114)]   // White and Salmon
    };

    this.lineColors = [
      color(0),              // Black
      color(255),            // White
      color(135, 206, 235)   // Sky Blue
    ];
    this.currentLineColor = 0;  
    this.currentScheme = 0;     
    
    this.phase = tier % 2;
    this.motifindex = tier;
    this.motif = this.motiflist[this.motifindex];
    this.currentRotation = 0;
    this.color = [...this.colorSchemes[this.currentScheme]]; 
    this.tile = new wingtile(this.motif, this.phase, this.boundary, [...this.color, this.lineColors[this.currentLineColor]]);

    this.edgeHover = color(0, 255, 0);
    this.fillHover = color(0, 64, 0);
    this.edgeSelected = color(255);
    this.fillSelected = color(255);
    this.edgeNeut = color(255);
    this.fillNeut = this.color[1];
    this.edgecol = this.edgeNeut;
    this.fillcol = this.fillNeut;
    this.discovered = false;
  }

  findParentLevel(point) {
    if (!this.boundary.contains(point)) {
      return null;
    }

    if (this.divided) {
      let allChildrenUndivided = true;
      for (let i = 0; i < 4; i++) {
        if (this.divisions[i].divided) {
          allChildrenUndivided = false;
          break;
        }
      }
      if (allChildrenUndivided) {
        return this;
      }

      for (let i = 0; i < 4; i++) {
        let found = this.divisions[i].findParentLevel(point);
        if (found) return found;
      }
    }

    return null;
  }

  reverseSubdivide(point) {
    let parentLevel = this.findParentLevel(point);
    if (parentLevel) {
      const parentPhase = parentLevel.phase;
      const parentTier = parentLevel.tier;
      const parentScheme = parentLevel.currentScheme;
      const parentLineColor = parentLevel.currentLineColor;

      parentLevel.divided = false;
      parentLevel.divisions = {};
      parentLevel.tile = new wingtile(
        parentLevel.motif,
        parentPhase,
        parentLevel.boundary,
        [...parentLevel.color, parentLevel.lineColors[parentLineColor]]
      );
      return true;
    }
    return false;
  }

  cycleLineColor() {
    this.currentLineColor = (this.currentLineColor + 1) % this.lineColors.length;
    if (this.tile) {
      this.tile.color[2] = this.lineColors[this.currentLineColor];
    }
    if (this.divided) {
      for (let i = 0; i < 4; i++) {
        this.divisions[i].cycleLineColor();
      }
    }
  }

  getState() {
    return {
      boundary: { ...this.boundary },
      divided: this.divided,
      tier: this.tier,
      motifindex: this.motifindex,
      motif: this.motif,
      currentRotation: this.currentRotation,
      currentScheme: this.currentScheme,
      currentLineColor: this.currentLineColor,
      phase: this.phase,
      divisions: this.divided ? {
        0: this.divisions[0].getState(),
        1: this.divisions[1].getState(),
        2: this.divisions[2].getState(),
        3: this.divisions[3].getState()
      } : {}
    };
  }

  setState(state) {
    this.boundary = new Rectangle(state.boundary.x, state.boundary.y, state.boundary.w, state.boundary.h);
    this.divided = state.divided;
    this.tier = state.tier;
    this.motifindex = state.motifindex;
    this.motif = state.motif;
    this.currentRotation = state.currentRotation;
    this.currentScheme = state.currentScheme;
    this.currentLineColor = state.currentLineColor || 0;
    this.phase = state.phase;
    
    this.color = [...this.colorSchemes[this.currentScheme]];
    this.fillNeut = this.color[1];
    
    this.tile = new wingtile(this.motif, this.phase, this.boundary, [...this.color, this.lineColors[this.currentLineColor]]);
    this.tile.rotation = this.currentRotation;

    if (this.divided) {
      Object.keys(state.divisions).forEach(key => {
        this.divisions[key] = new QuadTree(
          new Rectangle(
            state.divisions[key].boundary.x,
            state.divisions[key].boundary.y,
            state.divisions[key].boundary.w,
            state.divisions[key].boundary.h
          ),
          state.divisions[key].tier
        );
        this.divisions[key].setState(state.divisions[key]);
     });
    }
  }

  cycleColorScheme() {
    this.currentScheme = (this.currentScheme + 1) % Object.keys(this.colorSchemes).length;
    this.color = [...this.colorSchemes[this.currentScheme]];
    this.fillNeut = this.color[1];
    
    if (this.tile) {
      const originalPhase = this.phase;
      this.tile = new wingtile(this.motif, originalPhase, this.boundary, [...this.color, this.lineColors[this.currentLineColor]]);
      this.tile.rotation = this.currentRotation;
    }

    if (this.divided) {
      for (let i = 0; i < 4; i++) {
        this.divisions[i].setColorScheme(this.currentScheme);
      }
    }
  }

  setColorScheme(schemeIndex) {
    this.currentScheme = schemeIndex;
    this.color = [...this.colorSchemes[this.currentScheme]];
    this.fillNeut = this.color[1];
    
    if (this.tile) {
      const originalPhase = this.phase;
      this.tile = new wingtile(this.motif, originalPhase, this.boundary, [...this.color, this.lineColors[this.currentLineColor]]);
      this.tile.rotation = this.currentRotation;
    }

    if (this.divided) {
      for (let i = 0; i < 4; i++) {
        this.divisions[i].setColorScheme(schemeIndex);
      }
    }
  }

  cycleTile(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided) {
      if (allowedTileTypes && allowedTileTypes.length > 0) {
        let currentIndex = allowedTileTypes.indexOf(this.motif);
        this.motif = currentIndex === -1 ? allowedTileTypes[0] : allowedTileTypes[(currentIndex + 1) % allowedTileTypes.length];
      } else {
        this.motifindex = (this.motifindex + 1) % this.motiflist.length;
        this.motif = this.motiflist[this.motifindex];
      }
      this.tile = new wingtile(this.motif, this.phase, this.boundary, [...this.color, this.lineColors[this.currentLineColor]]);
      this.tile.rotation = this.currentRotation;
      return true;
    } else {
      for (let i = 0; i < 4; i++) {
        if (this.divisions[i].cycleTile(point)) {
          return true;
        }
      }
    }
    return false;
  }

  rotateTile(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided) {
      this.currentRotation = (this.currentRotation + 90) % 360;
      this.tile.rotation = this.currentRotation;
      return true;
    } else {
      for (let i = 0; i < 4; i++) {
        if (this.divisions[i].rotateTile(point)) {
          return true;
        }
      }
    }
    return false;
  }

  divide() {
    let subtier = this.tier + 1;
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w;
    let h = this.boundary.h;

    let ne = new Rectangle(x + w / 2, y - h / 2, w / 2, h / 2);
    let nw = new Rectangle(x - w / 2, y - h / 2, w / 2, h / 2);
    let se = new Rectangle(x + w / 2, y + h / 2, w / 2, h / 2);
    let sw = new Rectangle(x - w / 2, y + h / 2, w / 2, h / 2);

    this.divisions[0] = new QuadTree(ne, subtier);
    this.divisions[1] = new QuadTree(nw, subtier);
    this.divisions[2] = new QuadTree(se, subtier);
    this.divisions[3] = new QuadTree(sw, subtier);

    // Randomly select between "/" and "\" for each new division
    for (let i = 0; i < 4; i++) {
        this.divisions[i].motif = Math.random() < 0.5 ? "/" : "\\";
        this.divisions[i].motifindex = this.divisions[i].motiflist.indexOf(this.divisions[i].motif);
        this.divisions[i].currentRotation = 0;
        this.divisions[i].setColorScheme(this.currentScheme);
        this.divisions[i].currentLineColor = this.currentLineColor;
        
        this.divisions[i].tile = new wingtile(
            this.divisions[i].motif,
            this.divisions[i].phase,
            this.divisions[i].boundary,
            [...this.divisions[i].color, this.divisions[i].lineColors[this.divisions[i].currentLineColor]]
        );
    }
    
    this.divided = true;
  }

  highlight(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided) {
      this.overbox = true;
      return true;
    } else {
      for (let i = 0; i < 4; i++) {
        if (this.divisions[i].highlight(point)) {
          return true;
        }
      }
    }
    return false;
  }

  drawtiles(lineMode = false, targetCanvas = null) {
    let drawqueue = new Queue();
    let traverse = new Queue();
    traverse.enqueue(this);

    let node;

    while (!traverse.isEmpty()) {
      node = traverse.dequeue();
      if (node.divided) {
        for (let i = 0; i < 4; i++) {
          traverse.enqueue(node.divisions[i]);
        }
      } else {
        node.tile.motif = node.motif;
        node.tile.rotation = node.currentRotation;
        drawqueue.enqueue(node.tile);
      }
    }

    while (!drawqueue.isEmpty()) {
      let tile = drawqueue.dequeue();
      if (lineMode) {
        tile.drawLines(targetCanvas);
      } else {
        tile.drawtile(targetCanvas);
      }
    }
  }

  show() {
    let drawqueue = new Queue();
    let traverse = new Queue();
    traverse.enqueue(this);

    let node;

    while (!traverse.isEmpty()) {
      node = traverse.dequeue();
      if (node.divided) {
        for (let i = 0; i < 4; i++) {
          traverse.enqueue(node.divisions[i]);
        }
      } else {
        drawqueue.enqueue(node);
      }
    }

    push();
    noFill();
    strokeWeight(1);
    rectMode(RADIUS);

    while (!drawqueue.isEmpty()) {
      let node = drawqueue.dequeue();
      if (node.overbox && !drawqueue.isEmpty()) {
        drawqueue.enqueue(node);
        continue;
      } else if (node.overbox && drawqueue.isEmpty()) {
        stroke(node.edgeHover);
        rect(node.boundary.x, node.boundary.y, node.boundary.w, node.boundary.h);
        node.overbox = false;
      } else {
        stroke(node.edgeNeut);
        rect(node.boundary.x, node.boundary.y, node.boundary.w, node.boundary.h);
      }
    }
    pop();
  }

  split(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (!this.divided) {
      this.divide();
      return true;
    } else {
      for (let i = 0; i < 4; i++) {
        if (this.divisions[i].split(point)) {
          return true;
        }
      }
    }
    return false;
  }

  randomSubdivide(n, maxDepth = 8) {  // Increased maxDepth
    // Add debug logging
    console.log(`Current tier: ${this.tier}, MaxDepth: ${maxDepth}`);
    
    if (n <= 0 || this.tier >= maxDepth) {
      console.log(`Stopping subdivision: n=${n}, tier=${this.tier}, maxDepth=${maxDepth}`);
      return;
    }

    // Handle subdivided case - find the tile under mouse and recurse
    if (this.divided) {
      for (let i = 0; i < 4; i++) {
        if (this.divisions[i].boundary.contains(mousepos)) {
          // Debug log which division contains the mouse
          console.log(`Found containing division ${i} at tier ${this.divisions[i].tier}`);
          
          if (!this.divisions[i].divided) {
            if (this.divisions[i].tier < maxDepth) {
              console.log(`Subdividing division ${i} at tier ${this.divisions[i].tier}`);
              this.divisions[i].divide();
              
              // Assign random tiles to the new divisions
              for (let j = 0; j < 4; j++) {
                let div = this.divisions[i].divisions[j];
                const randomIndex = Math.floor(Math.random() * this.motiflist.length);
                div.motif = this.motiflist[randomIndex];
                div.motifindex = randomIndex;
                div.currentRotation = this.rotations[Math.floor(Math.random() * this.rotations.length)];
                
                div.tile = new wingtile(
                  div.motif,
                  div.phase,
                  div.boundary,
                  [...div.color, div.lineColors[div.currentLineColor]]
                );
                div.tile.rotation = div.currentRotation;
              }
            }
          } else {
            // Continue recursion even if already divided
            console.log(`Recursing into division ${i} at tier ${this.divisions[i].tier}`);
            this.divisions[i].randomSubdivide(n - 1, maxDepth);
          }
          return;
        }
      }
    }

    // Handle undivided case - initial division
    if (this.tier < maxDepth) {
      console.log(`Initial division at tier ${this.tier}`);
      this.divide();
      
      // Assign random tiles to initial divisions
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * this.motiflist.length);
        this.divisions[i].motif = this.motiflist[randomIndex];
        this.divisions[i].motifindex = randomIndex;
        this.divisions[i].currentRotation = this.rotations[Math.floor(Math.random() * this.rotations.length)];
        
        this.divisions[i].tile = new wingtile(
          this.divisions[i].motif,
          this.divisions[i].phase,
          this.divisions[i].boundary,
          [...this.divisions[i].color, this.divisions[i].lineColors[this.divisions[i].currentLineColor]]
        );
        this.divisions[i].tile.rotation = this.divisions[i].currentRotation;
      }
    }
  }
}
