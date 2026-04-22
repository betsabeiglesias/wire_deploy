---
name: diseno-frontend
description: Sistema de diseño corporativo-industrial para cualquier interfaz frontend. Usar cuando el usuario pida crear, diseñar o maquetar interfaces, componentes, páginas, dashboards, formularios, tablas, listados, navegación, modales o cualquier elemento de UI. Aplica un sistema de diseño consistente con paleta azul corporativa, tipografía compacta, espaciado de 8px base y componentes de alta densidad informativa.
---

# Sistema de Diseño Corporativo-Industrial

Este sistema de diseño define una estética corporativa-industrial de alta precisión: **compacta, clara y funcional**. El objetivo es densidad informativa máxima sin sacrificar legibilidad. Ideal para aplicaciones de gestión, dashboards, paneles de control, herramientas internas, ERPs, CRMs, monitorizaciones y cualquier interfaz orientada a datos.

---

## Stack Tecnológico

- **CSS**: Tailwind CSS v4 (`@import "tailwindcss"` en index.css, sin tailwind.config.js)
- **Framework**: React (compatible con Vue o HTML/CSS puro)
- **Iconos**: `lucide-react` — nunca usar otros paquetes de iconos
- **Animaciones**: `framer-motion` para interacciones (solo cuando sea necesario)
- **Gráficos**: `recharts` si se requieren visualizaciones

---

## 1. Paleta de Colores

### Colores de Marca (Azul Corporativo)
```
Primario principal:  #29468B  → Headers, botones de acción, acentos de marca
Primario oscuro:     #1F3A73  → Hover de botón primario, estados activos
Primario gráficos:   #315C9B  → Líneas y series en gráficos
Azul gris:           #4A5F7B  → Series secundarias en gráficos
Cian oscuro:         #4B88A9  → Series terciarias en gráficos
Cian claro:          #79A9D1  → Series cuaternarias, agua, fluidos
Azul activo rail:    #EEF3FF  → Fondo de botón activo en navegación lateral
```

### Fondos
```
Fondo exterior:      #E9EAED  → Pantalla/viewport completo
Fondo contenedor:    #EFEFEF  → Contenedor principal de la app
Fondo paneles:       #F2F3F5  → Paneles y secciones
Fondo cards:         #F9F9FA  → Tarjetas y componentes
Fondo KPI cards:     #FBFBFC  → Tarjetas de métricas destacadas
Fondo table header:  #EEF2F8  → Cabeceras de tabla
Fondo alt. tabla:    #F8FAFC  → Filas alternas en tabla (slate-50)
Blanco:              #FFFFFF  → Fondos limpios, modales, dropdowns
```

### Texto (Escala Slate de Tailwind)
```
slate-900  #0F172A  → Valores numéricos grandes, datos críticos
slate-800  #1E293B  → Títulos de sección
slate-700  #334155  → Texto body principal
slate-600  #475569  → Texto secundario, labels
slate-500  #64748B  → Texto auxiliar, placeholders
slate-400  #94A3B8  → Texto desactivado, iconos inactivos
```

### Bordes
```
Borde cards:         #D6D9E2  → KPI cards, componentes destacados
Borde paneles:       #CED5DF  → Secciones y contenedores
Borde tooltips:      #C9CDD4  → Tooltips y popovers
Borde contenedores:  #C7CED8  → Contenedores de imágenes/media
Borde grids:         #D8DCE2  → CartesianGrid en gráficos
slate-300  #CBD5E1  → Bordes generales estándar
slate-200  #E2E8F0  → Bordes suaves, separadores
slate-100  #F1F5F9  → Bordes muy ligeros, filas de tabla
```

### Estado Operativo
```
Verde texto:         #2A8B4B  → Texto estado "operativo/activo"
Verde fondo:         #EDF8EF  → Fondo badge "operativo/activo"
```

### Gradientes
```css
/* Fondo de planos/mapas */
background: linear-gradient(180deg, #E1E5EB 0%, #D7DBE2 100%);

/* Contenedores de imágenes */
background: linear-gradient(180deg, #F1F4F8 0%, #DBE1E9 100%);
```

---

## 2. Tipografía

**Familia**: Sistema sans-serif de Tailwind (stack por defecto). No importar Google Fonts a menos que sea explícitamente requerido.

### Escala de Tamaños
```
8px   → Micro badges de estado, etiquetas de espacio mínimo
9px   → Ejes de gráficos, labels en grids muy compactos
10px  → Títulos de sección (UPPERCASE + semibold), labels de unidad
11px  → Botones, menú lateral, texto de controles
12px  → Body principal: celdas de tabla, inputs, texto general
13px  → Body ligeramente ampliado para lectura cómoda
15px  → Responsive md: body en pantallas grandes
17px  → Branding, nombre de aplicación
18px  → Valores KPI medianos
34px  → Valores KPI grandes, indicadores de máquina
```

### Pesos
```
400 (normal)    → Textos base implícitos
500 (medium)    → Títulos secundarios, labels importantes
600 (semibold)  → Títulos de sección, labels destacados, valores KPI
700 (bold)      → Valores en badges, números críticos
800 (extrabold) → Logo y nombre de aplicación
```

### Patrones de Uso
```
Título de sección:   10px · semibold · UPPERCASE · letter-spacing: 0.05em · slate-600
Subtítulo header:    13px · medium   · UPPERCASE · letter-spacing: 0.08em · white
Nombre de app:       17px · extrabold · tracking-wide · white
Body tabla/input:    12px · normal   · slate-700
Label/unidad:        10-11px · semibold · slate-500
Valor KPI pequeño:   18px · semibold · slate-900
Valor KPI grande:    34px · semibold · slate-900
Badge de estado:     8px  · bold     · color según estado
```

---

## 3. Espaciado (Base 8px)

```
4px   (1 unit)  → Micro separación, gap entre icono y label
8px   (2 units) → Padding estándar de cards y paneles
12px  (3 units) → Padding generoso en cards con más contenido
16px  (4 units) → Padding horizontal del header
```

### Padding por Componente
```
Header principal:     px-4 (16px horizontal)
Cards estándar:       p-2 (8px)
Cards KPI:            p-3 (12px)
Celdas de tabla:      px-2 py-2 (8px horizontal, 8px vertical)
Inputs y selects:     px-2 (8px) + pl-8 si tiene icono
Sidebar:              py-4 (16px vertical)
Badges:               px-1.5 py-[2px]
```

### Gap entre Elementos
```
gap-1 (4px)  → Elementos muy cercanos: icono + texto, badge + label
gap-2 (8px)  → Espaciado estándar entre cards y entre filas
gap-3 (12px) → Espaciado generoso en grids de componentes
```

---

## 4. Bordes y Radios

### Border Radius
```
rounded-[2px] → Sutilísimo: header, indicadores de color en leyendas
rounded-[4px] → Estándar: cards, inputs, selects, botones, badges
rounded-[6px] → Elevado: KPI cards, tooltips, popovers
rounded-[8px] → Contenedores media: imágenes de producto/máquina
rounded-full  → Botones pill: filtros, tabs, toggles de tipo
```

### Bordes
```css
/* Estándar (la mayoría de componentes) */
border: 1px solid var(--border-color);

/* Divisores de tabla */
border-bottom: 1px solid theme(colors.slate.100);

/* Separador sidebar */
border-right: 1px solid theme(colors.slate.300);
```

---

## 5. Sombras

```
shadow-[0_1px_2px_rgba(0,0,0,0.06)]  → KPI cards (muy sutil, casi plana)
shadow-sm                              → Header, elementos de barra
shadow                                 → Componentes flotantes, botones de mapa
shadow-lg                              → Tooltips, popovers, dropdowns activos
shadow-inner                           → Fondos de planos/mapas, áreas recesadas
```

---

## 6. Componentes: Patrones de Implementación

### Top Bar / Header
```jsx
<header className="h-[36px] bg-[#29468B] flex items-center justify-between px-4 shadow-sm rounded-t-[2px]">
  {/* Izquierda: botón menú + título */}
  <div className="flex items-center gap-2">
    <button className="text-white/90 hover:text-white">
      <Menu className="h-5 w-5" />
    </button>
    <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-white">
      TÍTULO APLICACIÓN
    </span>
  </div>
  {/* Derecha: logo o acciones */}
  <span className="text-[17px] font-extrabold tracking-wide text-white">MARCA</span>
</header>
```

### Left Rail / Sidebar de Navegación
```jsx
<nav className="w-[44px] bg-white border-r border-slate-300 flex flex-col items-center py-4 gap-2 h-full">
  <NavButton icon={Home} active={view === 'home'} onClick={() => setView('home')} />
  <NavButton icon={BarChart3} active={view === 'charts'} onClick={() => setView('charts')} />
  <NavButton icon={Settings} active={view === 'settings'} onClick={() => setView('settings')} />
</nav>

// NavButton component
const NavButton = ({ icon: Icon, active, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className={`h-9 w-9 rounded flex items-center justify-center text-[#29468B]
      ${active ? 'bg-[#EEF3FF]' : 'hover:bg-slate-100'}`}
  >
    <Icon className="h-5 w-5" />
  </motion.button>
);
```

### KPI Card
```jsx
<div className="rounded-[6px] border border-[#D6D9E2] bg-[#FBFBFC] p-3
  shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex flex-col gap-1">
  <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
    TÍTULO MÉTRICA
  </span>
  <div className="flex items-end gap-1">
    <span className="text-[18px] font-semibold text-slate-900">0.00</span>
    <span className="text-[11px] font-semibold text-slate-500 pb-[2px]">unidad</span>
  </div>
</div>
```

### Card / Panel Genérico
```jsx
<div className="rounded-[4px] border border-slate-300 bg-[#F9F9FA] p-2">
  <h3 className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600 mb-2">
    TÍTULO PANEL
  </h3>
  {/* contenido */}
</div>
```

### Tabla de Datos
```jsx
<table className="w-full text-[12px]">
  <thead>
    <tr className="bg-[#EEF2F8] text-slate-700">
      <th className="px-2 py-2 font-semibold text-left border-b border-slate-200">Columna</th>
    </tr>
  </thead>
  <tbody>
    {rows.map((row, i) => (
      <tr key={i}
        className={`hover:bg-blue-50 border-b border-slate-100
          ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
        <td className="px-2 py-2 text-slate-700">{row.value}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Input con Icono
```jsx
<div className="relative">
  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <input
    className="h-8 w-full pl-8 pr-2 text-[12px] border border-slate-300 rounded
      outline-none text-slate-700 placeholder:text-slate-400 bg-white
      focus:border-[#29468B] focus:ring-1 focus:ring-[#29468B]/20"
    placeholder="Buscar..."
  />
</div>
```

### Select
```jsx
<div className="relative">
  <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
  <select className="h-8 pl-8 pr-7 text-[12px] border border-slate-300 rounded
    outline-none text-slate-700 bg-white appearance-none
    focus:border-[#29468B]">
    <option>Opción</option>
  </select>
</div>
```

### Botones

**Primario (acción principal):**
```jsx
<button className="h-8 px-3 text-[11px] font-medium bg-[#29468B] text-white
  rounded-[4px] hover:bg-[#1F3A73] transition-colors">
  Acción
</button>
```

**Secundario (filtros / tabs pill):**
```jsx
<button className={`h-7 px-3 text-[11px] rounded-full border transition-colors
  ${active
    ? 'bg-[#1F3A73] text-white border-[#1F3A73]'
    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
  }`}>
  Filtro
</button>
```

### Badge de Estado
```jsx
// Operativo/Activo
<span className="text-[8px] font-bold px-1.5 py-[2px] rounded-[4px]
  bg-[#EDF8EF] text-[#2A8B4B]">
  OPERATIVO
</span>

// Inactivo/Error (adaptar colores según el estado)
<span className="text-[8px] font-bold px-1.5 py-[2px] rounded-[4px]
  bg-slate-100 text-slate-500">
  INACTIVO
</span>
```

### Modal / Tooltip / Popover
```jsx
<div className="rounded-[6px] border border-[#C9CDD4] bg-white shadow-lg p-2
  min-w-[118px]">
  <p className="text-[10px] font-semibold text-slate-800 mb-1">TÍTULO</p>
  <div className="flex items-center gap-1 text-[9px] text-slate-600">
    <Activity className="h-3 w-3 text-slate-400" />
    <span>Detalle</span>
  </div>
</div>
```

---

## 7. Layout y Grid

### Estructura Principal
```jsx
// Layout de aplicación completa (no scroll, pantalla completa)
<div className="h-screen w-screen bg-[#E9EAED] overflow-hidden flex flex-col">
  <TopBar />                                    {/* h-[36px] */}
  <div className="flex flex-1 overflow-hidden">
    <LeftRail />                                {/* w-[44px] */}
    <main className="flex-1 bg-[#EFEFEF] p-2 overflow-auto">
      {/* contenido */}
    </main>
  </div>
</div>
```

### Grids Habituales
```jsx
// 4 KPI cards en fila
<div className="grid grid-cols-4 gap-2">

// Dos columnas simétricas
<div className="grid grid-cols-2 gap-2">

// Dos columnas proporcionales (izquierda más ancha)
<div className="grid grid-cols-[1.05fr_1fr] gap-2">

// Layout con tabla + panel lateral
<div className="grid grid-cols-[1fr_1.05fr] gap-2">
```

### Max Width y Responsive
```css
max-w-[1920px] mx-auto   /* contenedor principal */

/* breakpoint tablet/móvil */
@media (max-width: 1024px) {
  flex-direction: column;
  padding: 20px;
  gap: 18px;
}
```

---

## 8. Iconos (lucide-react)

Tamaños estandarizados:
```
h-3 w-3  (12px) → Info inline, dentro de badges o cells
h-4 w-4  (16px) → Estándar: inputs, filas de tabla, acciones
h-5 w-5  (20px) → Header, botones prominentes
h-9 w-9  (36px) → Botones de navigation rail (solo el área, icono interior h-5)
```

Iconos recomendados por contexto:
```
Navegación:      Home, BarChart3, Settings, ArrowLeft
Datos/métricas:  Activity, TrendingUp, TrendingDown, Gauge
Filtros/tabla:   Filter, Search, SlidersHorizontal, ArrowUpDown
Alertas/estado:  CheckCircle2, XCircle, AlertTriangle, Info
Fechas:          Calendar, CalendarRange, Clock
Industrial:      Factory, Zap, Droplets, Thermometer, Gauge
```

---

## 9. Animaciones y Transiciones

```css
/* Transición estándar para hover y estados */
transition: all 0.3s ease;
transition: border-color 0.3s;
transition: box-shadow 0.3s;
```

```jsx
// Hover sutil en elementos interactivos del canvas
<motion.button whileHover={{ scale: 1.02 }}>

// Aparición de paneles o modales
<motion.div
  initial={{ opacity: 0, y: 4 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15 }}
>
```

**Reglas de animación:**
- Duración máxima 0.3s para interacciones de UI
- Preferir `opacity` + `transform` (GPU-accelerated)
- Solo `framer-motion` donde el CSS puro no alcance
- No animar elementos de datos que cambian frecuentemente

---

## 10. Gráficos (Recharts)

```jsx
// Colores de series estandarizados
const CHART_COLORS = {
  primary:   '#315C9B',  // Serie principal (electricidad, dato 1)
  secondary: '#4A5F7B',  // Serie secundaria
  tertiary:  '#4B88A9',  // Serie terciaria
  quaternary:'#79A9D1',  // Serie cuaternaria (agua, dato 4)
  dark:      '#1E2B39',  // Serie oscura de contraste
};

// CartesianGrid estándar
<CartesianGrid strokeDasharray="3 3" stroke="#D8DCE2" />

// Ejes estándar
<XAxis tick={{ fontSize: 10, fill: '#64748B' }} />
<YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
```

---

## 11. Principios de Diseño

1. **Densidad controlada**: La información debe ser compacta pero nunca ilegible. Usar 12px como mínimo para texto que el usuario leerá.
2. **Jerarquía por peso y tamaño**: No por color. El color es para marca y estados, no para jerarquía tipográfica.
3. **Bordes ligeros, no sombras pesadas**: Las sombras fuertes rompen la limpieza industrial. Usar `shadow-sm` o `shadow-[0_1px_2px_rgba(0,0,0,0.06)]`.
4. **Grises Slate**: Toda la escala de neutrales debe venir de la paleta Slate de Tailwind. No inventar grises personalizados.
5. **Azul corporativo como ancla**: El `#29468B` debe aparecer en headers, botones primarios y acentos. Nada más domina visualmente.
6. **UPPERCASE para secciones**: Los títulos de sección siempre en uppercase con letter-spacing de 0.05em. Crea escaneabilidad.
7. **Sin scroll si es posible**: Las interfaces de gestión y monitorización deben caber en pantalla. Usar `h-screen overflow-hidden` y gestionar el overflow localmente.
8. **Consistencia de radios**: No mezclar radios. Inputs y cards → 4px. KPI cards → 6px. Media → 8px. Pills → full.

---

## Cómo Aplicar Esta Skill

Cuando el usuario pida crear o modificar cualquier interfaz frontend:

1. **Identifica el tipo de UI**: ¿Dashboard? ¿Formulario? ¿Listado? ¿Perfil? ¿Configuración? Adapta el layout.
2. **Aplica el sistema de colores completo**: Primarios de marca, escala Slate para textos, fondos de la paleta definida.
3. **Usa los componentes de la sección 6** como base, adaptando el contenido.
4. **Respeta el espaciado base-8**: Todos los valores de padding/margin/gap deben ser múltiplos de 4px (preferiblemente de 8px).
5. **Tailwind v4**: Usa clases estándar de Tailwind. Para valores custom usa la notación `[valor]` (ej: `text-[10px]`, `bg-[#29468B]`).
6. **Lucide-react para todos los iconos**: Nunca emojis ni otros paquetes.
7. **Prioriza funcionalidad sobre decoración**: Esta estética es de herramienta profesional, no de landing page. Nada de gradientes de colores vivos, efectos glassmorphism ni fuentes display.
