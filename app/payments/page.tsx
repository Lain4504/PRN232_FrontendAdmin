"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { api, endpoints, Payment } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, CheckCircle2, XCircle, Clock, RotateCcw, ArrowRight, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "USD") => {
  const mappedCurrency = currency.toUpperCase() === "VND" ? "VND" : "USD";
  try {
    return new Intl.NumberFormat(mappedCurrency === "VND" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: mappedCurrency,
      minimumFractionDigits: mappedCurrency === "VND" ? 0 : 2,
      maximumFractionDigits: mappedCurrency === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${mappedCurrency}`;
  }
};

const getStatusBadge = (status: string | number) => {
  const statusStr = typeof status === "number"
    ? ["Pending", "Success", "Failed", "Refunded"][status] || "Unknown"
    : status;

  switch (statusStr) {
    case "Success":
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-medium">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Thành công
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="outline" className="bg-error/10 text-error border-error/20 font-medium">
          <XCircle className="h-3 w-3 mr-1" />
          Thất bại
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 font-medium">
          <Clock className="h-3 w-3 mr-1" />
          Đang xử lý
        </Badge>
      );
    case "Refunded":
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border font-medium">
          <RotateCcw className="h-3 w-3 mr-1" />
          Đã hoàn tiền
        </Badge>
      );
    default:
      return <Badge variant="outline">{statusStr}</Badge>;
  }
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: "userEmail",
      header: "Người dùng",
      cell: ({ row }) => (
        <div className="flex flex-col py-1">
          <span className="font-medium text-foreground">{row.original.userEmail || "Guest"}</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-[11px] text-muted-foreground hover:text-primary w-fit transition-colors"
            onClick={() => router.push(`/user/${row.original.userId}`)}
          >
            Quản lý người dùng →
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Số tiền",
      cell: ({ row }) => (
        <div className="font-bold text-base text-foreground">
          {formatCurrency(row.original.amount, row.original.currency)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "paymentMethod",
      header: "Phương thức",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-normal border-none">
          {row.original.paymentMethod || "N/A"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày",
      cell: ({ row }) => (
        <div className="flex flex-col text-sm text-muted-foreground whitespace-nowrap">
          <span>{new Date(row.original.createdAt).toLocaleDateString("vi-VN")}</span>
          <span className="text-[10px] opacity-60 font-light">{new Date(row.original.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Tham chiếu</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            onClick={() => {
              navigator.clipboard.writeText(row.original.id);
              toast.success("Đã sao chép ID");
            }}
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          {(row.original as any).invoiceUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/5 hover:text-primary"
              onClick={() => window.open((row.original as any).invoiceUrl, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (authLoading) return;

    const fetchPayments = async () => {
      try {
        const paymentsResponse = await api.get(endpoints.paymentsAll()).catch(err => {
          console.error('Payments API error:', err);
          return { data: [] };
        });
        setPayments(paymentsResponse.data as any || []);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        toast.error("Lấy danh sách thanh toán thất bại");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchPayments();
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground animate-pulse">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalRevenue = payments
    .filter(p => p.status === "Success" || p.status === 1)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Tài chính</h1>
            <p className="text-muted-foreground font-light">
              Theo dõi các khoản thanh toán gói đăng ký và doanh thu nền tảng.
            </p>
          </div>

          <Card className="bg-primary shadow-lg shadow-primary/20 border-none text-primary-foreground min-w-[240px]">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Tổng doanh thu thành công</span>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue, payments[0]?.currency || "VND")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/30 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-card/50 border-b border-border/30 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Giao dịch</CardTitle>
                <CardDescription className="mt-1">
                  Lịch sử tất cả các khoản thanh toán được xử lý qua hệ thống Omniadly.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 px-3 py-1">
                {payments.length} Giao dịch
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 py-4">
              {payments.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                    <CreditCard className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Chưa có giao dịch nào</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Khi người dùng bắt đầu đăng ký các gói dịch vụ, lịch sử thanh toán của họ sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={paymentColumns}
                  data={payments}
                  showSearch={true}
                  showPageSize={true}
                  pageSize={10}
                  className="border-none"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

