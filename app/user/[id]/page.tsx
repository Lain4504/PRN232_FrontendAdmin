"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard, Building, Share2, Users, Eye } from "lucide-react";
import { api, endpoints, Profile, Subscription } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mapping functions for profileType and status
const mapProfileType = (type: number | string): string => {
  if (typeof type === 'string') return type;
  const typeMap: Record<number, string> = {
    0: 'Free',
    1: 'Basic',
    2: 'Pro'
  };
  return typeMap[type] || 'Unknown';
};

const mapProfileStatus = (status: number | string): string => {
  if (typeof status === 'string') return status;
  const statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'Active',
    2: 'Suspended',
    3: 'Cancelled'
  };
  return statusMap[status] || 'Unknown';
};

interface UserDetail {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  socialAccountsCount: number;
}

interface CombinedProfileSubscription {
  profileId: string;
  profileName: string;
  profileType: string;
  profileStatus: string;
  plan: string;
  isActive: boolean;
  quotaPostsPerMonth: number;
  startDate: string;
  endDate?: string;
}

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

interface ProfileDetailsModalProps {
  profile: Profile;
  subscriptions: Subscription[];
  brands: Brand[];
  socialAccounts: SocialAccount[];
  teams: Team[];
}

function ProfileDetailsModal({ profile, subscriptions, brands, socialAccounts, teams }: ProfileDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Details: {profile.name}
          </DialogTitle>
          <DialogDescription>
            Complete information for this profile including subscription, brands, social accounts, and teams.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{profile.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant={profile.profileType === "Pro" ? "default" : profile.profileType === "Basic" ? "secondary" : "outline"}>
                    {profile.profileType}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={profile.status === "Active" ? "default" : "secondary"}>
                    {profile.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p>{profile.companyName || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Bio</p>
                  <p>{profile.bio || "No bio available"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const createProfileColumns = (currentUserId: string): ColumnDef<Profile>[] => [
    {
      accessorKey: "name",
      header: "Profile Name",
    },
    {
      accessorKey: "profileType",
      header: "Type",
      cell: ({ row }) => {
        const profileType = row.getValue("profileType") as string;
        return <Badge variant={profileType === "Pro" ? "default" : profileType === "Basic" ? "secondary" : "outline"}>
          {profileType}
        </Badge>;
      },
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
      accessorKey: "companyName",
      header: "Company",
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
      header: "Actions",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = `/user/${currentUserId}/profile/${profile.id}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        );
      },
    },
  ];

  const [user, setUser] = useState<UserDetail | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [, setSubscriptions] = useState<Subscription[]>([]);
  const [, setCombinedData] = useState<CombinedProfileSubscription[]>([]);
  const [, setBrands] = useState<Brand[]>([]);
  const [, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLoading: authLoading, isAdmin } = useAdminAuth();

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        // Fetch user details - use the search endpoint with proper params
        const userResponse = await api.get(endpoints.userSearch({ 
          searchTerm: userId, 
          pageSize: 100 
        })).catch(err => {
          console.error('User search error:', err);
          return { data: { data: [] } };
        });
        
        const userData = userResponse.data as any;
        // API returns GenericResponse<PagedResult<UserListDto>>
        const users = userData?.data || [];
        // Find exact match by email or ID
        const foundUser = users.find((u: any) => u.email === userId || u.id === userId);
        if (foundUser) {
          setUser(foundUser);
        } else {
          // Try to get user by ID directly (if backend supports it)
          try {
            const directUserResponse = await api.get(endpoints.userById(userId));
            const directUserData = directUserResponse.data as any;
            setUser(directUserData);
          } catch {
            throw new Error('User not found');
          }
        }

        // Fetch user profiles
        const profilesResponse = await api.get(endpoints.profilesByUser(userId)).catch(err => {
          console.error('Profiles fetch error:', err);
          return { data: [] };
        });
        // API returns GenericResponse<IEnumerable<ProfileResponseDto>>
        const profilesData = profilesResponse.data as any;
        // Map profileType and status from numbers to strings
        const mappedProfiles = (profilesData || []).map((profile: any) => ({
          ...profile,
          profileType: mapProfileType(profile.profileType),
          status: mapProfileStatus(profile.status)
        }));
        setProfiles(mappedProfiles);

        // Fetch user subscriptions using admin endpoint
        const subscriptionsResponse = await api.get(endpoints.userSubscriptions(userId)).catch(err => {
          console.error('Subscriptions fetch error:', err);
          return { data: [] };
        });
        // API returns GenericResponse<IEnumerable<SubscriptionResponseDto>>
        const subscriptionsData = subscriptionsResponse.data as any;
        setSubscriptions(subscriptionsData || []);

        // Fetch user brands - skip for now as it requires specific permissions
        setBrands([]);

        // Fetch user social accounts
        try {
          const socialAccountsResponse = await api.get(endpoints.socialAccountsUser(userId));
          // API returns GenericResponse<IEnumerable<SocialAccountResponseDto>>
          const socialAccountsData = socialAccountsResponse.data as any;
          setSocialAccounts(socialAccountsData || []);
        } catch (error) {
          console.error("Failed to fetch social accounts:", error);
          setSocialAccounts([]);
        }

        // Fetch user teams
        try {
          const teamsResponse = await api.get(endpoints.userTeams());
          // API returns GenericResponse<IEnumerable<TeamResponseDto>>
          const teamsData = teamsResponse.data as any;
          setTeams(teamsData || []);
        } catch (error) {
          console.error("Failed to fetch teams:", error);
          setTeams([]);
        }

        // Combine profiles and subscriptions data (using mappedProfiles which already has mapped values)
        const combined = (mappedProfiles || []).map((profile: Profile) => {
          const subscription = (subscriptionsData || []).find((sub: Subscription) => sub.profileId === profile.id);
          return {
            profileId: profile.id,
            profileName: profile.name,
            profileType: profile.profileType,
            profileStatus: profile.status,
            plan: subscription?.plan || 'No Plan',
            isActive: subscription?.isActive || false,
            quotaPostsPerMonth: subscription?.quotaPostsPerMonth || 0,
            startDate: subscription?.startDate || '',
            endDate: subscription?.endDate,
          };
        });
        setCombinedData(combined);

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (error instanceof Error && error.message.includes('HTTP 401')) {
          toast.error("Authentication failed. Please log in again.");
          router.push('/auth/login');
        } else {
          toast.error("Failed to load user data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router, authLoading, isAdmin]);

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested user could not be found.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
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
          <Button variant="outline" size="sm" className="mb-4 w-full sm:w-auto" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">User Details</h1>
              <p className="text-muted-foreground">Manage user information and subscriptions</p>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {user.email}
              </CardTitle>
              <CardDescription>
                User ID: {user.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Profiles Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profiles ({profiles.length})
              </CardTitle>
              <CardDescription>
                User profiles with detailed information available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <p className="text-muted-foreground">No profiles found for this user.</p>
              ) : (
                <DataTable
                  columns={createProfileColumns(userId)}
                  data={profiles}
                  showSearch={true}
                  showPageSize={true}
                  pageSize={10}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}