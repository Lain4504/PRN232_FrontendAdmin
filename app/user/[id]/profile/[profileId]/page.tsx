"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Building, Share2, Users, Calendar, Activity, Info, ExternalLink, Shield } from "lucide-react";
import { api, endpoints, Profile, Subscription } from "@/lib/api";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const formatPlatformName = (platform: string): string => {
  if (!platform) return 'Unknown';
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
};

interface Brand {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
}

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  status: string;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  memberCount: number;
}

export default function ProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const profileId = params.profileId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  const brandColumns: ColumnDef<Brand>[] = [
    {
      accessorKey: "name",
      header: "Tên thương hiệu",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>
    },
    {
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => <span className="text-muted-foreground text-sm line-clamp-1 max-w-[300px]">{row.original.description || "—"}</span>
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
          "font-semibold",
          row.original.status === "Hoạt động" || row.original.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-transparent"
        )}>
          {row.original.status === "Active" ? "Hoạt động" : (row.original.status === "Active" ? "Hoạt động" : row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
    },
  ];

  const socialAccountColumns: ColumnDef<SocialAccount>[] = [
    {
      accessorKey: "platform",
      header: "Nền tảng",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-muted font-medium">
          {row.original.platform}
        </Badge>
      )
    },
    {
      accessorKey: "username",
      header: "Tên đăng nhập",
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.username}</span>
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
          "font-semibold",
          row.original.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-transparent"
        )}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày liên kết",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
    },
  ];

  const teamColumns: ColumnDef<Team>[] = [
    {
      accessorKey: "name",
      header: "Tên đội ngũ",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>
    },
    {
      accessorKey: "memberCount",
      header: "Thành viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.original.memberCount} thành viên</span>
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
          "font-semibold",
          row.original.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground border-transparent"
        )}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày thành lập",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.createdAt).toLocaleDateString()}</span>
    },
  ];

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    if (!userId || !profileId) return;

    const fetchProfileData = async () => {
      try {
        const profilesResponse = await api.get(endpoints.profilesByUser(userId));
        const userProfilesData = (profilesResponse.data as any[]) || [];
        const userProfiles = userProfilesData.map((p: any) => ({
          ...p,
          profileType: mapProfileType(p.profileType),
          status: mapProfileStatus(p.status)
        }));
        const currentProfile = userProfiles.find(p => p.id === profileId);

        if (!currentProfile) throw new Error('Profile not found');
        setProfile(currentProfile);

        const subscriptionsResponse = await api.get('/payment/subscriptions');
        const userSubscriptions = (subscriptionsResponse.data as Subscription[])?.filter(
          sub => sub.profileId === profileId
        ) || [];
        setSubscription(userSubscriptions[0] || null);

        // Fetch Brands, Social Accounts, and Teams with proper headers
        const originalProfileId = typeof window !== 'undefined' ? localStorage.getItem('activeProfileId') : null;
        if (typeof window !== 'undefined') localStorage.setItem('activeProfileId', profileId);

        try {
          const [brandsRes, socialRes, teamsRes] = await Promise.all([
            api.get(endpoints.brands()),
            api.get(endpoints.socialAccountsUser(profileId)),
            api.get(endpoints.userTeams())
          ]);

          const brandsData = (brandsRes.data as any)?.data || brandsRes.data || [];
          setBrands(brandsData.map((b: any) => ({
            id: b.id,
            name: b.name || 'Unnamed Brand',
            description: b.description || '',
            status: b.isDeleted ? 'Deleted' : 'Active',
            createdAt: b.createdAt || new Date().toISOString()
          })));

          const socialData = (socialRes.data as any[]) || [];
          setSocialAccounts(socialData.map((account: any) => ({
            id: account.id,
            platform: formatPlatformName(account.provider || account.platform || 'Unknown'),
            username: account.providerUserId || account.username || 'N/A',
            status: account.isActive ? 'Active' : 'Inactive',
            createdAt: account.createdAt || new Date().toISOString()
          })));

          setTeams((teamsRes.data as Team[]) || []);
        } finally {
          if (typeof window !== 'undefined') {
            if (originalProfileId) localStorage.setItem('activeProfileId', originalProfileId);
            else localStorage.removeItem('activeProfileId');
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Không thể tải dữ liệu hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, profileId, authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-muted-foreground animate-pulse">
        <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Không tìm thấy hồ sơ</h1>
          <p className="text-muted-foreground max-w-sm">
            Chúng tôi không thể tìm thấy hồ sơ theo yêu cầu của tài khoản người dùng này.
          </p>
          <Button onClick={() => router.push(`/user/${userId}`)} variant="outline">
            Quay lại chi tiết người dùng
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
            onClick={() => router.push(`/user/${userId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Chi tiết người dùng
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="font-normal text-muted-foreground">Hồ sơ: {profile.id}</Badge>
                  <Badge className={cn(
                    "font-semibold",
                    profile.profileType === "Pro" || profile.profileType === "Chuyên nghiệp" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    Gói {profile.profileType}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Trạng thái</p>
                  <p className="text-lg font-bold">{profile.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Công ty</p>
                  <p className="text-lg font-bold truncate max-w-[120px]">{profile.companyName || "N/A"}</p>
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
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Thành viên từ</p>
                  <p className="text-lg font-bold">{new Date(profile.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-none relative overflow-hidden shadow-lg shadow-primary/20">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12" />
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs opacity-80 font-bold uppercase tracking-wider">Vai trò hệ thống</p>
                  <p className="text-lg font-bold">Thực thể quản lý</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Info & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metadata & Subscription Sidebar */}
          <div className="flex flex-col gap-6">
            <Card className="bg-card/50 border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/40 border-b border-border/20 py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" /> Siêu dữ liệu hồ sơ
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tiểu sử</label>
                  <p className="text-sm leading-relaxed text-foreground/80">{profile.bio || "Chưa có thông tin."}</p>
                </div>
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cập nhật lần cuối</label>
                  <p className="text-xs font-mono">{new Date(profile.updatedAt).toLocaleString("vi-VN")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Thông tin gói đăng ký
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                      <span className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Gói đang hoạt động</span>
                      <Badge className="bg-primary text-primary-foreground font-bold">{subscription.plan}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Posts/Mo</p>
                        <p className="text-lg font-black">{subscription.quotaPostsPerMonth}</p>
                      </div>
                      <div className="p-3 rounded-xl border border-border/50 text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Dung lượng</p>
                        <p className="text-lg font-black">{subscription.quotaStorageGb}GB</p>
                      </div>
                    </div>
                    <div className="pt-2 text-center">
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-1">Có hiệu lực đến</p>
                      <p className="text-xs font-mono font-bold">
                        {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString("vi-VN") : "Vĩnh viễn"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">No active subscription found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Resources Tabs */}
          <div className="lg:col-span-2">
            <Card className="bg-card/30 border-border/50 shadow-xl shadow-foreground/[0.02] overflow-hidden min-h-[600px]">
              <Tabs defaultValue="brands" className="w-full">
                <CardHeader className="bg-card/50 border-b border-border/20 px-6 py-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-xl">Tài nguyên</CardTitle>
                      <CardDescription>Các thực thể được quản lý liên kết với hồ sơ này.</CardDescription>
                    </div>
                    <TabsList className="bg-background/80 border border-border/40 p-1 rounded-xl">
                      <TabsTrigger value="brands" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Building className="h-3.5 w-3.5 mr-2" /> Thương hiệu
                      </TabsTrigger>
                      <TabsTrigger value="social" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Share2 className="h-3.5 w-3.5 mr-2" /> MXH
                      </TabsTrigger>
                      <TabsTrigger value="teams" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                        <Users className="h-3.5 w-3.5 mr-2" /> Đội ngũ
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <TabsContent value="brands" className="m-0 focus-visible:outline-none">
                    <div className="p-6">
                      {brands.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-700">
                          <div className="h-16 w-16 rounded-3xl bg-muted/40 flex items-center justify-center">
                            <Building className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div>
                            <p className="text-lg font-bold">Chưa có thương hiệu nào</p>
                            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">Hồ sơ này chưa khởi tạo bất kỳ thông tin thương hiệu kinh doanh nào.</p>
                          </div>
                        </div>
                      ) : (
                        <DataTable
                          columns={brandColumns}
                          data={brands}
                          showSearch={true}
                          showPageSize={true}
                          pageSize={5}
                          className="border-none"
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="m-0 focus-visible:outline-none">
                    <div className="p-6">
                      {socialAccounts.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-700">
                          <div className="h-16 w-16 rounded-3xl bg-muted/40 flex items-center justify-center">
                            <Share2 className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div>
                            <p className="text-lg font-bold">Chưa có kết nối mạng xã hội</p>
                            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">Hiện chưa có nền tảng mạng xã hội bên ngoài nào được liên kết.</p>
                          </div>
                        </div>
                      ) : (
                        <DataTable
                          columns={socialAccountColumns}
                          data={socialAccounts}
                          showSearch={true}
                          showPageSize={true}
                          pageSize={5}
                          className="border-none"
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="teams" className="m-0 focus-visible:outline-none">
                    <div className="p-6">
                      {teams.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-700">
                          <div className="h-16 w-16 rounded-3xl bg-muted/40 flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div>
                            <p className="text-lg font-bold">Hồ sơ cá nhân</p>
                            <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">Hồ sơ này không thuộc bất kỳ nhóm làm việc hoặc đội ngũ tổ chức nào.</p>
                          </div>
                        </div>
                      ) : (
                        <DataTable
                          columns={teamColumns}
                          data={teams}
                          showSearch={true}
                          showPageSize={true}
                          pageSize={5}
                          className="border-none"
                        />
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
