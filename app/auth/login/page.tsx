"use client";

import { LoginForm } from "@/components/pages/login/login-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";
import { useRedirectIfLoggedIn } from "@/hooks/use-admin-auth";

export default function Page() {
  const { isChecking } = useRedirectIfLoggedIn();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to your admin account"
      quote="AISAM Admin helps manage and optimize social media campaigns efficiently and securely."
      author="@AISAM Admin Team"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}