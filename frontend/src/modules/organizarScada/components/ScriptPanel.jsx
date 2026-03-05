import { useScadaConfig } from "./useScadaConfig";
import { extractTags } from "./scadaUtils";
import { TagIndicator } from "./TagIndicator";

export function ScriptPanel() {
  const config = useScadaConfig();

  if (!config) return <div>Loading...</div>;

  const tags = extractTags(config);

  return (
    <div>
      {tags.map(tagId => (
        <TagIndicator
          key={tagId}
          tagId={tagId}
        />
      ))}
    </div>
  );
}