"use client";

import { cn, getBaseUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, type ControllerRenderProps } from "react-hook-form";
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

      // Save tokens
      authStore.setTokens(accessToken, refreshToken);

      // Check if user is admin
      const hasAdminRole = userData.role === "Admin" || userData.role === 2 || userData.role === "2";

      if (hasAdminRole) {
        authStore.setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          fullName: userData.fullName
        });
        toast.success("Welcome back!");
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
  };

  const handleGoogleLogin = async () => {
    toast.error("Google login is currently disabled for Admin panel. Please use email/password.");
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)} {...props}>
      {/* Google Login */}
      <div className="space-y-2 sm:space-y-3">
        <Button
          variant="outline"
          className="w-full h-11 sm:h-10 text-sm font-medium"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          aria-label="Sign in with Google"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-muted-foreground bg-background">or</span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<LoginFormData, "email"> }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11 sm:h-10 text-sm"
                        aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                        aria-invalid={!!form.formState.errors.email}
                      />
                    </div>
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<LoginFormData, "password"> }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="Enter your password"
                        className="pl-10 h-11 sm:h-10 text-sm"
                        aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                        aria-invalid={!!form.formState.errors.password}
                      />
                    </div>
                  </FormControl>
                  <FormMessage id="password-error" />
                </FormItem>
              )}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 sm:h-10 text-sm font-medium"
            disabled={isLoading || isGoogleLoading}
            aria-describedby={error ? "login-error" : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}