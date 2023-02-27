import Konva from "./Konva";
import Point from "./Point";
import Polygon from "./Polygon";
import Accessories from "./Accessories";
import Canva from "./Canva";
import { useEffect, useState, useRef } from "react";

function onPressShift(e) {
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    Canva.shiftPressed = true;
  } else {
    Canva.shiftPressed = false;
  }
}

function onUnpressShift(e) {
  if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
    Canva.shiftPressed = false;
  }
}

function ModeImg(props) {
  const [stateCanva, setStateCanva] = useState(null);
  const stateAccess = useRef(new Accessories());

  useEffect(() => {
    document.removeEventListener("keydown", onPressShift);
    document.addEventListener("keydown", onPressShift);
    document.removeEventListener("keyup", onUnpressShift);
    document.addEventListener("keyup", onUnpressShift);

    stateAccess.current.labels = true;

    if (stateCanva === null) {
      const canva = new Canva(window.innerWidth, window.innerHeight, Konva);

      canva.drawLine = true;

      canva.init(
        [],
        [],
        Canva,
        [Point, Polygon, Accessories, stateAccess.current],
        () => {
          if (canva.lastPolygon) {
            if (canva.lastPoint == null) {
              props.setStateArea(
                Polygon.getAreaByShoelaceFormula(canva.lastPolygon.points)
              );
            }
          }
        }
      );

      canva.stage.on("mouseup touchend", () => {
        if (canva.lastPolygon) {
          if (canva.lastPoint == null) {
            props.setStateArea(
              Polygon.getAreaByShoelaceFormula(canva.lastPolygon.points)
            );
          }
        }
      });

      setStateCanva(canva);
    } else {
      stateCanva.stage.find(".poly").forEach((elm) => {
        elm.draggable(true);
      });
      stateCanva.stage.find(".x_point").forEach((elm) => {
        elm.draggable(true);
      });
    }
  }, [stateCanva]);

  return <div id="container"></div>;
}

export default ModeImg;
