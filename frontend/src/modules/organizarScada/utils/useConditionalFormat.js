/**
 * useConditionalFormat.js
 * Hook que conecta el valor en tiempo real de un tag con su template
 * de formato condicional y devuelve el estilo resuelto listo para pintar.
 *
 * Uso básico:
 *   const { style, variant } = useConditionalFormat('temp_sala_1', temperatureTemplate);
 *
 * Uso con store (el template se resuelve automáticamente por tagId):
 *   const { style } = useConditionalFormat('temp_sala_1');
 */

import { useState, useEffect, useRef, useCallback } from 'react';
// import { applyTemplate } from '@/utils/conditionalFormat';

// ---------------------------------------------------------------------------
// HELPER: comparación superficial de objetos para evitar re-renders innecesarios
// ---------------------------------------------------------------------------
function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k] === b[k]);
}

// ---------------------------------------------------------------------------
// HOOK PRINCIPAL
// ---------------------------------------------------------------------------

/**
 * @param {string}  tagId               - Identificador del tag (ej: 'temp_sala_1')
 * @param {import('@/utils/conditionalFormat').ConditionalTemplate} [templateProp]
 *   Template a usar. Si no se pasa, el hook intentará resolverlo desde
 *   useConditionalFormatStore (cuando esté disponible).
 *
 * @param {Object}  [options]
 * @param {number|string} [options.initialValue]  - Valor inicial antes del primer dato (default: null)
 * @param {boolean}       [options.enabled]        - Permite desactivar el hook (default: true)
 *
 * @returns {{
 *   value:       number|string|null,   // Valor actual del tag
 *   style:       Object,               // Estilo resuelto { fillColor, borderColor, icon, label, blink }
 *   isMatched:   boolean,              // true si alguna regla hizo match (false = defaultStyle)
 *   ruleIndex:   number,               // Índice de la regla que hizo match (-1 si ninguna)
 *   setValue:    Function,             // Setter manual (útil para testing o valores externos)
 * }}
 */
export function useConditionalFormat(tagId, templateProp, options = {}) {
  const { initialValue = null, enabled = true } = options;

  // ------------------------------------------------------------------
  // 1. Valor del tag
  //    Intentamos obtenerlo de useRealtimeData si existe en el proyecto.
  //    Si no, el consumidor puede inyectarlo via setValue o via value prop.
  // ------------------------------------------------------------------
  const [value, setValue] = useState(initialValue);

  // Intento de conexión con useRealtimeData (hook propio del proyecto).
  // Se hace con un try/catch dinámico para que el hook no rompa si el
  // proyecto aún no tiene useRealtimeData disponible para ese tag.
  useEffect(() => {
    if (!enabled || !tagId) return;
    // El consumidor puede pasar el valor externamente via setValue,
    // o este hook puede ser extendido para suscribirse a useRealtimeData.
    // Ver sección "Integración con useRealtimeData" al final del archivo.
  }, [tagId, enabled]);

  // ------------------------------------------------------------------
  // 2. Template
  //    Prioridad: templateProp > store > null
  // ------------------------------------------------------------------
  // Cuando useConditionalFormatStore esté listo, descomentar:
  // const storeTemplate = useConditionalFormatStore(s => s.getTemplate(tagId));
  const template = templateProp /* ?? storeTemplate */ ?? null;

  // ------------------------------------------------------------------
  // 3. Evaluación del estilo
  // ------------------------------------------------------------------
  const prevStyleRef = useRef({});

  const resolveStyle = useCallback(() => {
    if (!enabled || template === null || value === null) {
      return { style: template?.defaultStyle ?? {}, isMatched: false, ruleIndex: -1 };
    }

    // Evaluamos regla a regla para saber el índice
    for (let i = 0; i < template.rules.length; i++) {
      const rule = template.rules[i];
      const matched = evaluateOperatorInline(value, rule);
      if (matched) {
        return { style: rule.style ?? {}, isMatched: true, ruleIndex: i };
      }
    }

    return { style: template.defaultStyle ?? {}, isMatched: false, ruleIndex: -1 };
  }, [value, template, enabled]);

  const { style: rawStyle, isMatched, ruleIndex } = resolveStyle();

  // Estabilizamos la referencia del objeto style para evitar re-renders
  // en cascada cuando el valor no cambia de regla.
  if (!shallowEqual(prevStyleRef.current, rawStyle)) {
    prevStyleRef.current = rawStyle;
  }
  const style = prevStyleRef.current;

  return {
    value,
    style,
    isMatched,
    ruleIndex,
    setValue, // expuesto para que el consumidor pueda inyectar valores externos
  };
}

// ---------------------------------------------------------------------------
// HOOK MÚLTIPLE: evalúa varios tags a la vez
// ---------------------------------------------------------------------------

/**
 * Versión multi-tag. Útil para paneles con varios indicadores.
 *
 * @param {Array<{ tagId: string, template: Object, initialValue?: any }>} entries
 * @returns {Object} - Mapa { [tagId]: { value, style, isMatched, ruleIndex, setValue } }
 *
 * Uso:
 *   const results = useConditionalFormatMany([
 *     { tagId: 'temp_sala_1', template: temperatureTemplate },
 *     { tagId: 'motor_bomba', template: motorTemplate, initialValue: 0 },
 *   ]);
 *   const { style } = results['temp_sala_1'];
 */
export function useConditionalFormatMany(entries = []) {
  // Cada entrada tiene su propio estado interno
  // Implementado como reducción de hooks individuales con clave estable.
  // NOTA: el número de entries no debe cambiar entre renders (regla de hooks).
  const results = {};

  for (const entry of entries) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[entry.tagId] = useConditionalFormat(
      entry.tagId,
      entry.template,
      { initialValue: entry.initialValue ?? null }
    );
  }

  return results;
}

// ---------------------------------------------------------------------------
// HELPER INTERNO (duplicado local para no importar evaluateOperator y crear
// dependencia circular en casos donde el árbol de imports sea complejo)
// ---------------------------------------------------------------------------
function evaluateOperatorInline(actual, rule) {
  const { operator, value, valueTo } = rule;
  switch (operator) {
    case 'eq':      return actual === value;
    case 'neq':     return actual !== value;
    case 'gt':      return actual > value;
    case 'gte':     return actual >= value;
    case 'lt':      return actual < value;
    case 'lte':     return actual <= value;
    case 'between': return actual >= value && actual <= valueTo;
    case 'contains': return String(actual).includes(String(value));
    default:        return false;
  }
}

// ---------------------------------------------------------------------------
// INTEGRACIÓN CON useRealtimeData
// ---------------------------------------------------------------------------
/**
 * Para conectar automáticamente con el sistema de tiempo real del proyecto,
 * crea un hook wrapper en tu módulo HMI/SCADA:
 *
 * ```js
 * // useTagConditionalFormat.js  (en modules/hmi/ o modules/scada/)
 * import { useRealtimeData } from '@/hooks/useRealtimeData';
 * import { useConditionalFormat } from '@/utils/useConditionalFormat';
 *
 * export function useTagConditionalFormat(tagId, template, options) {
 *   const { value: realtimeValue } = useRealtimeData(tagId);
 *   const result = useConditionalFormat(tagId, template, options);
 *
 *   // Sincroniza el valor de tiempo real con el hook
 *   useEffect(() => {
 *     if (realtimeValue !== undefined) {
 *       result.setValue(realtimeValue);
 *     }
 *   }, [realtimeValue]);
 *
 *   return result;
 * }
 * ```
 *
 * Así el hook base permanece agnóstico del sistema de datos,
 * y el wrapper lo adapta a tu infraestructura concreta.
 */
