export const BooleanLamp = ({ active }) => (
  <div className="mini-gauge boolean-lamp">
    <div className={`lamp ${active ? "on" : "off"}`}></div>
    <div className="mini-bar-label">{active ? "OK" : "FALLO"}</div>
  </div>
);
