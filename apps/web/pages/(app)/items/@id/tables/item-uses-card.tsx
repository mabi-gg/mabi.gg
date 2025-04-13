import { DataTable } from "@mabigg/ui/components/data-table/data-table";
import { DataTableColumnHeader } from "@mabigg/ui/components/data-table/data-table-column-header";
import {
  createColumnHelper,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { ItemIdCell } from "../cells/item-id-cell";
import { ItemUseMetadata } from "../item-details";
import { ItemNameCell } from "../cells/item-name-cell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@mabigg/ui/components/card";
import { cn } from "@mabigg/ui/lib/utils";
import { ScrollArea } from "@mabigg/ui/components/scroll-area";

interface Props {
  data: ItemUseMetadata[];
}

export function ItemUsesCard({ data }: Props) {
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<ItemUseMetadata>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: ColumnDef<ItemUseMetadata, any>[] = [
      columnHelper.accessor("itemId", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row: { original: item } }) => {
          return <ItemIdCell item={item} />;
        },
        meta: {
          width: "max-content",
        },
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row: { original: item } }) => {
          return <ItemNameCell item={item} />;
        },
        meta: {
          width: "auto",
        },
      }),
      columnHelper.accessor("quantity", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Quantity" />
        ),
        meta: {
          width: "min-content",
        },
      }),
    ];

    return columns;
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableHiding: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uses</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn(data.length > 10 && "h-[400px]")}>
          <DataTable header="sticky" table={table} />
        </ScrollArea>
      </CardContent>
      <CardFooter className="text-muted-foreground justify-end">
        {data.length} uses
      </CardFooter>
    </Card>
  );
}
