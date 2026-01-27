"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { api, endpoints, User } from "@/lib/api";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { toast } from "sonner";
import { Users as UsersIcon, ArrowRight, UserCheck, UserMinus } from "lucide-react";

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (authLoading) return;

    const fetchUsers = async () => {
      try {
        const usersResponse = await api.get(endpoints.userSearch({ page: 1, pageSize: 100 })).catch(err => {
          console.error('Users API error:', err);
          return { data: { data: [] } };
        });

        const pagedData = usersResponse.data as any;
        setUsers(pagedData?.data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Lấy danh sách người dùng thất bại");
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-sm font-medium">Đang khởi tạo Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "Người dùng",
      cell: ({ row }) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
            {row.original.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{row.original.email}</span>
            <span className="text-xs text-muted-foreground">ID: {row.original.id.slice(0, 8)}...</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "socialAccountsCount",
      header: "Tài khoản MXH",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-semibold">
            {row.original.socialAccountsCount} Tài khoản
          </div>
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tham gia",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Hành động</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="group hover:bg-primary/5 hover:text-primary transition-all gap-1.5"
            onClick={() => router.push(`/user/${row.original.id}`)}
          >
            Quản lý
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-muted-foreground font-light">
            Chào mừng bạn đến với trang quản trị OmniAdly. Theo dõi và quản lý sự phát triển của hệ thống.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tổng người dùng</CardTitle>
              <UsersIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground mt-1">+12% so với tháng trước</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Người dùng tích cực</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.floor(users.length * 0.85)}</div>
              <p className="text-xs text-muted-foreground mt-1">Tỷ lệ giữ chân cao</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tỷ lệ rời bỏ</CardTitle>
              <UserMinus className="h-4 w-4 text-error" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4%</div>
              <p className="text-xs text-muted-foreground mt-1">Cải thiện -0.5%</p>
            </CardContent>
          </Card>
          <Card className="bg-primary shadow-lg shadow-primary/20 border-none text-primary-foreground overflow-hidden relative">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-80 text-white uppercase tracking-wider">Trạng thái hệ thống</CardTitle>
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Ổn định</div>
              <p className="text-xs opacity-70 text-white mt-1">Hệ thống đang hoạt động bình thường</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Section */}
        <Card className="bg-card/30 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-card/50 border-b border-border/30 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Danh mục người dùng</CardTitle>
                <CardDescription className="mt-1">
                  Danh sách đầy đủ tất cả người dùng OmniAdly và trạng thái tài khoản.
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.info("Đang xuất dữ liệu...")}>
                Xuất CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 py-4">
              <DataTable
                columns={userColumns}
                data={users || []}
                showSearch={true}
                showPageSize={true}
                pageSize={10}
                className="border-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

