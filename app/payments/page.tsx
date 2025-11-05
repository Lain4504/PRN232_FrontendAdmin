"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { api, endpoints, Payment } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = "USD") => {
  // Map currency codes
  const currencyMap: Record<string, string> = {
    "USD": "USD",
    "VND": "VND",
    "EUR": "EUR",
  };
  
  const mappedCurrency = currencyMap[currency.toUpperCase()] || currency.toUpperCase();
  
  try {
    if (mappedCurrency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } else if (mappedCurrency === "VND") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: mappedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  } catch {
    // Fallback if currency not supported
    return `${amount} ${mappedCurrency}`;
  }
};

// Helper function to format date time
const formatDateTime = (date: string) => {
  const d = new Date(date);
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper function to get status badge
const getStatusBadge = (status: string | number) => {
  const statusStr = typeof status === "number" 
    ? ["Pending", "Success", "Failed", "Refunded"][status] || "Unknown"
    : status;

  switch (statusStr) {
    case "Success":
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Success
        </Badge>
      );
    case "Failed":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case "Pending":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "Refunded":
      return (
        <Badge variant="secondary">
          <RotateCcw className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      );
    default:
      return <Badge variant="outline">{statusStr}</Badge>;
  }
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarMode, setSidebarMode] = React.useState<"expanded" | "collapsed" | "hover">("hover");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const { isLoading: authLoading, isAdmin, user: adminUser } = useAdminAuth();

  // Define columns inside component to access router
  const paymentColumns: ColumnDef<Payment>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row, table }: { row: any; table: any }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="text-center font-medium text-sm">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "userEmail",
      header: "Email",
      cell: ({ row }: { row: any }) => {
        const userEmail = row.getValue("userEmail") as string;
        const userId = row.original.userId as string;
        return (
          <div className="flex flex-col gap-1">
            {userEmail ? (
              <>
                <span className="font-medium text-sm">{userEmail}</span>
                <Button
                  variant="link"
                  className="h-auto p-0 text-xs text-primary -mt-1"
                  onClick={() => router.push(`/user/${userId}`)}
                >
                  View User →
                </Button>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "Payment ID",
      cell: ({ row }: { row: any }) => {
        const id = row.getValue("id") as string;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">{id.substring(0, 8)}...</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                navigator.clipboard.writeText(id);
                toast.success("Payment ID copied!");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: any }) => {
        const amount = row.getValue("amount") as number;
        const currency = row.original.currency || "VND";
        return (
          <div className="font-semibold text-lg">
            {formatCurrency(amount, currency)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status");
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
      cell: ({ row }: { row: any }) => {
        const method = row.getValue("paymentMethod") as string;
        return (
          <Badge variant="outline">
            {method || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
      cell: ({ row }: { row: any }) => {
        const transactionId = row.getValue("transactionId") as string;
        if (!transactionId) return <span className="text-muted-foreground text-sm">N/A</span>;
        return (
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="font-mono text-xs truncate">{transactionId}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                navigator.clipboard.writeText(transactionId);
                toast.success("Transaction ID copied!");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "invoiceUrl",
      header: "Invoice",
      cell: ({ row }: { row: any }) => {
        const invoiceUrl = row.getValue("invoiceUrl") as string;
        if (!invoiceUrl) return <span className="text-muted-foreground text-sm">N/A</span>;
        return (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline text-sm"
          >
            View Invoice
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date & Time",
      cell: ({ row }: { row: any }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {formatDateTime(date)}
            </span>
          </div>
        );
      },
    },
  ];

  const paymentColumnsMobile: ColumnDef<Payment>[] = [
    {
      id: "no",
      header: "No",
      cell: ({ row, table }: { row: any; table: any }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return (
          <div className="text-center font-medium text-xs">
            {pageIndex * pageSize + row.index + 1}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "userEmail",
      header: "Email",
      cell: ({ row }: { row: any }) => {
        const userEmail = row.getValue("userEmail") as string;
        return userEmail ? (
          <span className="font-medium text-sm">{userEmail}</span>
        ) : (
          <span className="text-muted-foreground text-xs">N/A</span>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: any }) => {
        const amount = row.getValue("amount") as number;
        const currency = row.original.currency || "VND";
        return (
          <div className="font-semibold">
            {formatCurrency(amount, currency)}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("status");
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }: { row: any }) => {
        const method = row.getValue("paymentMethod") as string;
        return (
          <Badge variant="outline" className="text-xs">
            {method || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: { row: any }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <span className="text-sm">
            {formatDateTime(date)}
          </span>
        );
      },
    },
  ];

  useEffect(() => {
    if (!authLoading && adminUser) {
      setUser({ email: adminUser.email } as any);
    }
  }, [authLoading, adminUser]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 1023px)').matches
      setIsMobile(mobile)
      if (mobile) {
        setSidebarMode('expanded')
      } else {
        const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
        if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
          setSidebarMode(stored)
        }
      }
    }

    checkMobile()

    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      const nowMobile = window.matchMedia('(max-width: 1023px)').matches
      if (nowMobile) {
        setSidebarMode('expanded')
        return
      }
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') setSidebarMode(mode)
    }

    const mq = window.matchMedia('(max-width: 1023px)')
    const onMqChange = () => {
      checkMobile()
    }

    mq.addEventListener?.('change', onMqChange)
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    return () => {
      mq.removeEventListener?.('change', onMqChange)
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return;

    const fetchPayments = async () => {
      try {
        // Use admin endpoint to get all payments
        const paymentsResponse = await api.get(endpoints.paymentsAll()).catch(err => {
          console.error('Payments API error:', err);
          return { data: [] };
        });

        // API returns GenericResponse<IEnumerable<PaymentResponseDto>>
        // Structure: { success: true, data: [...] }
        const paymentsData = paymentsResponse.data as any;
        setPayments(paymentsData || []);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
        toast.error("Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchPayments();
    }
  }, [authLoading, isAdmin]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to log out");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="flex h-full w-full max-w-full">
        {/* Desktop Sidebar */}
        <div className="group relative hidden lg:block">
          <div className={cn(
            "fixed left-0 top-12 h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 overflow-hidden",
            sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-12' : 'w-12 hover:w-64'
          )}>
            <AdminSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className={cn(
          "flex flex-col flex-1 pt-12 min-h-0 max-w-full overflow-hidden",
          // Desktop sidebar margins
          sidebarMode === 'expanded' ? 'lg:ml-64' : sidebarMode === 'collapsed' ? 'lg:ml-12' : 'lg:ml-12'
        )}>
          <main className="flex-1 overflow-x-hidden max-w-full">
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Payment Transactions</CardTitle>
                      <CardDescription>
                        View and manage all payment transactions across the platform
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        Total: {payments.length} payments
                      </Badge>
                      <Badge variant="default" className="text-sm">
                        Total Amount: {formatCurrency(
                          payments.reduce((sum, p) => sum + (p.amount || 0), 0),
                          payments[0]?.currency || "VND"
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-muted-foreground mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                      <p className="text-sm text-muted-foreground">
                        There are no payment transactions to display at this time.
                      </p>
                    </div>
                  ) : (
                    <DataTable
                      columns={isMobile ? paymentColumnsMobile : paymentColumns}
                      data={payments || []}
                      showSearch={true}
                      showPageSize={true}
                      pageSize={isMobile ? 5 : 10}
                      className={isMobile ? "text-sm" : ""}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <Button
            variant="ghost"
            className="md:hidden relative h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <h1 className="text-xl font-semibold flex-1">Admin Dashboard</h1>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Sidebar Sheet */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetContent side="left" className="p-0 w-64">
              <SheetHeader className="sr-only">
                <SheetTitle>Admin Navigation</SheetTitle>
                <SheetDescription>Navigate through admin sections</SheetDescription>
              </SheetHeader>
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
