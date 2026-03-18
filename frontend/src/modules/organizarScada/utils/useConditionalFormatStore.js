/**
 * useConditionalFormatStore.js
 * Store Zustand para gestionar templates de formato condicional.
 * Persiste en localStorage y sincroniza con el backend Django cuando está disponible.
 *
 * Uso básico:
 *   const template = useConditionalFormatStore(s => s.getTemplate('tpl_temperature'));
 *   const assign   = useConditionalFormatStore(s => s.assignTemplate);
 *   assign('temp_sala_1', 'tpl_temperature');
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { validateTemplate } from '@/utils/conditionalFormat';
import { EXAMPLE_TEMPLATES } from '@/utils/conditionalFormat';

// ---------------------------------------------------------------------------
// ESTADO INICIAL
// ---------------------------------------------------------------------------

const initialState = {
  /**
   * Catálogo de templates disponibles.
   * { [templateId]: ConditionalTemplate }
   */
  templates: { ...EXAMPLE_TEMPLATES },

  /**
   * Asignación tag → templateId.
   * { [tagId]: templateId }
   * Un tag solo puede tener un template activo a la vez.
   */
  tagAssignments: {},

  /** Estado de sincronización con el backend */
  syncStatus: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  syncError: null,
};

// ---------------------------------------------------------------------------
// STORE
// ---------------------------------------------------------------------------

export const useConditionalFormatStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ----------------------------------------------------------------
      // TEMPLATES — CRUD
      // ----------------------------------------------------------------

      /**
       * Obtiene un template por id.
       * @param {string} templateId
       * @returns {import('@/utils/conditionalFormat').ConditionalTemplate | null}
       */
      getTemplate(templateId) {
        return get().templates[templateId] ?? null;
      },

      /**
       * Obtiene el template asignado a un tag.
       * @param {string} tagId
       * @returns {import('@/utils/conditionalFormat').ConditionalTemplate | null}
       */
      getTemplateForTag(tagId) {
        const templateId = get().tagAssignments[tagId];
        if (!templateId) return null;
        return get().templates[templateId] ?? null;
      },

      /**
       * Añade o reemplaza un template en el catálogo.
       * Valida la estructura antes de guardar.
       * @param {import('@/utils/conditionalFormat').ConditionalTemplate} template
       * @returns {{ ok: boolean, errors: string[] }}
       */
      upsertTemplate(template) {
        const { valid, errors } = validateTemplate(template);
        if (!valid) {
          console.warn('[ConditionalFormatStore] Template inválido:', errors);
          return { ok: false, errors };
        }
        set((s) => ({
          templates: { ...s.templates, [template.id]: template },
        }));
        return { ok: true, errors: [] };
      },

      /**
       * Elimina un template del catálogo.
       * Si había tags asignados a él, se desasignan automáticamente.
       * @param {string} templateId
       */
      removeTemplate(templateId) {
        set((s) => {
          const templates = { ...s.templates };
          delete templates[templateId];

          // Limpiar asignaciones huérfanas
          const tagAssignments = Object.fromEntries(
            Object.entries(s.tagAssignments).filter(([, tid]) => tid !== templateId)
          );

          return { templates, tagAssignments };
        });
      },

      /**
       * Lista todos los templates del catálogo como array.
       * @returns {import('@/utils/conditionalFormat').ConditionalTemplate[]}
       */
      listTemplates() {
        return Object.values(get().templates);
      },

      // ----------------------------------------------------------------
      // ASIGNACIONES tag → template
      // ----------------------------------------------------------------

      /**
       * Asigna un template a un tag.
       * @param {string} tagId
       * @param {string} templateId
       */
      assignTemplate(tagId, templateId) {
        if (!get().templates[templateId]) {
          console.warn(`[ConditionalFormatStore] Template "${templateId}" no existe en el catálogo`);
          return;
        }
        set((s) => ({
          tagAssignments: { ...s.tagAssignments, [tagId]: templateId },
        }));
      },

      /**
       * Elimina la asignación de un tag.
       * @param {string} tagId
       */
      unassignTemplate(tagId) {
        set((s) => {
          const tagAssignments = { ...s.tagAssignments };
          delete tagAssignments[tagId];
          return { tagAssignments };
        });
      },

      /**
       * Asigna el mismo template a múltiples tags de una vez.
       * Útil para configuración masiva desde el editor SCADA.
       * @param {string[]} tagIds
       * @param {string}   templateId
       */
      assignTemplateToMany(tagIds, templateId) {
        if (!get().templates[templateId]) {
          console.warn(`[ConditionalFormatStore] Template "${templateId}" no existe`);
          return;
        }
        set((s) => ({
          tagAssignments: {
            ...s.tagAssignments,
            ...Object.fromEntries(tagIds.map((id) => [id, templateId])),
          },
        }));
      },

      // ----------------------------------------------------------------
      // SINCRONIZACIÓN CON BACKEND (Django API)
      // ----------------------------------------------------------------

      /**
       * Carga templates desde el backend y los fusiona con los locales.
       * Los templates del backend tienen prioridad sobre los locales.
       *
       * Endpoint esperado: GET /api/conditional-format/templates/
       * Respuesta esperada: { templates: ConditionalTemplate[], assignments: { [tagId]: templateId } }
       *
       * @param {Function} apiFetch - Función de fetch autenticada (ej: api.get de tu services/api.js)
       */
      async fetchFromBackend(apiFetch) {
        set({ syncStatus: 'loading', syncError: null });
        try {
          const data = await apiFetch('/api/conditional-format/templates/');

          const incoming = {};
          (data.templates ?? []).forEach((t) => { incoming[t.id] = t; });

          set((s) => ({
            templates: { ...s.templates, ...incoming },
            tagAssignments: { ...s.tagAssignments, ...(data.assignments ?? {}) },
            syncStatus: 'success',
          }));
        } catch (err) {
          console.error('[ConditionalFormatStore] Error al cargar desde backend:', err);
          set({ syncStatus: 'error', syncError: err?.message ?? 'Error desconocido' });
        }
      },

      /**
       * Guarda un template en el backend y lo actualiza en el store.
       *
       * Endpoint esperado: POST /api/conditional-format/templates/
       *
       * @param {import('@/utils/conditionalFormat').ConditionalTemplate} template
       * @param {Function} apiFetch
       * @returns {Promise<{ ok: boolean, errors: string[] }>}
       */
      async saveToBackend(template, apiFetch) {
        const { valid, errors } = validateTemplate(template);
        if (!valid) return { ok: false, errors };

        set({ syncStatus: 'loading', syncError: null });
        try {
          const saved = await apiFetch('/api/conditional-format/templates/', {
            method: 'POST',
            body: JSON.stringify(template),
          });
          set((s) => ({
            templates: { ...s.templates, [saved.id]: saved },
            syncStatus: 'success',
          }));
          return { ok: true, errors: [] };
        } catch (err) {
          set({ syncStatus: 'error', syncError: err?.message ?? 'Error al guardar' });
          return { ok: false, errors: [err?.message ?? 'Error al guardar'] };
        }
      },

      // ----------------------------------------------------------------
      // RESET
      // ----------------------------------------------------------------

      /**
       * Resetea el store a su estado inicial (mantiene templates de ejemplo).
       */
      reset() {
        set(initialState);
      },
    }),

    // ----------------------------------------------------------------
    // CONFIGURACIÓN DE PERSISTENCIA
    // ----------------------------------------------------------------
    {
      name: 'conditional-format-store', // clave en localStorage
      storage: createJSONStorage(() => localStorage),

      // Solo persistimos templates y asignaciones, no el estado de sync
      partialize: (s) => ({
        templates: s.templates,
        tagAssignments: s.tagAssignments,
      }),
    }
  )
);

// ---------------------------------------------------------------------------
// SELECTORES PRECOMPILADOS (para usar sin lambdas inline y evitar re-renders)
// ---------------------------------------------------------------------------

export const selectTemplates      = (s) => s.templates;
export const selectTagAssignments = (s) => s.tagAssignments;
export const selectSyncStatus     = (s) => s.syncStatus;
export const selectSyncError      = (s) => s.syncError;

/** Selector parametrizado — uso: useConditionalFormatStore(selectTemplateForTag('temp_sala_1')) */
export const selectTemplateForTag = (tagId) => (s) => {
  const templateId = s.tagAssignments[tagId];
  return templateId ? s.templates[templateId] ?? null : null;
};
