interface Props {
  item: {
    itemId: number;
    name: string;
  };
}

export function ItemNameCell({ item }: Props) {
  return (
    <a href={`/items/${item.itemId}`} className="min-w-0 flex items-center">
      <div className="min-w-0 truncate">{item.name}</div>
    </a>
  );
}
