class wingtile {
  constructor(motif, phase, boundary, color) {
    this.motif = motif;
    this.phase = phase;
    this.boundary = boundary;
    this.color = [...color];

    if (this.phase) {
      [this.color[0], this.color[1]] = [this.color[1], this.color[0]];
    }
    
    this.rotation = 0;
  }

  drawtile(targetCanvas = null) {
    const g = targetCanvas || window;
    
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w;
    let h = this.boundary.h;
    let smallr = 2 * w / 6;
    let bigr = 2 * w / 3;
    let arcd = 2 * 2 * 2 * w / 3;

    g.push();
    g.translate(x, y);
    g.rotate(g.radians(this.rotation));

    g.noStroke();
    g.rectMode(RADIUS);
    g.fill(this.color[1]);
    g.rect(0, 0, w, h);
    g.fill(this.color[0]);

    switch (this.motif) {
      case "\\":
        g.arc(w, -h, arcd, arcd, PI / 2, PI);
        g.arc(-w, h, arcd, arcd, 3 * PI / 2, 2 * PI);
        break;
      case "/":
        g.arc(-w, -h, arcd, arcd, 0, PI / 2);
        g.arc(w, h, arcd, arcd, PI, 3 * PI / 2);
        break;
      case "-":
        g.rect(0, 0, w, smallr);
        break;
      case "|":
        g.rect(0, 0, smallr, h);
        break;
      case "+.":
        break;
      case "x.":
        g.fill(this.color[0]);
        g.rect(0, 0, w, h);
        break;
      case "+":
        g.rect(0, 0, w, smallr);
        g.rect(0, 0, smallr, h);
        break;
      case "fne":
        g.arc(w, -h, arcd, arcd, PI / 2, PI);
        break;
      case "fsw":
        g.arc(-w, h, arcd, arcd, 3 * PI / 2, 2 * PI);
        break;
      case "fnw":
        g.arc(-w, -h, arcd, arcd, 0, PI / 2);
        break;
      case "fse":
        g.arc(w, h, arcd, arcd, PI, 3 * PI / 2);
        break;
      case "tn":
        g.fill(this.color[0]);
        g.rect(0, -smallr, w, bigr);
        break;
      case "ts":
        g.fill(this.color[0]);
        g.rect(0, smallr, w, bigr);
        break;
      case "te":
        g.fill(this.color[0]);
        g.rect(smallr, 0, bigr, h);
        break;
      case "tw":
        g.fill(this.color[0]);
        g.rect(-smallr, 0, bigr, h);
        break;
    }

    g.fill(this.color[1]);
    g.circle(-w, -h, bigr);
    g.circle(w, -h, bigr);
    g.circle(-w, h, bigr);
    g.circle(w, h, bigr);

    g.fill(this.color[0]);
    g.circle(0, -h, smallr);
    g.circle(w, 0, smallr);
    g.circle(0, h, smallr);
    g.circle(-w, 0, smallr);

    g.pop();
  }

  drawLines(targetCanvas = null) {
    const g = targetCanvas || window;
    
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w;
    let h = this.boundary.h;
    let smallr = 2 * w / 6;
    let bigr = 2 * w / 3;
    let arcd = 2 * 2 * 2 * w / 3;

    g.push();
    g.translate(x, y);
    g.rotate(g.radians(this.rotation));

    g.stroke(this.color[2] || 0);
    g.strokeWeight(1);
    g.noFill();

    switch (this.motif) {
      case "\\":
        g.arc(w, -h, arcd, arcd, PI / 2, PI);
        g.arc(-w, h, arcd, arcd, 3 * PI / 2, 2 * PI);
        break;
      case "/":
        g.arc(-w, -h, arcd, arcd, 0, PI / 2);
        g.arc(w, h, arcd, arcd, PI, 3 * PI / 2);
        break;
      case "-":
        g.line(-w, -smallr, w, -smallr);
        g.line(-w, smallr, w, smallr);
        break;
      case "|":
        g.line(-smallr, -h, -smallr, h);
        g.line(smallr, -h, smallr, h);
        break;
      case "+.":
        break;
      case "x.":
        break;
      case "+":
        g.line(-w, -smallr, w, -smallr);
        g.line(-w, smallr, w, smallr);
        g.line(-smallr, -h, -smallr, h);
        g.line(smallr, -h, smallr, h);
        break;
      case "fne":
        g.arc(w, -h, arcd, arcd, PI / 2, PI);
        break;
      case "fsw":
        g.arc(-w, h, arcd, arcd, 3 * PI / 2, 2 * PI);
        break;
      case "fnw":
        g.arc(-w, -h, arcd, arcd, 0, PI / 2);
        break;
      case "fse":
        g.arc(w, h, arcd, arcd, PI, 3 * PI / 2);
        break;
      case "tn":
        g.line(-w, -smallr, w, -smallr);
        break;
      case "ts":
        g.line(-w, smallr, w, smallr);
        break;
      case "te":
        g.line(smallr, -h, smallr, h);
        break;
      case "tw":
        g.line(-smallr, -h, -smallr, h);
        break;
    }

    g.circle(-w, -h, bigr);
    g.circle(w, -h, bigr);
    g.circle(-w, h, bigr);
    g.circle(w, h, bigr);

    g.circle(0, -h, smallr);
    g.circle(w, 0, smallr);
    g.circle(0, h, smallr);
    g.circle(-w, 0, smallr);

    g.pop();
  }
}