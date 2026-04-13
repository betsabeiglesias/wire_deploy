// /** @type {import('tailwindcss').Config} */
// export default {
//   // CRÍTICO: Configura 'content' para que escanee todos los archivos donde uses clases de Tailwind.
//   // Esto incluye componentes React (.jsx, .tsx) y archivos HTML.
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   darkMode: 'class',
//   theme: {
//     extend: {
//       keyframes: {
//         fadeIn: {
//           '0%': {
//             opacity: '0',
//             transform: 'translateY(4px)',
//           },
//           '100%': {
//             opacity: '1',
//             transform: 'translateY(0)',
//           },
//         },
//     },
//   },
//   plugins: [],
// }
// };

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {

      // ── Tu animación existente ──────────────────────────────────────────
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
      },

      // ── Design system tokens ────────────────────────────────────────────
      colors: {
        fg: {
          primary:   '#12141a',
          secondary: '#3b404d',
          muted:     '#565c6b',
          disabled:  '#b0b5c0',
          inverse:   '#ffffff',
          accent:    '#29468b',
        },
        surface: {
          base:    '#ffffff',
          default: '#f9f9fa',
          subtle:  '#f2f3f5',
          inset:   '#e9eaed',
          raised:  '#ffffff',
          inverse: '#22262e',
        },
        border: {
          default: '#d6d9e2',
          subtle:  '#e9eaed',
          strong:  '#b0b5c0',
          accent:  '#29468b',
        },
        accent: {
          DEFAULT: '#29468b',
          hover:   '#1f3a73',
          muted:   '#eef3ff',
          'muted-fg': '#29468b',
        },
        status: {
          'success-bg': '#edf8ef',
          'success-fg': '#2a8b4b',
          'warning-bg': '#fff8ec',
          'warning-fg': '#b45309',
          'danger-bg':  '#fef2f2',
          'danger-fg':  '#dc2626',
          'info-bg':    '#eff6ff',
          'info-fg':    '#2563eb',
          'neutral-bg': '#f2f3f5',
          'neutral-fg': '#565c6b',
        },
      },

      fontSize: {
        '3xs': ['0.5rem', { lineHeight: '1.1' }],
        '2xs':    ['0.625rem',  { lineHeight: '1.2' }],
        'xs':     ['0.6875rem', { lineHeight: '1.4' }],
        'sm':     ['0.75rem',   { lineHeight: '1.5' }],
        'base':   ['0.8125rem', { lineHeight: '1.6' }],
        'md':     ['0.9375rem', { lineHeight: '1.6' }],
        'lg':     ['1.0625rem', { lineHeight: '1.4' }],
        'xl':     ['1.125rem',  { lineHeight: '1.3' }],
        'heading':  ['1.25rem',  { lineHeight: '1.3', fontWeight: '600' }],
        'display':  ['2.125rem', { lineHeight: '1.1', fontWeight: '600' }],
      },

      letterSpacing: {
        caps:    '0.06em',
        wider:   '0.04em',
        widest:  '0.08em',
      },

      spacing: {
        'control-xs': '24px',
        'control-sm': '28px',
        'control-md': '32px',
        'control-lg': '40px',
        'topbar':     '40px',
        'sidebar-sm': '48px',
        'sidebar-md': '220px',
      },

      borderRadius: {
        'xs':  '2px',
        'sm':  '4px',
        'md':  '6px',
        'lg':  '8px',
        'xl':  '12px',
        '2xl': '16px',
      },

      boxShadow: {
        'xs':    '0 1px 2px rgba(0,0,0,0.06)',
        'sm':    '0 1px 4px rgba(0,0,0,0.08)',
        'md':    '0 2px 8px rgba(0,0,0,0.10)',
        'lg':    '0 4px 16px rgba(0,0,0,0.12)',
        'focus': '0 0 0 2px rgba(41,70,139,0.25)',
      },

      maxWidth: {
        'content': '960px',
        'wide':    '1280px',
        'full':    '1920px',
      },
    },
  },
  plugins: [],
};