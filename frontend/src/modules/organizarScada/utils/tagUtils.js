export function buildTagTree(tags) {

  const tree = {};

  tags.forEach(tag => {

    const {
      site,
      area,
      line,
      cell,
      equipment,
      variable
    } = tag;

    if (!site || !area || !line || !cell || !equipment || !variable) return;

    if (!tree[site]) tree[site] = {};
    if (!tree[site][area]) tree[site][area] = {};
    if (!tree[site][area][line]) tree[site][area][line] = {};
    if (!tree[site][area][line][cell]) tree[site][area][line][cell] = {};
    if (!tree[site][area][line][cell][equipment])
      tree[site][area][line][cell][equipment] = [];

    tree[site][area][line][cell][equipment].push(variable);

  });

  return tree;
}

export function buildTagIndex(tags) {
  const index = {};
  tags.forEach(tag => {
    const equipmentId = tag.equipment_id ||
      [tag.site, tag.area, tag.line, tag.cell, tag.equipment]
        .filter(Boolean)
        .join("/");

    const key = `${equipmentId}:${tag.variable}`;
    index[key] = { ...tag, equipment_id: equipmentId };
  });
  return index;
}