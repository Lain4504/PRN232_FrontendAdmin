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
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData, type AuthError } from "@/lib/types/auth";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  };

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

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Restricted Access</span>
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground leading-relaxed font-light">
        AISAM Global Admin Panel. By continuing, you agree to our
        <Link href="#" className="underline underline-offset-2 mx-1 hover:text-primary transition-colors">Internal Security Policy</Link>.
      </p>
    </div>
  );
}
