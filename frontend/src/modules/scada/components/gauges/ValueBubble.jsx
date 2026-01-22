export const ValueBubble = ({ value, unit }) => (
  <div className="mini-gauge value-bubble">
    <div className="bubble-body">
      {value}
      {unit && <span>{unit}</span>}
    </div>
  </div>
);
