// modules/organizarScada/pages/ScriptEditor.jsx

import { useState } from "react";
import { ScriptForm } from "../components/ScriptForm";
import { ConditionalTagWidget } from "../components/widgets/ConditionalTagWidget";

export function ScriptEditor() {
  const [template, setTemplate] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  return (
    <div style={{ padding: "2rem", display: "flex", gap: "2rem" }}>
      
      {/* Panel edición */}
      <div style={{ flex: 1 }}>
        <h2>Conditional Script Editor</h2>

        <ScriptForm
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
          onTemplateChange={setTemplate}
        />
      </div>

      {/* Preview en vivo */}
      <div style={{ flex: 1 }}>
        <h3>Preview</h3>

        {selectedTag && template && (
            <ConditionalTagWidget
                tagDescriptor={selectedTag}
                template={template}
            />
            )}
      </div>
    </div>
  );
}