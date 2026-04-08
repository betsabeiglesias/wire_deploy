// tabs/CustomIconsTab.jsx
//
// Sección "Iconos personalizados" — subida, grid, drag-and-drop.
// Extraído de UnifiedSidebar.renderSectionContent("custom-icons").
//
import React from "react";

const CustomIconsTab = ({
  customIcons,
  isProcessingUpload,
  uploadInputRef,
  iconToTemplate,
  handleDeleteCustomIcon,
  handleUploadCustomIcon,
  addComponentToCanvas,
}) => {
  const handleTemplateDragStart = (e, tpl) => {
    e.dataTransfer.setData("application/x-scada-template", JSON.stringify(tpl));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handlePickCustomIcon = (icon) => addComponentToCanvas?.(iconToTemplate(icon).data);

  return (
    <div className="rounded-lg border border-slate-300/60 bg-slate-50 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Libreria de imagenes
        </p>
        <button
          type="button"
          onClick={() => uploadInputRef.current?.click()}
          disabled={isProcessingUpload}
          className="cursor-pointer rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:border-sky-400 hover:bg-slate-50 disabled:opacity-50"
        >
          {isProcessingUpload ? "Procesando..." : "Subir icono"}
        </button>
        <input
          ref={uploadInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={handleUploadCustomIcon}
        />
      </div>

      <p className="text-[10px] text-slate-500">
        PNG, JPG o SVG. Se optimiza en cliente y se guarda como Base64.
      </p>

      {customIcons.length === 0 ? (
        <div className="rounded border border-dashed border-slate-300 bg-slate-50 px-2 py-3 text-[11px] text-slate-500">
          No hay iconos personalizados todavia.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
          {customIcons.map((icon) => {
            const tpl = iconToTemplate(icon);
            return (
              <div
                key={icon.id}
                draggable
                onDragStart={(e) => handleTemplateDragStart(e, tpl)}
                onClick={() => handlePickCustomIcon(icon)}
                className="group relative cursor-grab rounded-md border border-slate-300/60 bg-slate-50 p-1.5 shadow-sm hover:border-sky-400 hover:bg-sky-50 active:cursor-grabbing"
                title={icon.name}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomIcon(icon.id);
                  }}
                  className="absolute right-1 top-1 z-10 hidden h-5 w-5 items-center justify-center rounded bg-slate-50/90 text-[11px] text-rose-600 shadow group-hover:inline-flex"
                  title="Eliminar icono"
                >
                  ×
                </button>
                <div className="flex h-20 items-center justify-center overflow-hidden rounded border border-slate-100 bg-slate-50">
                  <img
                    src={icon.base64}
                    alt={icon.name}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="mt-1 truncate text-[10px] text-slate-600">{icon.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomIconsTab;
