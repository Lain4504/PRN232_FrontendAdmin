"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { api, endpoints, User, Payment, Subscription } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter as useNextRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return row.getValue("isActive") ? "Active" : "Inactive";
    },
  },
  {
    accessorKey: "socialAccountsCount",
    header: "Social Accounts",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/user/${row.original.id}`)}
        >
          View Details
        </Button>
      );
    },
  },
];

const userColumnsMobile: ColumnDef<User>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return row.getValue("isActive") ? "Active" : "Inactive";
    },
  },
  {
    accessorKey: "socialAccountsCount",
    header: "Accounts",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter();
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/user/${row.original.id}`)}
        >
          View
        </Button>
      );
    },
  },
];

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

const subscriptionColumns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "profileId",
    header: "Profile ID",
  },
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return row.getValue("isActive") ? "Active" : "Inactive";
    },
  },
  {
    accessorKey: "quotaPostsPerMonth",
    header: "Posts/Month",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return new Date(row.getValue("startDate")).toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = row.getValue("endDate") as string;
      return endDate ? new Date(endDate).toLocaleDateString() : "N/A";
    },
  },
];

const subscriptionColumnsMobile: ColumnDef<Subscription>[] = [
  {
    accessorKey: "plan",
    header: "Plan",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      return row.getValue("isActive") ? "Active" : "Inactive";
    },
  },
  {
    accessorKey: "quotaPostsPerMonth",
    header: "Posts",
  },
  {
    accessorKey: "startDate",
    header: "Started",
    cell: ({ row }) => {
      return new Date(row.getValue("startDate")).toLocaleDateString();
    },
  },
];

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"users" | "payments" | "subscriptions">("users");
  const [sidebarMode, setSidebarMode] = React.useState<"expanded" | "collapsed" | "hover">("hover");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useNextRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('Session check:', session); // Debug log
        console.log('Session error:', error); // Debug log

        if (!session) {
          console.log('No session, redirecting to login'); // Debug log
          router.push('/auth/login');
          return;
        } else {
          console.log('Session exists, checking user role'); // Debug log

          // Check user role from API
          try {
            const userResponse = await api.get(endpoints.userProfile);
            const userData = userResponse.data as any;

            console.log('User data:', userData); // Debug log

            // Check if user has admin role (role = "Admin" or role = 2)
            if (userData.role !== "Admin" && userData.role !== 2) {
              console.log('User is not admin, redirecting to login. Role:', userData.role); // Debug log
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
    const fetchData = async () => {
      try {
        const [usersResponse, paymentsResponse, subscriptionsResponse] = await Promise.all([
          api.get(endpoints.userSearch).catch(err => {
            console.error('Users API error:', err);
            return { data: [] };
          }),
          api.get('/payment/payments').catch(err => {
            console.error('Payments API error:', err);
            return { data: [] };
          }),
          api.get('/payment/subscriptions').catch(err => {
            console.error('Subscriptions API error:', err);
            return { data: [] };
          }),
        ]);
        console.log('Users response:', usersResponse.data); // Debug log
        console.log('Payments response:', paymentsResponse.data); // Debug log
        console.log('Subscriptions response:', subscriptionsResponse.data); // Debug log

        // Users API returns paginated data: { data: [...], totalCount: ..., ... }
        setUsers((usersResponse.data as any)?.data || []);
        // Payments and subscriptions APIs return direct arrays
        setPayments((paymentsResponse.data as Payment[]) || []);
        setSubscriptions((subscriptionsResponse.data as Subscription[]) || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage and view all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={isMobile ? userColumnsMobile : userColumns}
                data={users || []}
                showSearch={true}
                showPageSize={true}
                pageSize={isMobile ? 5 : 10}
                className={isMobile ? "text-sm [&_[data-search-input]]:w-full [&_[data-page-size]]:w-full" : ""}
              />
            </CardContent>
          </Card>
        );
      case "payments":
        return (
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
        );
      case "subscriptions":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                Manage user subscriptions and plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={isMobile ? subscriptionColumnsMobile : subscriptionColumns}
                data={subscriptions || []}
                showSearch={true}
                showPageSize={true}
                pageSize={isMobile ? 5 : 10}
                className={isMobile ? "text-sm" : ""}
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="flex h-full w-full max-w-full">
        {/* Desktop Sidebar */}
        <div className="group relative hidden lg:block">
          <div className={cn(
            "fixed left-0 top-12 h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 overflow-hidden",
            sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-12' : 'w-12 hover:w-64'
          )}>
            <AdminSidebar onSectionChange={setActiveSection} />
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
              {renderContent()}
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
              <AdminSidebar onSectionChange={setActiveSection} />
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
