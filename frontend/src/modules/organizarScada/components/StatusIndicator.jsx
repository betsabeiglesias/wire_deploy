/**
 * StatusIndicator.jsx
 * Componente visual atómico que consume un ConditionalTemplate y renderiza
 * el estado de un tag en 4 variantes: led, badge, icon, label.
 *
 * Uso básico:
 *   <StatusIndicator value={72} template={temperatureTemplate} variant="led" />
 *
 * Uso con valor raw (sin template, pasando style directo):
 *   <StatusIndicator style={{ fillColor: '#22c55e', label: 'OK' }} variant="badge" />
 */

import { applyTemplate } from '@/utils/conditionalFormat';
import {
  Flame, AlertTriangle, CheckCircle2, Snowflake,
  Play, Square, AlertCircle, HelpCircle,
  ThermometerSun, Zap, Wifi, WifiOff,
  ArrowUp, ArrowDown, Minus,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// MAPA DE ICONOS
// Añade aquí los que necesites — la clave es el string que pones en rule.style.icon
// ---------------------------------------------------------------------------
const ICON_MAP = {
  flame:     Flame,
  warning:   AlertTriangle,
  check:     CheckCircle2,
  snowflake: Snowflake,
  play:      Play,
  stop:      Square,
  alert:     AlertCircle,
  unknown:   HelpCircle,
  thermo:    ThermometerSun,
  zap:       Zap,
  wifi:      Wifi,
  'wifi-off': WifiOff,
  'arrow-up':   ArrowUp,
  'arrow-down': ArrowDown,
  minus:     Minus,
};

// ---------------------------------------------------------------------------
// ANIMACIÓN DE PARPADEO (CSS-in-JS inline — sin dependencias externas)
// ---------------------------------------------------------------------------
const BLINK_STYLE = `
  @keyframes si-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.2; }
  }
  .si-blink { animation: si-blink 1s ease-in-out infinite; }
`;

let styleInjected = false;
function injectBlinkStyle() {
  if (styleInjected || typeof document === 'undefined') return;
  const tag = document.createElement('style');
  tag.textContent = BLINK_STYLE;
  document.head.appendChild(tag);
  styleInjected = true;
}

// ---------------------------------------------------------------------------
// HELPER: resuelve el icono Lucide a partir del string en style.icon
// ---------------------------------------------------------------------------
function ResolvedIcon({ name, size = 14, color, className }) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} className={className} strokeWidth={2.2} />;
}

// ---------------------------------------------------------------------------
// VARIANTE: LED  (círculo luminoso con glow)
// ---------------------------------------------------------------------------
function LedVariant({ resolvedStyle, size = 'md', className = '' }) {
  const sizes = { sm: 10, md: 14, lg: 20, xl: 28 };
  const px = sizes[size] ?? sizes.md;

  const fill = resolvedStyle.fillColor ?? '#6b7280';
  const border = resolvedStyle.borderColor ?? fill;

  return (
    <span
      title={resolvedStyle.label}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <span
        className={resolvedStyle.blink ? 'si-blink' : ''}
        style={{
          display: 'inline-block',
          width: px,
          height: px,
          borderRadius: '50%',
          backgroundColor: fill,
          border: `2px solid ${border}`,
          boxShadow: `0 0 ${px * 0.6}px ${px * 0.3}px ${fill}88`,
          flexShrink: 0,
        }}
      />
      {resolvedStyle.label && (
        <span style={{ fontSize: px * 0.85, color: fill, fontWeight: 600, letterSpacing: '0.02em' }}>
          {resolvedStyle.label}
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// VARIANTE: BADGE  (píldora con fondo coloreado)
// ---------------------------------------------------------------------------
function BadgeVariant({ resolvedStyle, size = 'md', className = '' }) {
  const fontSizes = { sm: 10, md: 12, lg: 14, xl: 16 };
  const paddings  = { sm: '2px 7px', md: '3px 10px', lg: '4px 13px', xl: '5px 16px' };

  const fill   = resolvedStyle.fillColor ?? '#6b7280';
  const border = resolvedStyle.borderColor ?? fill;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${resolvedStyle.blink ? 'si-blink' : ''} ${className}`}
      style={{
        backgroundColor: `${fill}22`,
        border: `1.5px solid ${border}`,
        borderRadius: 6,
        padding: paddings[size] ?? paddings.md,
        fontSize: fontSizes[size] ?? fontSizes.md,
        fontWeight: 600,
        color: fill,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {resolvedStyle.icon && (
        <ResolvedIcon name={resolvedStyle.icon} size={(fontSizes[size] ?? 12) + 2} color={fill} />
      )}
      {resolvedStyle.label ?? '—'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// VARIANTE: ICON  (solo icono, con tooltip)
// ---------------------------------------------------------------------------
function IconVariant({ resolvedStyle, size = 'md', className = '' }) {
  const sizes = { sm: 14, md: 18, lg: 24, xl: 32 };
  const px = sizes[size] ?? sizes.md;
  const fill = resolvedStyle.fillColor ?? '#6b7280';

  if (!resolvedStyle.icon) {
    // Fallback: círculo pequeño si no hay icono definido
    return <LedVariant resolvedStyle={resolvedStyle} size={size} className={className} />;
  }

  return (
    <span
      title={resolvedStyle.label}
      className={`inline-flex items-center justify-center ${resolvedStyle.blink ? 'si-blink' : ''} ${className}`}
    >
      <ResolvedIcon name={resolvedStyle.icon} size={px} color={fill} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// VARIANTE: LABEL  (solo texto coloreado)
// ---------------------------------------------------------------------------
function LabelVariant({ resolvedStyle, size = 'md', className = '' }) {
  const fontSizes = { sm: 11, md: 13, lg: 15, xl: 18 };
  const fill = resolvedStyle.fillColor ?? '#6b7280';

  return (
    <span
      className={`inline-block ${resolvedStyle.blink ? 'si-blink' : ''} ${className}`}
      style={{
        color: fill,
        fontSize: fontSizes[size] ?? fontSizes.md,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {resolvedStyle.label ?? '—'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------

/**
 * @param {Object}  props
 * @param {number|string}             props.value          - Valor actual del tag
 * @param {import('@/utils/conditionalFormat').ConditionalTemplate} [props.template] - Template a aplicar
 * @param {Object}  [props.style]     - Estilo directo (bypass del template, útil para testing)
 * @param {'led'|'badge'|'icon'|'label'} [props.variant]  - Forma visual (default: 'led')
 * @param {'sm'|'md'|'lg'|'xl'}      [props.size]         - Tamaño (default: 'md')
 * @param {string}  [props.className] - Clases Tailwind extra
 */
export default function StatusIndicator({
  value,
  template,
  style: styleOverride,
  variant = 'led',
  size = 'md',
  className = '',
}) {
  injectBlinkStyle();

  // Resolución de estilo: override directo > template evaluado > vacío
  const resolvedStyle = styleOverride ?? (template ? applyTemplate(value, template) : {});

  const props = { resolvedStyle, size, className };

  switch (variant) {
    case 'badge': return <BadgeVariant {...props} />;
    case 'icon':  return <IconVariant  {...props} />;
    case 'label': return <LabelVariant {...props} />;
    case 'led':
    default:      return <LedVariant   {...props} />;
  }
}
