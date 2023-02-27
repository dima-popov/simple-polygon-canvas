import "./App.css";
import ModalImg from "./Konva/ModeImg";
import TopBar from "./TopBar";
import { useState } from "react";

function App() {
  const [stateArea, setStateArea] = useState(0);
  return (
    <div>
      <TopBar stateArea={stateArea} />
      <ModalImg setStateArea={setStateArea} />
    </div>
  );
}

export default App;
