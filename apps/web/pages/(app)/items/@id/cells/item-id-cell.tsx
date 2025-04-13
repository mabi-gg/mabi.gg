interface Props {
  item: {
    itemId: number;
  };
}

export function ItemIdCell({ item }: Props) {
  return (
    <a href={`/items/${item.itemId}`} className="flex items-center gap-2">
      <div
        className="shrink-0"
        style={{
          width: 32,
          height: 32,
        }}
      >
        <img
          key={item.itemId}
          src={`/icons/${item.itemId}.png`}
          alt={``}
          className="w-full h-full object-contain"
        />
      </div>
      <div>{item.itemId}</div>
    </a>
  );
}
