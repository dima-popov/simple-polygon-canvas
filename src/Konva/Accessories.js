class Accessories {
  constructor() {
    this.currentHandle = null;
    this.currentHandleId = null;
    this.angles = true;
    this.labels = true;
    this.justify = false;
  }

  static doOnDrag(shape, accessories, Polygon, canva, Point) {
    return function (elm, uid, helper) {
      return function (pos, e) {
        accessories.currentHandle = elm;
        accessories.currentHandleId = uid;
        if (
          e.clientX + 20 > canva.width ||
          e.clientX - 20 < 0 ||
          e.clientY + 20 > canva.height ||
          e.clientY - 20 < 0
        ) {
          return { x: elm.x + shape.x, y: elm.y + shape.y };
        }

        const buff_x = elm.x;
        const buff_y = elm.y;
        elm.x = pos.x - shape.x;
        elm.y = pos.y - shape.y;
        elm.recalculateBinX();
        elm.recalculateBinY();

        if (
          shape.hasCoincident(helper.coincident).length > 0 ||
          shape.hasIntersection(helper.intersects).length > 0 ||
          helper
            .getSidesLength([...shape.points, shape.points[0]])
            .filter((item) => {
              return item < 20;
            }).length > 0
        ) {
          elm.x = buff_x;
          elm.y = buff_y;
          elm.recalculateBinX();
          elm.recalculateBinY();
          return { x: elm.x + shape.x, y: elm.y + shape.y };
        }

        const parent_obj_id = canva.stage
          .find("#" + accessories.currentHandleId)[0]
          .getAttr("parent_id");

        canva.stage
          .find("#" + parent_obj_id)[0]
          .points(shape.getPointsCoords());

        helper.polyDragFunc(
          canva,
          shape,
          accessories,
          false
        )({ x: shape.x, y: shape.y }, e);

        return pos;
      };
    };
  }

  addPoints(poly, helper, doOnDragFunc, canva, shape) {
    const group = new canva.Konva.Group({
      x: 0,
      y: 0,
      rotation: 0,
    });

    const callback = function (elm) {
      const uid = helper.getUID("x_point_", elm.x, elm.y);

      const config = {
        radius: 5,
        fill: "orange",
        stroke: "darkorange",
        strokeWidth: 1,
        x: elm.x + poly.x,
        y: elm.y + poly.y,
        draggable: true,
        name: "x_point",
        id: uid,
        parent_id: shape.getId(),
        dragBoundFunc: doOnDragFunc(elm, uid, helper),
        point_obj: elm,
        parent_points: () => {
          return poly.points;
        },
        parent_group: group,
        parent_shape: shape,
      };

      group.add(new canva.Konva.Circle(config));
    };
    poly.points.forEach(callback, this);
    shape.setAttr("labels", group);
    return group;
  }

  static arraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }

    return true;
  }

  static addSizeLabels(poly, Canva, Konva) {
    const centers = Canva.getSidesCenters([...poly.points, poly.points[0]]);

    const group = new Konva.Group({
      x: 0,
      y: 0,
      rotation: 0,
      name: "length_label",
      parent_obj: poly,
    });

    centers.forEach((elm) => {
      const text = new Konva.Text({
        text: `${(elm.length / Canva.scale).toFixed(2)}`,
        fontSize: 12,
        lineHeight: 1.2,
        padding: 4,
        fill: "black",
        name: "l_text",
      });

      const tw = text.width();
      const th = text.height();

      const pos_obj = {
        x: poly.x + elm.x,
        y: poly.y + elm.y,
        child_text: text,
        name: "l_labels",
        parent_obj: poly,
        center_line: elm,
      };

      const label = new Konva.Label(pos_obj);
      label.offsetX(tw / 2);
      label.offsetY(th / 2);
      label.add(
        new Konva.Tag({
          fill: "lightgray",
          strokeWidth: 1,
          cornerRadius: 5,
        })
      );

      label.add(text);

      group.add(label);
    });

    return group;
  }

  static justLabels(poly, canva, accessories) {
    const labels = canva.stage.find(".l_labels");
    const padding = 10;

    const curr_lbls = labels.filter((item) => {
      return item.getAttr("parent_obj") === poly;
    });

    curr_lbls.forEach((elm) => {
      const text = elm.attrs.child_text;

      const tw = text.width();
      const th = text.height();

      const center = { ...elm.getAttr("center_line") };
      center.x += poly.x;
      center.y += poly.y;

      let res_pos = {
        x: center.x,
        y: center.y,
      };

      const pos_obj1 = {
        x: center.x,
        y: center.y,
      };

      const pos_obj2 = {
        x: center.x - (tw / 2 + padding),
        y: center.y,
      };

      const pos_obj3 = {
        x: center.x,
        y: center.y - (th / 2 + padding),
      };

      const pos_obj4 = {
        x: center.x + (tw / 2 + padding),
        y: center.y,
      };

      const pos_obj5 = {
        x: center.x,
        y: center.y + (th / 2 + padding),
      };

      const pos_arr = [pos_obj1, pos_obj2, pos_obj3, pos_obj4, pos_obj5];

      pos_arr.forEach((itm) => {
        if (canva.stage.getIntersection(itm) === null) {
          res_pos = itm;
        } else {
          if (
            canva.stage.getIntersection(itm).getName() === "l_text" ||
            canva.stage.getIntersection(itm).getName() === "grid_line"
          ) {
            res_pos = itm;
          }
        }
      });

      elm.x(res_pos.x);
      elm.y(res_pos.y);
    });
  }
}

export default Accessories;
