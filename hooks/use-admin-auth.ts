"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { api, endpoints } from "@/lib/api";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export function useAdminAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session) {
          router.push('/auth/login');
          return;
        }

        // Check user role from API
        try {
          const userResponse = await api.get(endpoints.userProfile);
          const userData = userResponse.data as any;

          // Check if user has admin role (role = "Admin" or role = 2)
          const hasAdminRole = userData.role === "Admin" || userData.role === 2 || userData.role === "2";
          
          if (!hasAdminRole) {
            toast.error('Access denied. Admin privileges required.');
            await supabase.auth.signOut();
            router.push('/auth/login');
            return;
          }

          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
          });
          setIsAdmin(true);
        } catch (roleError) {
          console.error('Role check error:', roleError);
          toast.error('Failed to verify admin privileges.');
          await supabase.auth.signOut();
          router.push('/auth/login');
          return;
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isLoading, isAdmin, user };
}

export function useRedirectIfLoggedIn() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Check if user is admin
          try {
            const userResponse = await api.get(endpoints.userProfile);
            const userData = userResponse.data as any;
            const hasAdminRole = userData.role === "Admin" || userData.role === 2 || userData.role === "2";
            
            if (hasAdminRole) {
              router.push('/');
              return;
            }
          } catch (error) {
            // If check fails, allow login page
            console.error('Role check error:', error);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  return { isChecking };
}

