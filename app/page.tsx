"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { api, endpoints, User } from "@/lib/api";
import { authStore } from "@/lib/auth-store";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRouter as useNextRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
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
    accessorKey: "email",
    header: "Email",
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
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "socialAccountsCount",
    header: "Accounts",
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
          View
        </Button>
      );
    },
  },
];


export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarMode, setSidebarMode] = React.useState<"expanded" | "collapsed" | "hover">("hover");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useNextRouter();

  const { isLoading: authLoading, isAdmin, user: adminUser } = useAdminAuth();

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

    const fetchUsers = async () => {
      try {
        const usersResponse = await api.get(endpoints.userSearch({ page: 1, pageSize: 100 })).catch(err => {
          console.error('Users API error:', err);
          return { data: { data: [] } };
        });

        // Users API returns GenericResponse<PagedResult<UserListDto>>
        // Structure: { success: true, data: { data: [...], totalCount: ..., ... } }
        const pagedData = usersResponse.data as any;
        setUsers(pagedData?.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin]);

  const handleLogout = async () => {
    try {
      authStore.clearAuth();
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

  const renderContent = () => {
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
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
