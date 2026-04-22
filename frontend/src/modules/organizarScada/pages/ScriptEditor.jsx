// modules/organizarScada/pages/ScriptEditor.jsx

import { useState } from "react";
import { ScriptForm } from "../components/ScriptForm";
import { ConditionalTagWidget } from "../components/widgets/ConditionalTagWidget";

export function ScriptEditor({ embedded = false }) {
  const [template, setTemplate] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  const content = (
    <div className="grid h-full min-h-0 grid-cols-[1fr_280px] gap-2 p-2">
      <section className="min-h-0 overflow-y-auto rounded-[4px] border border-slate-300 bg-white p-2">
        <div className="mb-2 border-b border-slate-200 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
            Editor de reglas
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            Define condiciones visuales para una variable o tag.
          </p>
        </div>

        <ScriptForm
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onTemplateChange={setTemplate}
        />
      </section>

      <aside className="min-h-0 overflow-y-auto rounded-[4px] border border-[#D6D9E2] bg-[#F9F9FA] p-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-slate-600">
          Preview
        </p>

        {selectedTag && template ? (
          <ConditionalTagWidget
            tagDescriptor={selectedTag}
            template={template}
          />
        ) : (
          <div className="rounded-[4px] border border-slate-300 bg-white p-3">
            <p className="text-[12px] leading-5 text-slate-500">
              Selecciona una variable y aplica una regla para ver el resultado.
            </p>
          </div>
        )}
      </aside>
    </div>
  );

  if (embedded) {
    return (
      <div className="h-[calc(100%-36px)] min-h-0 bg-[#EFEFEF]">
        {content}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#E9EAED] p-2">
      <header className="flex h-[36px] items-center bg-[#29468B] px-4 shadow-sm">
        <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-white">
          Reglas de variable
        </span>
      </header>
      <div className="h-[calc(100%-36px)] min-h-0 bg-[#EFEFEF]">
        {content}
      </div>
    </div>
  );
}
