"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Building, Share2, Users } from "lucide-react";
import { api, endpoints, Profile, Subscription } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

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

const brandColumns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Brand Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge variant={row.getValue("status") === "Active" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

const socialAccountColumns: ColumnDef<SocialAccount>[] = [
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge variant={row.getValue("status") === "Active" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

const teamColumns: ColumnDef<Team>[] = [
  {
    accessorKey: "name",
    header: "Team Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <Badge variant={row.getValue("status") === "Active" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>;
    },
  },
  {
    accessorKey: "memberCount",
    header: "Members",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return new Date(row.getValue("createdAt")).toLocaleDateString();
    },
  },
];

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Check admin role
        const userResponse = await api.get(endpoints.userProfile);
        const userData = userResponse.data as any;

        if (userData.role !== "Admin" && userData.role !== 2) {
          toast.error('Access denied. Admin privileges required.');
          await supabase.auth.signOut();
          router.push('/auth/login');
          return;
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId || !profileId) return;

      try {
        // Fetch profile details
        const profilesResponse = await api.get(endpoints.profilesByUser(userId));
        const userProfiles = (profilesResponse.data as Profile[]) || [];
        const currentProfile = userProfiles.find(p => p.id === profileId);

        if (!currentProfile) {
          throw new Error('Profile not found');
        }

        setProfile(currentProfile);

        // Fetch subscription for this profile
        const subscriptionsResponse = await api.get('/payment/subscriptions');
        const userSubscriptions = (subscriptionsResponse.data as Subscription[])?.filter(
          sub => sub.profileId === profileId
        ) || [];
        setSubscription(userSubscriptions[0] || null);

        // Fetch user brands - skip for now as it requires specific permissions
        setBrands([]);

        // Fetch user social accounts
        try {
          const socialAccountsResponse = await api.get(endpoints.socialAccountsUser(userId));
          setSocialAccounts((socialAccountsResponse.data as SocialAccount[]) || []);
        } catch (error) {
          console.error("Failed to fetch social accounts:", error);
          setSocialAccounts([]);
        }

        // Fetch user teams
        try {
          const teamsResponse = await api.get(endpoints.userTeams());
          setTeams((teamsResponse.data as Team[]) || []);
        } catch (error) {
          console.error("Failed to fetch teams:", error);
          setTeams([]);
        }

      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested profile could not be found.</p>
          <Button onClick={() => router.push(`/user/${userId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Details
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" size="sm" className="mb-4 w-full sm:w-auto" onClick={() => router.push(`/user/${userId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Details
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">Profile Details</h1>
              <p className="text-muted-foreground">Complete information for {profile.name}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan</p>
                    <p>{subscription.plan}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant={subscription.isActive ? "default" : "secondary"}>
                      {subscription.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Posts/Month</p>
                    <p>{subscription.quotaPostsPerMonth}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storage (GB)</p>
                    <p>{subscription.quotaStorageGb}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No subscription found</p>
              )}
            </CardContent>
          </Card>

          {/* Brands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Brands ({brands.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brands.length === 0 ? (
                <p className="text-muted-foreground">No brands found for this profile.</p>
              ) : (
                <DataTable
                  columns={brandColumns}
                  data={brands}
                  showSearch={false}
                  showPageSize={false}
                  pageSize={5}
                />
              )}
            </CardContent>
          </Card>

          {/* Social Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Social Accounts ({socialAccounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialAccounts.length === 0 ? (
                <p className="text-muted-foreground">No social accounts found for this profile.</p>
              ) : (
                <DataTable
                  columns={socialAccountColumns}
                  data={socialAccounts}
                  showSearch={false}
                  showPageSize={false}
                  pageSize={5}
                />
              )}
            </CardContent>
          </Card>

          {/* Teams */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teams ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-muted-foreground">No teams found for this profile.</p>
              ) : (
                <DataTable
                  columns={teamColumns}
                  data={teams}
                  showSearch={false}
                  showPageSize={false}
                  pageSize={5}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}