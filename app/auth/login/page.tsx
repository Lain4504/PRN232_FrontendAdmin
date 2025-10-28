import type { Metadata } from "next";
import { LoginForm } from "@/components/pages/login/login-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Sign in | AISAM Admin",
  description: "Sign in to your AISAM Admin account",
};

export default function Page() {
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