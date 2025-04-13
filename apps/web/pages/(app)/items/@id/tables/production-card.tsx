import { DataTable } from "@mabigg/ui/components/data-table/data-table";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { ItemIdCell } from "../cells/item-id-cell";
import { DataTableColumnHeader } from "@mabigg/ui/components/data-table/data-table-column-header";
import { ItemNameCell } from "../cells/item-name-cell";
import { Skeleton } from "@mabigg/ui/components/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@mabigg/ui/components/card";
import { useWithPrices } from "../../../../../hooks/use-with-prices";

interface Material {
  itemId: number;
  name: string;
  iconUrl: string;
  type: string;
  description: string;
  wikiPage: string;
  quantity: number;
}

interface Production {
  productionId: number;
  type: string;
  rank: string;
  materials: Material[];
}

interface Props {
  production: Production;
}

export function ProductionCard({ production }: Props) {
  const data = useWithPrices(production.materials);
  type Data = (typeof data)[number];
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Data>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const columns: ColumnDef<Data, any>[] = [
      columnHelper.accessor("itemId", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Id" />
        ),
        cell: ({ row: { original: item } }) => {
          return <ItemIdCell item={item} />;
        },
      }),
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row: { original: item } }) => {
          return <ItemNameCell item={item} />;
        },
      }),
      columnHelper.accessor("quantity", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Quantity" />
        ),
      }),
      columnHelper.accessor(
        (item) => item.listings.data?.results.find((r) => r.price1)?.price1,
        {
          id: "price",
          header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Price" />
          ),
          cell: ({ getValue, row: { original: item } }) => {
            const price = getValue();
            return (
              <div>
                {price ? (
                  <span>{price.toLocaleString("en-US")}</span>
                ) : item.listings.isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            );
          },
          enableSorting: false,
          enableColumnFilter: false,
        }
      ),
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

  const fullPrice = data.reduce((acc, item) => {
    const price = item.listings.data?.results.find((r) => r.price1)?.price1;
    return acc + (price || 0) * item.quantity;
  }, 0);

  return (
    <Card key={production.productionId}>
      <CardHeader>
        <CardTitle>Production</CardTitle>
        <CardDescription>
          {production.rank} {production.type}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable table={table} />
      </CardContent>
      <CardFooter className="text-muted-foreground justify-end gap-2">
        Total:{" "}
        {data.some((i) => i.listings.isLoading) ? (
          <Skeleton className="w-12 h-4" />
        ) : (
          fullPrice.toLocaleString("en-US")
        )}
      </CardFooter>
    </Card>
  );
}
