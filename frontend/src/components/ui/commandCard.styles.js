import { cva } from "class-variance-authority";

// 1. Estilo principal de la tarjeta (fondo y bordes)
export const cardStyles = cva(
  // Clases base (transiciones, layout, sombras)
  "group overflow-hidden rounded-[28px] border p-6 text-left transition hover:-translate-y-1 hover:shadow-[0_24px_54px_-32px_rgba(0,0,0,0.24)]",
  {
    variants: {
      variant: {
        operation: "border-[#0d1d40] bg-[linear-gradient(145deg,#f7fbfd_0%,#edf5f8_55%,#fdfefe_100%)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#09152f_0%,#0d1d40_42%,#132857_100%)]",
        analytics: "border-[#8f6a18] bg-[linear-gradient(145deg,#fffdf5_0%,#f8f2dd_55%,#fdfcf8_100%)] dark:border-[#4a4c3d] dark:bg-[linear-gradient(145deg,#25281d_0%,#343824_55%,#44492d_100%)]",
        support:   "border-[#051145] bg-[linear-gradient(145deg,#f8f9fc_0%,#eef1f8_55%,#fcfcfe_100%)] dark:border-[#4b465f] dark:bg-[linear-gradient(145deg,#1c1f2b_0%,#2b3042_55%,#3a425a_100%)]",
      }
    },
    defaultVariants: { variant: "operation" }
  }
);

// 2. Estilo del contenedor del icono
export const iconStyles = cva(
  "flex h-14 w-14 items-center justify-center rounded-2xl",
  {
    variants: {
      variant: {
        operation: "bg-[#0d1d40] text-white dark:bg-[#7ec8ff] dark:text-[#09152f]",
        analytics: "bg-[#8f6a18] text-white dark:bg-[#e9c46a] dark:text-[#33270b]",
        support:   "bg-[#49566f] text-white dark:bg-[#c0c8da] dark:text-[#252c3b]",
      }
    }
  }
);

// 3. Estilo del texto de acento ("Acceso directo")
export const accentStyles = cva(
  "text-sm font-semibold",
  {
    variants: {
      variant: {
        operation: "text-[#255f82] dark:text-[#8fd0ff]",
        analytics: "text-[#8f6a18] dark:text-[#f1cf80]",
        support:   "text-[#49566f] dark:text-[#d5dbea]",
      }
    }
  }
);
