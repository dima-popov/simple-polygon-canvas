class Polygon {
  constructor(points, x = 0, y = 0) {
    this.points = points;
    this.x = x;
    this.y = y;
  }
  static baseScale = 100;
  static scale = 100;

  getPointsCoords(x = 0, y = 0) {
    const points_arr = [];
    this.points.forEach(function (elm) {
      points_arr.push(elm.x + x);
      points_arr.push(elm.y + y);
    });
    return points_arr;
  }

  static getAreaByShoelaceFormula(arg, scale = Polygon.scale) {
    const arr = [...arg, arg[0]];
    var x_sum = 0;
    var y_sum = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      x_sum += (arr[i].x / scale) * (arr[i + 1].y / scale);
      y_sum += (arr[i].y / scale) * (arr[i + 1].x / scale);
    }

    return Number((Math.abs(x_sum - y_sum) / 2).toFixed(2));
  }

  unbindPoints() {
    this.points.forEach(function (elm1) {
      elm1.x_bind = [];
      elm1.y_bind = [];
    });
  }

  bindPoints() {
    this.points.forEach(function (elm1) {
      elm1.x_bind = [];
      elm1.y_bind = [];

      this.points.forEach(function (elm2) {
        if (
          (elm1 !== elm2 &&
            elm1.x === elm2.x &&
            this.inStrLineX(elm1, elm2, this.points)) ||
          this.inStrLineX(elm2, elm1, this.points)
        ) {
          elm1.bindX(elm2);
          elm2.bindX(elm1);
        }

        if (
          (elm1 !== elm2 &&
            elm1.y === elm2.y &&
            this.inStrLineY(elm1, elm2, this.points)) ||
          this.inStrLineY(elm2, elm1, this.points)
        ) {
          elm1.bindY(elm2);
          elm2.bindY(elm1);
        }
      }, this);
    }, this);

    const point_arr = [...this.points];
    const shift_arr = [];

    this.points.forEach(function (elm1) {
      shift_arr.push(point_arr.shift());

      const backward = [...point_arr, ...shift_arr];

      this.points.forEach(function (elm2) {
        if (
          (elm1 !== elm2 &&
            elm1.x === elm2.x &&
            this.inStrLineX(elm1, elm2, backward)) ||
          this.inStrLineX(elm2, elm1, backward)
        ) {
          elm1.bindX(elm2);
          elm2.bindX(elm1);
        }

        if (
          (elm1 !== elm2 &&
            elm1.y === elm2.y &&
            this.inStrLineY(elm1, elm2, backward)) ||
          this.inStrLineY(elm2, elm1, backward)
        ) {
          elm1.bindY(elm2);
          elm2.bindY(elm1);
        }
      }, this);
    }, this);
  }

  getPath(elm1, elm2, arr) {
    const path = [];
    const start = arr.indexOf(elm1);
    var i = start;
    const end = arr.indexOf(elm2);
    while (i < end) {
      path.push(arr[i]);
      i++;
    }
    if (end > start) {
      path.push(elm2);
    }
    return path;
  }

  inStrLineX(elm1, elm2, arr) {
    const path = this.getPath(elm1, elm2, arr);
    var result = true;

    for (let i = 0; i < path.length; i++) {
      if (elm1.x !== path[i].x) {
        result = false;
        break;
      }
    }

    if (path.length === 0) {
      result = false;
    }

    return result;
  }

  inStrLineY(elm1, elm2, arr) {
    const path = this.getPath(elm1, elm2, arr);
    var result = true;

    for (let i = 0; i < path.length; i++) {
      if (elm1.y !== path[i].y) {
        result = false;
        break;
      }
    }

    if (path.length === 0) {
      result = false;
    }

    return result;
  }

  pointDistanceLimitation(point, exept) {
    const distance = 10;
    const closed_points = [...this.points];
    const close_point = [];

    for (let i = 0; i < closed_points.length; i++) {
      if (point !== closed_points[i] && exept !== closed_points[i]) {
        if (
          Math.abs(point.x - closed_points[i].x) < distance &&
          Math.abs(point.y - closed_points[i].y) < distance
        ) {
          close_point.push(closed_points[i]);
        }
      }
    }

    return close_point;
  }

  neighborPoints(elm) {
    const index = this.points.indexOf(elm);
    const elm2 =
      this.points[(index + (this.points.length - 1)) % this.points.length];
    const elm3 =
      this.points[(index + (this.points.length + 1)) % this.points.length];

    return [elm2, elm, elm3];
  }

  getSides() {
    const closed_points = [...this.points, this.points[0]];
    const side_arr = [];

    for (let i = 0; i < closed_points.length - 1; i++) {
      side_arr.push([
        closed_points[i].x,
        closed_points[i].y,
        closed_points[i + 1].x,
        closed_points[i + 1].y,
      ]);
    }

    return side_arr;
  }

  hasIntersection(intersects) {
    const intersections = [];

    const sides = this.getSides();

    sides.forEach((elm1) => {
      sides.forEach((elm2) => {
        const lines = [
          elm1[0],
          elm1[1],
          elm1[2],
          elm1[3],
          elm2[0],
          elm2[1],
          elm2[2],
          elm2[3],
        ];
        if (intersects(...lines)) {
          if (!intersections.includes(elm1)) {
            intersections.push(elm1);
          }
        }
      });
    });

    return intersections;
  }

  hasCoincident(coincident) {
    const coincidentArr = [];

    const sides = this.getSides();

    sides.forEach((elm1) => {
      sides.forEach((elm2) => {
        var lines = [
          elm1[0],
          elm1[1],
          elm1[2],
          elm1[3],
          elm2[0],
          elm2[1],
          elm2[2],
          elm2[3],
        ];
        if (
          elm1[0] -
            elm2[0] +
            elm1[1] -
            elm2[1] +
            elm1[2] -
            elm2[2] +
            elm1[3] -
            elm2[3] !==
          0
        ) {
          var add = true;
          if (coincident(...lines)) {
            coincidentArr.forEach((elm_loc) => {
              if (elm_loc[0] === elm2 && elm_loc[1] === elm1) {
                add = false;
              }
            });
            if (add) {
              coincidentArr.push([elm1, elm2]);
            }
          }
        }
      });
    });

    return coincidentArr;
  }

  intersects(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;

      return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
  }

  is_inside(point, w = window.screen.width) {
    const line = [...point, point[0] + w, point[1]];

    let intersections = 0;

    this.getSides().forEach((side) => {
      if (
        this.intersects(
          ...line,
          side[0] + this.x,
          side[1] + this.y,
          side[2] + this.x,
          side[3] + this.y
        ) === true
      ) {
        intersections++;
      }
    });

    return intersections % 2 !== 0;
  }
}

export default Polygon;
