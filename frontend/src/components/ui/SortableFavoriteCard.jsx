function SortableFavoriteCard({ item, type, navigate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.favTableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition:
      transition || "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
    zIndex: isDragging ? 50 : 0,
    position: "relative",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-[28px] border border-[#dce3e8] dark:border-[#21415f] transition-all ${
        isDragging
          ? "scale-[1.02] shadow-2xl ring-2 ring-[#79c8f1]/50"
          : "shadow-lg"
      }`}
    >
      <CardHmi
        item={item}
        type={type}
        navigate={navigate}
        isDragging={isDragging}
        {...attributes}
        {...listeners}
      />
    </article>
  );
}
