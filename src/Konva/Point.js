class Point {
  constructor(x, y) {
    this.px = x;
    this.py = y;
    this.x = x;
    this.y = y;
    this.x_bind = [];
    this.y_bind = [];
  }

  bindX(point) {
    if (!this.x_bind.includes(point)) {
      this.x_bind.push(point);
    }
  }

  bindY(point) {
    if (!this.y_bind.includes(point)) {
      this.y_bind.push(point);
    }
  }

  set x(val) {
    this.diffX = this.px - val;
    this.px = val;
  }
  set y(val) {
    this.diffY = this.py - val;
    this.py = val;
  }
  get x() {
    return this.px;
  }
  get y() {
    return this.py;
  }

  recalculateBinX() {
    this.x_bind.forEach((bound) => {
      bound.x -= this.diffX;
    });
  }
  recalculateBinY() {
    this.y_bind.forEach((bound) => {
      bound.y -= this.diffY;
    });
  }
}

export default Point;
