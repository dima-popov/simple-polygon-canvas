class Canva {
  constructor(w, h, Konva) {
    this.shiftPressed = false;
    this.width = w;
    this.height = h;
    this.Konva = Konva;
    this.originPoint = null;
    this.lastPoint = null;
    this.lastPolygon = null;
    this.points = [];
    this.drawLine = false;
    this.stage = new Konva.Stage({
      container: "container",
      width: this.width,
      height: this.height,
    });
  }
  static baseScale = 100;
  static scale = 100;

  static getUID(
    pref,
    a = Math.round(Math.random() * 10),
    b = Math.round(Math.random() * 10)
  ) {
    return (
      pref +
      a +
      "_" +
      b +
      "_" +
      Math.random().toString(16).slice(2) +
      "_" +
      Math.random().toString(16).slice(2)
    );
  }

  static drawAll(arr, layer, callback) {
    layer.clear();
    arr.forEach((elm) => {
      layer.add(elm);
    });

    if (callback) {
      callback();
    }
  }

  static poly(polygon, Konva, callback, opacity = 1, x = 0, y = 0) {
    const polyg = new Konva.Line({
      points: polygon.getPointsCoords(),
      fill: "gray",
      opacity: opacity,
      stroke: "orange",
      strokeWidth: 2,
      closed: true,
      id: Canva.getUID("poly_"),
      name: "poly",
      draggable: true,
      dragBoundFunc: callback,
      x: x,
      y: y,
      polygonObj: polygon,
    });

    return polyg;
  }

  static poly_line(points, Konva) {
    const poly_line = new Konva.Line({
      points: points,
      fill: "#2a354c",
      opacity: 1,
      stroke: "orange",
      strokeWidth: 2,
      id: Canva.getUID("poly_line_"),
      name: "poly_line",
    });

    return poly_line;
  }

  static polyDragFunc(canva, shape, accessories) {
    const Accessories = accessories.constructor;
    return function (pos, e) {
      if (
        e.clientX + 20 > canva.width ||
        e.clientX - 20 < 0 ||
        e.clientY + 20 > canva.height ||
        e.clientY - 20 < 0
      ) {
        return { x: shape.x, y: shape.y };
      }

      shape.x = pos.x;
      shape.y = pos.y;

      canva.stage.find(".x_point").forEach((elm) => {
        if (elm.attrs.parent_points() === shape.points) {
          elm.setAttr("x", elm.getAttr("point_obj").x + pos.x);
          elm.setAttr("y", elm.getAttr("point_obj").y + pos.y);
        }
      });

      canva.stage.find(".length_label").forEach((elm) => {
        if (elm.getAttr("parent_obj") === shape) {
          elm.destroy();
        }
      });
      Canva.drawAll(
        [Accessories.addSizeLabels(shape, Canva, canva.Konva)],
        canva.layer2
      );

      canva.stage.find(".poly_outline").forEach((elm) => {
        if (elm.getAttr("parent_obj") === shape) {
          elm.destroy();
        }
      });

      const poly = new canva.Konva.Line({
        points: [
          ...shape.getPointsCoords(),
          shape.getPointsCoords()[0],
          shape.getPointsCoords()[1],
        ],
        stroke: "transparent",
        strokeWidth: 15,
        name: "poly_outline",
        parent_obj: shape,
        x: shape.x,
        y: shape.y,
      });

      canva.layer1.add(poly);
      return pos;
    };
  }

  haveIntersection(r1, r2) {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    );
  }

  static throttle(func, delay) {
    let toThrottle = false;
    return function () {
      if (!toThrottle) {
        toThrottle = true;
        func.apply(this, arguments);
        setTimeout(() => {
          toThrottle = false;
        }, delay);
      }
    };
  }

  static debounce(func, delay) {
    let timerId;
    return function () {
      clearTimeout(timerId);
      timerId = setTimeout(() => func.apply(this, arguments), delay);
    };
  }

  static getSidesLength(arr, scale = 1) {
    const closed_points = [...arr];
    const length_arr = [];

    for (let i = 0; i < closed_points.length - 1; i++) {
      length_arr.push(
        Math.round(
          Math.sqrt(
            Math.abs(
              closed_points[i].x / scale - closed_points[i + 1].x / scale
            ) **
              2 +
              Math.abs(
                closed_points[i].y / scale - closed_points[i + 1].y / scale
              ) **
                2
          )
        )
      );
    }

    return length_arr;
  }

  static getSidesCenters(arr) {
    const closed_points = [...arr];
    const center_arr = [];

    for (let i = 0; i < closed_points.length - 1; i++) {
      center_arr.push({
        x:
          closed_points[i].x -
          (closed_points[i].x - closed_points[i + 1].x) / 2,
        y:
          closed_points[i].y -
          (closed_points[i].y - closed_points[i + 1].y) / 2,
        length: Math.round(
          Math.sqrt(
            Math.abs(closed_points[i].x - closed_points[i + 1].x) ** 2 +
              Math.abs(closed_points[i].y - closed_points[i + 1].y) ** 2
          )
        ),
      });
    }

    return center_arr;
  }

  static intersects(a, b, c, d, p, q, r, s) {
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

  static coincident(a, b, c, d, p, q, r, s) {
    var result = false;
    if (!Canva.intersects(a, b, c, d, p, q, r, s)) {
      const A = [a, b];
      const B = [c, d];
      const C = [p, q];
      const D = [r, s];

      const comb = [
        [A, B, C, D],
        [C, D, A, B],
        [A, B, D, C],
        [A, D, B, C],
        [D, A, C, B],
        [D, A, B, C],
        [A, D, C, B],
        [A, C, D, B],
        [D, B, A, C],
      ];

      comb.forEach((elm) => {
        if (Canva.inLine(...[...elm[0], ...elm[1], ...elm[2], ...elm[3]])) {
          const l1 = Canva.getSidesLength([
            { x: elm[0][0], y: elm[0][1] },
            { x: elm[3][0], y: elm[3][1] },
          ])[0];

          const l2 = Canva.getSidesLength([
            { x: elm[0][0], y: elm[0][1] },
            { x: elm[1][0], y: elm[1][1] },
          ])[0];

          const l3 = Canva.getSidesLength([
            { x: elm[2][0], y: elm[2][1] },
            { x: elm[3][0], y: elm[3][1] },
          ])[0];

          if (l1 < l2 + l3) {
            result = true;
          } else {
            result = false;
          }
        } else {
          result = false;
        }
      });
    }
    return result;
  }

  static inLine(a, b, c, d, p, q, r, s) {
    const ab_rs = Canva.getSidesLength([
      { x: a, y: b },
      { x: r, y: s },
    ])[0];
    const ab_cd = Canva.getSidesLength([
      { x: a, y: b },
      { x: c, y: d },
    ])[0];
    const ab_pq = Canva.getSidesLength([
      { x: a, y: b },
      { x: p, y: q },
    ])[0];
    const cd_rs = Canva.getSidesLength([
      { x: c, y: d },
      { x: r, y: s },
    ])[0];
    const pq_rs = Canva.getSidesLength([
      { x: p, y: q },
      { x: r, y: s },
    ])[0];
    if (
      (ab_rs === ab_cd + cd_rs && ab_rs === ab_pq + pq_rs) ||
      (ab_rs === ab_cd + cd_rs + 1 && ab_rs === ab_pq + pq_rs + 1) ||
      (ab_rs === ab_cd + cd_rs - 1 && ab_rs === ab_pq + pq_rs - 1)
    ) {
      return true;
    } else {
      return false;
    }
  }

  setPoints(Point, Polygon, Accessories, accessories, callback) {
    const Canva = this.constructor;
    const canva = this;

    this.stage.on("click tap", function (e) {
      canva.stage.find(".h_line_length_label").forEach((itm) => {
        itm.destroy();
      });

      const layerX = e.evt.layerX || e.currentTarget.pointerPos.x;
      const layerY = e.evt.layerY || e.currentTarget.pointerPos.y;
      const eX = e.evt.x || 0;
      const eY = e.evt.y || 0;

      if (canva.drawLine === true) {
        if (canva.originPoint) {
          if (
            ((canva.originPoint.x() < layerX + 15 &&
              canva.originPoint.x() >= layerX) ||
              (canva.originPoint.x() > layerX - 15 &&
                canva.originPoint.x() <= layerX)) &&
            ((canva.originPoint.y() < layerY + 15 &&
              canva.originPoint.y() >= layerY) ||
              (canva.originPoint.y() > layerY - 15 &&
                canva.originPoint.y() <= layerY))
          ) {
            if (canva.stage.find(".poly_line").length > 0) {
              canva.stage.find(".poly_line").forEach((itm) => {
                itm.destroy();
              });
            }
            if (canva.stage.find(".h_line").length > 0) {
              canva.stage.find(".h_line").forEach((itm) => {
                itm.destroy();
              });
            }
            if (canva.stage.find(".s_point").length > 0) {
              canva.stage.find(".s_point").forEach((itm) => {
                itm.destroy();
              });
            }

            const polygon = new Polygon(canva.points);

            canva.points = [];
            canva.lastPoint = null;
            canva.originPoint = null;
            canva.lastPolygon = polygon;
            const pol1 = Canva.poly(
              polygon,
              canva.Konva,
              Canva.polyDragFunc(canva, polygon, accessories),
              0.8,
              0,
              0,
              polygon
            );
            if (!Canva.shiftPressed) {
              polygon.bindPoints();
            }

            Canva.drawAll([pol1], canva.layer1);
            Canva.drawAll(
              [
                accessories.addPoints(
                  polygon,
                  Canva,
                  Accessories.doOnDrag(
                    polygon,
                    accessories,
                    Polygon,
                    canva,
                    Point
                  ),
                  canva,
                  pol1
                ),
                Accessories.addSizeLabels(polygon, Canva, canva.Konva),
              ],
              canva.layer2
            );

            if (callback) {
              callback();
            }
            canva.drawLine = false;
            if (canva.lastPolygon) {
              if (
                canva.lastPolygon.hasIntersection(Canva.intersects).length >
                  0 ||
                canva.lastPolygon.points.length < 3
              ) {
                pol1.fill("red");
                pol1.stroke("red");
                setTimeout(() => {
                  canva.eraseCallback();
                }, 1500);
              } else {
              }
            }
            return true;
          }
        }
        const uid = Canva.getUID("s_point_", eX, eY);

        const config = {
          radius: 5,
          fill: "orange",
          stroke: "darkorange",
          strokeWidth: 1,
          x: layerX,
          y: layerY,
          draggable: true,
          name: "s_point",
          id: uid,
        };

        const point = new canva.Konva.Circle(config);

        if (canva.originPoint) {
          const angle = Math.abs(
            Math.round(
              Math.atan(
                (layerY - canva.lastPoint.y()) / (layerX - canva.lastPoint.x())
              ) *
                (180 / Math.PI)
            )
          );

          if (!Canva.shiftPressed) {
            if (angle >= 0 && angle < 45) {
              point.y(canva.lastPoint.y());
            }

            if (angle >= 45 && angle <= 90) {
              point.x(canva.lastPoint.x());
            }
          }

          canva.layer2.add(point);
          canva.lastPoint = point;
          canva.points.push(new Point(point.x(), point.y()));
        } else {
          canva.layer2.add(point);

          canva.lastPoint = point;
          canva.originPoint = point;
          canva.points.push(new Point(point.x(), point.y()));
        }

        if (canva.stage.find(".h_line").length === 0) {
          const h_line = new canva.Konva.Line({
            points: [canva.lastPoint.x(), canva.lastPoint.y(), layerX, layerY],
            fill: "#2a354c",
            opacity: 1,
            stroke: "orange",
            strokeWidth: 2,
            closed: true,
            id: Canva.getUID("poly_"),
            name: "h_line",
            x: 0,
            y: 0,
          });
          canva.layer2.add(h_line);
        }

        const points_arr = [];

        canva.points.forEach(function (elm) {
          points_arr.push(elm.x);
          points_arr.push(elm.y);
        });

        canva.stage.find(".poly_line").forEach((itm) => {
          itm.destroy();
        });

        canva.layer2.add(Canva.poly_line(points_arr, canva.Konva));
      }
    });

    this.stage.on("mousemove", function (e) {
      if (canva.drawLine === true) {
        if (canva.lastPoint) {
          var points_x = e.evt.layerX;
          var points_y = e.evt.layerY;

          const angle = Math.abs(
            Math.round(
              Math.atan(
                (e.evt.layerY - canva.lastPoint.y()) /
                  (e.evt.layerX - canva.lastPoint.x())
              ) *
                (180 / Math.PI)
            )
          );

          if (!Canva.shiftPressed) {
            if (angle >= 0 && angle < 45) {
              points_y = canva.lastPoint.y();
            }

            if (angle >= 45 && angle <= 90) {
              points_x = canva.lastPoint.x();
            }
          }

          canva.stage
            .find(".h_line")[0]
            .points([
              canva.lastPoint.x(),
              canva.lastPoint.y(),
              points_x,
              points_y,
            ]);

          if (true) {
            canva.stage.find(".h_line_length_label").forEach((itm) => {
              itm.destroy();
            });

            const groupLabel = new canva.Konva.Group({
              x: 0,
              y: 0,
              rotation: 0,
              name: "h_line_length_label",
            });

            const h_line_length = Canva.getSidesLength([
              { x: canva.lastPoint.x(), y: canva.lastPoint.y() },
              { x: points_x, y: points_y },
            ])[0];

            const text = new canva.Konva.Text({
              text: `${(h_line_length / Canva.scale).toFixed(2)}`,
              fontSize: 12,
              lineHeight: 1.2,
              padding: 4,
              fill: "black",
              name: "l_text",
            });

            const tw = text.width();
            const th = text.height();
            const diffX = canva.lastPoint.x() - e.evt.layerX;
            const diffY = canva.lastPoint.y() - e.evt.layerY;

            const pos_obj = {
              x: canva.lastPoint.x() - diffX / 2,
              y: canva.lastPoint.y() - diffY / 2,
              child_text: text,
              name: "l_labels",
            };

            const label = new canva.Konva.Label(pos_obj);
            label.offsetX(tw / 2);
            label.offsetY(th / 2);
            label.add(
              new canva.Konva.Tag({
                fill: "lightgray",
                strokeWidth: 1,
                cornerRadius: 5,
              })
            );

            label.add(text);

            groupLabel.add(label);
            canva.layer2.add(groupLabel);
          }
        }
      }
    });
  }

  grid() {
    const padding = 20;

    for (let i = 0; i < this.width / padding; i++) {
      this.gridLayer.add(
        new this.Konva.Line({
          points: [
            Math.round(i * padding) + 0.5,
            0,
            Math.round(i * padding) + 0.5,
            this.height,
          ],
          stroke: "rgba(119, 119, 121, 0.5)",
          strokeWidth: 0.5,
          name: "grid_line",
        })
      );
    }

    this.gridLayer.add(new this.Konva.Line({ points: [0, 0, 10, 10] }));
    for (let j = 0; j < this.height / padding; j++) {
      this.gridLayer.add(
        new this.Konva.Line({
          points: [
            0,
            Math.round(j * padding),
            this.width,
            Math.round(j * padding),
          ],
          stroke: "rgba(119, 119, 121, 0.5)",
          strokeWidth: 0.5,
          name: "grid_line",
        })
      );
    }
  }

  init(arr1, arr2, Canva, helpers, callback) {
    this.layer1 = new this.Konva.Layer();
    this.layer2 = new this.Konva.Layer();
    this.gridLayer = new this.Konva.Layer();

    this.stage.add(this.gridLayer);
    this.stage.add(this.layer1);
    this.stage.add(this.layer2);

    this.grid();

    Canva.drawAll(arr1, this.layer1, () => {
      Canva.drawAll(arr2, this.layer2);
    });

    this.setPoints(...helpers, callback);

    this.stage.draw();
  }
}

export default Canva;
