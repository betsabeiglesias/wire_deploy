import { clampPercent, describeArc, polarToCartesian } from "../../utils";

const NEEDLE_START_ANGLE = -135;
const NEEDLE_END_ANGLE = 135;
const NEEDLE_RANGE = NEEDLE_END_ANGLE - NEEDLE_START_ANGLE;

export const NeedleGauge = ({ percent, value, unit }) => {
  const normalized = clampPercent(percent);
  const center = 70;
  const radius = 58;
  const arcEndAngle = NEEDLE_START_ANGLE + (NEEDLE_RANGE * normalized) / 100;

  const trackPath = describeArc(center, center, radius, NEEDLE_START_ANGLE, NEEDLE_END_ANGLE);
  const progressPath = normalized <= 0 ? null : describeArc(center, center, radius, NEEDLE_START_ANGLE, arcEndAngle);
  const needleOuter = polarToCartesian(center, center, radius - 6, arcEndAngle);

  return (
    <div className="mini-gauge needle-gauge">
      <svg viewBox="0 0 160 160" className="needle-svg">
        <path className="needle-track" d={trackPath}></path>
        {progressPath && <path className="needle-progress" d={progressPath}></path>}
        <line x1={center} y1={center} x2={needleOuter.x} y2={needleOuter.y} className="needle-pointer"></line>
        <circle cx={center} cy={center} r="6" className="needle-center"></circle>
      </svg>
      <div className="needle-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
};
