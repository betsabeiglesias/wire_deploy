export function buildTagTree(tags) {
  const tree = {};

  if (!Array.isArray(tags)) return {};

  tags.forEach(tag => {
    // Usamos valores por defecto para evitar que el 'if' los descarte
    const site = tag.site || "DefaultSite";
    const area = tag.area || "DefaultArea";
    const line = tag.line || "DefaultLine";
    const cell = tag.cell || "DefaultCell";
    const equipment = tag.equipment || "UnknownDevice";
    const variable = tag.variable;

    if (!variable) return; // Lo único realmente obligatorio es la variable

    if (!tree[site]) tree[site] = {};
    if (!tree[site][area]) tree[site][area] = {};
    if (!tree[site][area][line]) tree[site][area][line] = {};
    if (!tree[site][area][line][cell]) tree[site][area][line][cell] = {};
    if (!tree[site][area][line][cell][equipment]) {
      tree[site][area][line][cell][equipment] = [];
    }

    // Guardamos el objeto completo o solo el nombre de la variable
    tree[site][area][line][cell][equipment].push(variable);
  });

  return tree;
}

export function buildTagIndex(tags) {
  const index = {};
  
  if (!Array.isArray(tags)) return {};

  tags.forEach(tag => {
    // Creamos un ID de equipo consistente
    const equipmentId = tag.equipment_id || 
      [tag.site, tag.area, tag.line, tag.cell, tag.equipment]
        .filter(Boolean)
        .join("/");

    // IMPORTANTE: La clave debe coincidir con lo que el Modal busca.
    // Usamos equipment_id y variable como identificador único.
    const key = `${equipmentId}::${tag.variable}`;
    
    index[key] = { 
      ...tag, 
      equipment_id: equipmentId 
    };
  });

  return index;
}