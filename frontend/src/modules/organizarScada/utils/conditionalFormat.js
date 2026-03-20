// src/modules/organizarScada/engine/conditionalFormat.js

/**
 * conditionalFormat.js
 * Lógica pura para evaluar reglas de formato condicional sobre valores de tags.
 * Agnóstica de React — usable desde cualquier componente o hook.
 */

// ---------------------------------------------------------------------------
// TIPOS (documentados como JSDoc para autocompletado sin TypeScript)
// ---------------------------------------------------------------------------

/**
 * @typedef {'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'contains'} Operator
 *
 * @typedef {Object} ConditionalRule
 * @property {Operator}      operator      - Operador de comparación
 * @property {number|string} value         - Valor de referencia
 * @property {number}        [valueTo]     - Solo para 'between': límite superior
 * @property {Object}        style         - Estilos a aplicar si se cumple la condición
 * @property {string}        [style.fillColor]    - Color de fondo / fill  (ej: '#ef4444')
 * @property {string}        [style.borderColor]  - Color de borde          (ej: '#dc2626')
 * @property {string}        [style.icon]         - Nombre o path del icono (ej: 'warning')
 * @property {string}        [style.label]        - Texto a mostrar          (ej: 'ALARMA')
 * @property {boolean}       [style.blink]        - Activa animación de parpadeo
 *
 * @typedef {Object} ConditionalTemplate
 * @property {string}           id       - Identificador único del template
 * @property {string}           name     - Nombre legible (ej: 'Semáforo temperatura')
 * @property {ConditionalRule[]} rules   - Lista de reglas, evaluadas en orden
 * @property {Object}           [defaultStyle] - Estilo si ninguna regla se cumple
 */

// ---------------------------------------------------------------------------
// OPERADORES
// ---------------------------------------------------------------------------

/**
 * Evalúa un único operador entre un valor real y el valor de referencia de la regla.
 * @param {number|string} actual   - Valor actual del tag
 * @param {ConditionalRule} rule
 * @returns {boolean}
 */
export function evaluateOperator(actual, rule) {
  const { operator, value, valueTo } = rule;

  switch (operator) {
    case 'eq':
      return actual === value;
    case 'neq':
      return actual !== value;
    case 'gt':
      return actual > value;
    case 'gte':
      return actual >= value;
    case 'lt':
      return actual < value;
    case 'lte':
      return actual <= value;
    case 'between':
      // Inclusivo en ambos extremos: [value, valueTo]
      return actual >= value && actual <= valueTo;
    case 'contains':
      return String(actual).includes(String(value));
    default:
      console.warn(`[conditionalFormat] Operador desconocido: "${operator}"`);
      return false;
  }
}

// ---------------------------------------------------------------------------
// EVALUADOR PRINCIPAL
// ---------------------------------------------------------------------------

/**
 * Dado un valor y un template, devuelve el estilo resultante de la primera
 * regla que se cumpla (orden de prioridad = orden del array).
 * Si ninguna regla se cumple, devuelve defaultStyle o un objeto vacío.
 *
 * @param {number|string}       value    - Valor actual del tag
 * @param {ConditionalTemplate} template
 * @returns {ConditionalRule['style']}
 */
export function applyTemplate(value, template) {
  if (!template || !Array.isArray(template.rules)) return {};

  for (const rule of template.rules) {
    if (evaluateOperator(value, rule)) {
      return rule.style ?? {};
    }
  }

  return template.defaultStyle ?? {};
}

/**
 * Aplica múltiples templates en orden y fusiona los estilos resultantes.
 * El último template con un campo concreto "gana" (Object.assign).
 * Útil si en el futuro un tag puede tener más de un template activo.
 *
 * @param {number|string}         value
 * @param {ConditionalTemplate[]} templates
 * @returns {ConditionalRule['style']}
 */
export function applyTemplates(value, templates) {
  return templates.reduce((merged, template) => {
    return { ...merged, ...applyTemplate(value, template) };
  }, {});
}

// ---------------------------------------------------------------------------
// HELPERS DE VALIDACIÓN
// ---------------------------------------------------------------------------

/**
 * Valida que una regla tiene la estructura mínima necesaria.
 * @param {ConditionalRule} rule
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRule(rule) {
  const errors = [];

  if (!rule.operator) errors.push('Falta el campo "operator"');
  if (rule.value === undefined) errors.push('Falta el campo "value"');
  if (rule.operator === 'between' && rule.valueTo === undefined) {
    errors.push('"between" requiere el campo "valueTo"');
  }
  if (rule.operator === 'between' && rule.value > rule.valueTo) {
    errors.push('"value" debe ser menor o igual que "valueTo" en between');
  }
  if (!rule.style || Object.keys(rule.style).length === 0) {
    errors.push('La regla no tiene ningún estilo definido');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida un template completo.
 * @param {ConditionalTemplate} template
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTemplate(template) {
  const errors = [];

  if (!template.id) errors.push('Falta el campo "id"');
  if (!template.name) errors.push('Falta el campo "name"');
  if (!Array.isArray(template.rules) || template.rules.length === 0) {
    errors.push('El template debe tener al menos una regla');
  } else {
    template.rules.forEach((rule, i) => {
      const { errors: ruleErrors } = validateRule(rule);
      ruleErrors.forEach((e) => errors.push(`Regla[${i}]: ${e}`));
    });
  }

  return { valid: errors.length === 0, errors };
}
