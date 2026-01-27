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
      title="Chào mừng quay trở lại"
      subtitle="Đăng nhập vào tài khoản quản trị của bạn"
      quote="Hệ thống Quản trị OmniAdly giúp quản lý và tối ưu hóa các chiến dịch truyền thông xã hội một cách hiệu quả và an toàn."
      author="@Đội ngũ quản trị OmniAdly"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}