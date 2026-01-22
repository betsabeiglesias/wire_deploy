// frontend/src/utils/configUtils.js

/**
 * 🔥 Sistema de detección de cambios en configuración
 * 
 * Marca cuando hay cambios pendientes (PLCs o tags modificados)
 * para habilitar el botón "Aplicar configuración"
 */

export const markConfigDirty = () => {
  localStorage.setItem('configDirty', 'true');
  window.dispatchEvent(new Event('configChanged'));
};

export const markConfigClean = () => {
  localStorage.removeItem('configDirty');
  window.dispatchEvent(new Event('configChanged'));
};

export const isConfigDirty = () => {
  return localStorage.getItem('configDirty') === 'true';
};