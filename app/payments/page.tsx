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

const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "userId",
    header: "User ID",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return `$${row.getValue("amount")}`;
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

const paymentColumnsMobile: ColumnDef<Payment>[] = [
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      return `$${row.getValue("amount")}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarMode, setSidebarMode] = React.useState<"expanded" | "collapsed" | "hover">("hover");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        } else {
          // Check user role from API
          try {
            const userResponse = await api.get(endpoints.userProfile);
            const userData = userResponse.data as any;

            // Check if user has admin role (role = "Admin" or role = 2)
            if (userData.role !== "Admin" && userData.role !== 2) {
              toast.error('Access denied. Admin privileges required.');
              await supabase.auth.signOut();
              router.push('/auth/login');
              return;
            }

            setUser(session.user);
          } catch (roleError) {
            console.error('Role check error:', roleError);
            toast.error('Failed to verify admin privileges.');
            await supabase.auth.signOut();
            router.push('/auth/login');
            return;
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

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
    const fetchPayments = async () => {
      try {
        const paymentsResponse = await api.get('/payment/payments').catch(err => {
          console.error('Payments API error:', err);
          return { data: [] };
        });

        setPayments((paymentsResponse.data as Payment[]) || []);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
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
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    View all payment transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={isMobile ? paymentColumnsMobile : paymentColumns}
                    data={payments || []}
                    showSearch={true}
                    showPageSize={true}
                    pageSize={isMobile ? 5 : 10}
                    className={isMobile ? "text-sm" : ""}
                  />
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