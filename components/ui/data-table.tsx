"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, ListFilter } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  showPagination?: boolean;
  showSearch?: boolean;
  showPageSize?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  searchPlaceholder = "Quick search...",
  pageSize = 10,
  className,
  loading = false,
  emptyMessage = "No records found",
  emptyDescription = "Adjust your filters or try a different search term.",
  showPagination = true,
  showSearch = true,
  showPageSize = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const totalPages = table?.getPageCount() || 0;
  const currentPage = (table?.getState().pagination.pageIndex || 0) + 1;
  const totalItems = table?.getFilteredRowModel().rows.length || 0;

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center gap-4">
          <div className="h-10 flex-1 bg-muted/40 animate-pulse rounded-xl" />
          <div className="h-10 w-32 bg-muted/40 animate-pulse rounded-xl" />
        </div>
        <div className="border border-border/50 rounded-2xl overflow-hidden">
          <div className="h-12 bg-muted/30 animate-pulse shadow-sm" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-t border-border/30 bg-card/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {/* Search and Filters */}
      {(showSearch || showPageSize) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {showSearch && (
            <div className="relative flex-1 w-full max-w-md" data-search-input>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground/70" />
              </div>
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-10 h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded-xl transition-all"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {showPageSize && (
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[110px] h-10 rounded-xl bg-card border-border/40 text-xs font-semibold uppercase tracking-wider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/30">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)} className="text-xs">
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/40 text-muted-foreground">
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Table Structure */}
      <div className="rounded-2xl border border-border/50 bg-card/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/30">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/80 px-6">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="group border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="h-16 w-16 rounded-3xl bg-muted/40 flex items-center justify-center mb-6">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-base font-bold text-foreground mb-1">{emptyMessage}</p>
                      <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                        {emptyDescription}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {showPagination && totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Showing <span className="text-foreground">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{" "}
            <span className="text-foreground">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, totalItems)}</span> of{" "}
            <span className="text-foreground">{totalItems}</span> entries
          </p>

          <div className="flex items-center gap-1 bg-muted/30 p-1.5 rounded-2xl border border-border/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 rounded-xl hover:bg-background transition-all"
            >
              <ChevronsLeft className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-9 w-9 rounded-xl hover:bg-background transition-all"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Button>

            <div className="flex items-center px-4">
              <span className="text-xs font-black tracking-tight">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 rounded-xl hover:bg-background transition-all"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-9 w-9 rounded-xl hover:bg-background transition-all"
            >
              <ChevronsRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
