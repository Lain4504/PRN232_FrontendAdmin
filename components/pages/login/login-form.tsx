"use client";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData, type AuthError } from "@/lib/types/auth";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<any>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const { accessToken, refreshToken, user: userData } = response.data;

      authStore.setTokens(accessToken, refreshToken);

      const hasAdminRole = userData.role === "Admin" || userData.role === 2 || userData.role === "2";

      if (hasAdminRole) {
        authStore.setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName
        });
        toast.success("Welcome back, " + (userData.fullName || "Admin") + "!");
        router.push("/");
      } else {
        toast.error("Access denied. Admin privileges required.");
        authStore.clearAuth();
      }
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || "An unexpected error occurred",
      };
      setError(authError);
      toast.error(authError.message);
    } finally {
      setIsLoading(false);
    }
    const handleGoogleLogin = async () => {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!googleClientId) {
        toast.error('Google OAuth is not configured');
        return;
      }

      setIsGoogleLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
        toast.error('Google Sign-In library chưa được tải. Vui lòng tải lại trang.');
        setIsGoogleLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (response: any) => {
          try {
            const apiResponse = await api.post<any>("/auth/google", {
              idToken: response.credential
            });

            if (!apiResponse.success) {
              throw new Error(apiResponse.message || "Google login failed");
            }

            const { accessToken, refreshToken, user: userData } = apiResponse.data;

            const hasAdminRole = userData.role === "Admin" || userData.role === 2 || userData.role === "2";

            if (hasAdminRole) {
              authStore.setTokens(accessToken, refreshToken);
              authStore.setUser({
                id: userData.id,
                email: userData.email,
                role: userData.role,
                fullName: userData.fullName
              });
              toast.success("Welcome back, " + (userData.fullName || "Admin") + "!");
              router.push("/");
            } else {
              toast.error("Access denied. Admin privileges required.");
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Đăng nhập Google thất bại";
            toast.error(message);
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });

      const buttonWrapper = document.createElement('div');
      buttonWrapper.id = 'google-signin-trigger';
      buttonWrapper.style.cssText = 'position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;';
      document.body.appendChild(buttonWrapper);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google.accounts.id.renderButton(buttonWrapper, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      });

      setTimeout(() => {
        const googleButton = buttonWrapper.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          googleButton.click();
        } else {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).google.accounts.id.prompt();
          } catch (err) {
            console.error('Google Sign-In failed:', err);
            setIsGoogleLoading(false);
            toast.error('Không thể khởi tạo Google Sign-In. Vui lòng thử lại.');
          }
        }
      }, 200);
    };

    useEffect(() => {
      if (typeof window === 'undefined') return;

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        // Cleanup if needed
      };
    }, []);

    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <div className="flex flex-col space-y-2 text-center mb-2">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Console</h1>
          <p className="text-sm text-muted-foreground font-light px-8">
            Enter your credentials to access the AISAM administration dashboard.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: ControllerRenderProps<LoginFormData, "email"> }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <Input
                          {...field}
                          type="email"
                          placeholder="admin@aisam.com"
                          className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: ControllerRenderProps<LoginFormData, "password"> }) => (
                  <FormItem>
                    <div className="flex items-center justify-between ml-1">
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security Key</FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-[11px] font-medium text-primary hover:underline underline-offset-4"
                      >
                        Recovery?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <PasswordInput
                          {...field}
                          placeholder="••••••••"
                          className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px] font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20 py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold shadow-lg shadow-primary/20 group relative overflow-hidden"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary-foreground/70" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 rounded-lg border-muted bg-white hover:bg-slate-50 transition-all font-medium text-slate-700 shadow-sm"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 mr-3 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Sign in with Google
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">Or Sign in with Email</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground leading-relaxed font-light">
          AISAM Global Admin Panel. By continuing, you agree to our
          <Link href="#" className="underline underline-offset-2 mx-1 hover:text-primary transition-colors">Internal Security Policy</Link>.
        </p>
      </div>
    );
  }
