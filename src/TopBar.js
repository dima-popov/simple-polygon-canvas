function TopBar(props) {
  return (
    <div style={{ padding: "4px" }}>
      <div>
        <strong>Area: {props.stateArea}; </strong>
        <i>Use the Shift key to draw lines at different angles.</i>
      </div>
    </div>
  );
}

export default TopBar;
