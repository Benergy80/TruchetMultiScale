class Rectangle {
  constructor(x, y, w, h) {
    console.log("Rectangle created:", {x, y, w, h});
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  
  contains(point) {
    return (point.x >= this.x - this.w &&
      point.x < this.x + this.w &&
      point.y >= this.y - this.h &&
      point.y < this.y + this.h);
  }

  intersects(range) {
    return !(range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h);
  }

  isSameSize(other) {
    return Math.abs(this.w - other.w) < 0.1 && Math.abs(this.h - other.h) < 0.1;
  }
}

class point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

console.log("Rectangle.js loaded");