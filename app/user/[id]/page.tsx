"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, CreditCard } from "lucide-react";
import { api, endpoints, Profile, Subscription } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  socialAccountsCount: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
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
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        // Fetch user details - use the paginated endpoint to get individual user
        const userResponse = await api.get(`${endpoints.userSearch}?search=${userId}&pageSize=1`);
        const userData = userResponse.data as any;
        const user = userData?.data?.[0]; // Get first user from paginated response
        if (user) {
          setUser(user);
        } else {
          throw new Error('User not found');
        }

        // Fetch user profiles
        const profilesResponse = await api.get(endpoints.profilesByUser(userId));
        setProfiles((profilesResponse.data as Profile[]) || []);

        // Fetch user subscriptions
        const subscriptionsResponse = await api.get('/payment/subscriptions');
        const userSubscriptions = (subscriptionsResponse.data as Subscription[])?.filter(
          sub => (profilesResponse.data as Profile[])?.some((profile: Profile) => profile.id === sub.profileId)
        ) || [];
        setSubscriptions(userSubscriptions);

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p className="text-sm">{user.role}</p>
                </div>
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
          {/* Desktop: Two column layout, Mobile: Single column */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profiles List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profiles ({profiles.length})
                </CardTitle>
                <CardDescription className="hidden sm:block">
                  Click on a profile to view its subscription details
                </CardDescription>
                <CardDescription className="sm:hidden">
                  Tap a profile to view subscription details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-muted-foreground">No profiles found for this user.</p>
                ) : (
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <Card
                        key={profile.id}
                        className={`cursor-pointer transition-all hover:shadow-md active:scale-95 ${
                          selectedProfile?.id === profile.id ? 'ring-2 ring-primary shadow-md' : ''
                        }`}
                        onClick={() => setSelectedProfile(profile)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{profile.name}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {profile.profileType} • {profile.status}
                              </p>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {profile.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card className={`${selectedProfile ? 'block' : 'hidden'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Details
                </CardTitle>
                <CardDescription>
                  {selectedProfile ? `Subscription for ${selectedProfile.name}` : 'Select a profile to view subscription details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedProfile ? (
                  (() => {
                    const profileSubscription = subscriptions.find(sub => sub.profileId === selectedProfile.id);
                    return profileSubscription ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Plan</p>
                            <p className="text-lg font-semibold">{profileSubscription.plan}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={profileSubscription.isActive ? "default" : "secondary"} className="mt-1">
                              {profileSubscription.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Posts/Month</p>
                            <p className="text-lg font-semibold">{profileSubscription.quotaPostsPerMonth}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                            <p className="text-sm">{new Date(profileSubscription.startDate).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {profileSubscription.endDate && (
                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">End Date</p>
                            <p className="text-sm">{new Date(profileSubscription.endDate).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-2">Profile Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Profile Type:</span>
                              <span className="text-right">{selectedProfile.profileType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span className="text-right">{new Date(selectedProfile.createdAt).toLocaleDateString()}</span>
                            </div>
                            {selectedProfile.companyName && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Company:</span>
                                <span className="text-right">{selectedProfile.companyName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No subscription found for this profile.</p>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a profile from the list to view subscription details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}