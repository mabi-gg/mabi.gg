import { Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@mabigg/ui/lib/utils";

const tableVariants = cva("w-full caption-bottom text-sm");
const theadVariants = cva(["grid grid-cols-subgrid col-span-full"], {
  variants: {
    header: {
      sticky: "sticky top-0 bg-background",
    },
  },
});
const trVariants = cva([
  "grid grid-cols-subgrid col-span-full",
  "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors items-stretch",
]);
const tbodyVariants = cva("grid grid-cols-subgrid col-span-full");
const thVariants = cva([
  "flex items-center",
  "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
]);
const tdVariants = cva([
  "px-2 flex items-center whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
  "min-w-0",
]);

interface Props<TData>
  extends Omit<React.ComponentProps<"div">, "className">,
    VariantProps<typeof tableVariants>,
    VariantProps<typeof tbodyVariants>,
    VariantProps<typeof theadVariants>,
    VariantProps<typeof thVariants>,
    VariantProps<typeof tdVariants>,
    VariantProps<typeof trVariants> {
  table: TanstackTable<TData>;
  classes?: {
    table?: string;
    header?: string;
    body?: string;
    row?: string;
    columnHeader?: string;
    cell?: string;
  };
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    columnGap: string | number;
  }
  interface ColumnMeta<TData, TValue> {
    width?: string;
  }
}

export function DataTable<TData>({
  table,
  style,
  classes = {},
  header,
  ...props
}: Props<TData>) {
  const columnGap = table.options.meta?.columnGap || 4;
  return (
    <div
      role="table"
      className={cn(tableVariants({ className: classes.table }))}
      style={{
        display: "grid",
        gridTemplateColumns: table
          .getVisibleFlatColumns()
          .map((column) => column.columnDef.meta?.width || "auto")
          .join(" "),
        ...style,
        columnGap:
          typeof columnGap === "number"
            ? `calc(${columnGap} * var(--spacing)`
            : columnGap,
      }}
      {...props}
    >
      <div
        role="rowgroup"
        className={cn(theadVariants({ className: classes.header, header }))}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            role="row"
            className={cn(trVariants({ className: classes.row }))}
          >
            {headerGroup.headers.map((header) => {
              return (
                <div
                  role="columnheader"
                  className={thVariants({ className: classes.columnHeader })}
                  key={header.id}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div
        role="rowgroup"
        className={cn(tbodyVariants({ className: classes.body }))}
      >
        {table.getRowModel().rows.map((row) => (
          <div
            role="row"
            key={row.id}
            className={cn(trVariants({ className: classes.row }))}
          >
            {row.getVisibleCells().map((cell) => (
              <div
                role="cell"
                key={cell.id}
                className={cn(tdVariants({ className: classes.cell }))}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
