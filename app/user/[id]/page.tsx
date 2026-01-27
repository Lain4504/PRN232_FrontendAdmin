"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Shield, Activity, Calendar, ExternalLink, Mail } from "lucide-react";
import { api, endpoints, Profile, Subscription } from "@/lib/api";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { cn } from "@/lib/utils";

// Mapping functions for profileType and status
const mapProfileType = (type: number | string): string => {
  if (typeof type === 'string') {
    if (type === 'Free') return 'Miễn phí';
    if (type === 'Basic') return 'Cơ bản';
    if (type === 'Pro') return 'Chuyên nghiệp';
    return type;
  }
  const typeMap: Record<number, string> = {
    0: 'Miễn phí',
    1: 'Cơ bản',
    2: 'Chuyên nghiệp'
  };
  return typeMap[type] || 'Không xác định';
};

const mapProfileStatus = (status: number | string): string => {
  if (typeof status === 'string') {
    if (status === 'Pending') return 'Đang chờ';
    if (status === 'Active') return 'Hoạt động';
    if (status === 'Suspended') return 'Bị tạm dừng';
    if (status === 'Cancelled') return 'Đã hủy';
    return status;
  }
  const statusMap: Record<number, string> = {
    0: 'Đang chờ',
    1: 'Hoạt động',
    2: 'Bị tạm dừng',
    3: 'Đã hủy'
  };
  return statusMap[status] || 'Không xác định';
};

interface UserDetail {
  id: string;
  email: string;
  role: string | number;
  createdAt: string;
  socialAccountsCount: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  const profileColumns: ColumnDef<Profile>[] = [
    {
      accessorKey: "name",
      header: "Hồ sơ",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.original.name}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.id}</span>
        </div>
      )
    },
    {
      accessorKey: "profileType",
      header: "Gói dịch vụ",
      cell: ({ row }) => {
        const type = row.original.profileType;
        return (
          <Badge
            variant="secondary"
            className={cn(
              "font-medium",
              type === "Pro" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-transparent"
            )}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            className={cn(
              "font-semibold",
              status === "Hoạt động" || status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"
            )}
            variant="outline"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "companyName",
      header: "Công ty",
      cell: ({ row }) => row.original.companyName || <span className="text-muted-foreground font-light italic text-xs">Chưa xác định</span>
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString("vi-VN", {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
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
            onClick={() => router.push(`/user/${userId}/profile/${row.original.id}`)}
          >
            Chi tiết
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        const userResponse = await api.get(endpoints.userSearch({
          searchTerm: userId,
          pageSize: 100
        })).catch(err => {
          console.error('User search error:', err);
          return { data: { data: [] } };
        });

        const userData = userResponse.data as any;
        const users = userData?.data || [];
        const foundUser = users.find((u: any) => u.email === userId || u.id === userId);

        if (foundUser) {
          setUser(foundUser);
        } else {
          try {
            const directUserResponse = await api.get(endpoints.userById(userId));
            setUser(directUserResponse.data as any);
          } catch {
            throw new Error('User not found');
          }
        }

        const profilesResponse = await api.get(endpoints.profilesByUser(userId)).catch(err => {
          console.error('Profiles fetch error:', err);
          return { data: [] };
        });

        const profilesData = profilesResponse.data as any;
        const mappedProfiles = (profilesData || []).map((profile: any) => ({
          ...profile,
          profileType: mapProfileType(profile.profileType),
          status: mapProfileStatus(profile.status)
        }));
        setProfiles(mappedProfiles);

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Không thể tải dữ liệu người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router, authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground animate-pulse">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Không tìm thấy người dùng</h1>
          <p className="text-muted-foreground max-w-sm">
            Chúng tôi không thể tìm thấy người dùng với ID bạn cung cấp. Họ có thể đã bị xóa hoặc ID không chính xác.
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Quay lại danh sách
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 pb-10">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Danh mục người dùng
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-1">
              <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold text-2xl border border-primary/10 shadow-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight">{user.email}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-normal text-muted-foreground">ID: {user.id}</Badge>
                  <Badge className="bg-primary/20 text-primary border-none hover:bg-primary/25">
                    {user.role === "Admin" ? "Quản trị viên hệ thống" : "Tài khoản khách hàng"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={() => toast.info("Tính năng sắp ra mắt")}>
                Chỉnh sửa tài khoản
              </Button>
            </div>
          </div>
        </div>

        {/* User Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Trạng thái tài khoản</p>
                  <p className="text-xl font-bold">Hoạt động</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Ngày tham gia</p>
                  <p className="text-xl font-bold">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Mức độ bảo mật</p>
                  <p className="text-xl font-bold">Tiêu chuẩn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Details Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="bg-card/50 border-border/50 overflow-hidden">
              <CardHeader className="bg-muted/50 border-b border-border/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Chi tiết tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Email</label>
                  <p className="text-sm truncate">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">Vai trò</label>
                  <p className="text-sm">{user.role}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">User ID</label>
                  <p className="text-sm break-all font-mono text-[11px] bg-muted/50 p-1.5 rounded">{user.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profiles Section */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="bg-card/30 border-border/30 shadow-sm overflow-hidden border-border/50">
              <CardHeader className="bg-card/50 border-b border-border/30 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Hồ sơ liên kết</CardTitle>
                    <CardDescription className="mt-1">
                      Các hồ sơ đăng ký và trình quản lý mạng xã hội của người dùng này.
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                    {profiles.length} Hồ sơ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-6 py-4">
                  {profiles.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center gap-2 opacity-60">
                      <Activity className="h-10 w-10 text-muted-foreground" />
                      <p>Chưa có hồ sơ quản lý nào được liên kết với tài khoản này.</p>
                    </div>
                  ) : (
                    <DataTable
                      columns={profileColumns}
                      data={profiles}
                      showSearch={true}
                      showPageSize={true}
                      pageSize={5}
                      className="border-none"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
