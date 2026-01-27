"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { User, Mail, Shield, Calendar, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
    const { user } = useAdminAuth();

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Hồ sơ tài khoản</h1>
                    <p className="text-muted-foreground">Quản lý thông tin tài khoản quản trị và các tùy chọn của bạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="md:col-span-1 border-border/50 bg-card/50">
                        <CardContent className="pt-10 flex flex-col items-center">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                    <AvatarImage src={""} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                                        {user?.email?.charAt(0).toUpperCase() || "A"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-bold uppercase tracking-widest">Cập nhật</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <h2 className="text-xl font-bold">{user?.fullName || "Quản trị viên"}</h2>
                                <div className="flex items-center justify-center gap-1.5 mt-1 text-primary">
                                    <ShieldCheck className="h-4 w-4" />
                                    <span className="text-xs font-black uppercase tracking-[0.1em]">Mức độ xác thực 4</span>
                                </div>
                            </div>

                            <div className="w-full h-px bg-border/40 my-6" />

                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>Vai trò: {user?.role || "Quản trị viên"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="md:col-span-2 flex flex-col gap-6">
                        <Card className="border-border/50 bg-card/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Thông tin bảo mật</CardTitle>
                                <CardDescription>Cập nhật mật khẩu và cài đặt bảo mật.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Xác thực nhiều yếu tố</p>
                                            <p className="text-xs text-muted-foreground">Đã bật qua ứng dụng Authenticator</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="rounded-lg">Quản lý</Button>
                                </div>

                                <div className="p-4 rounded-xl border border-border/40 bg-background/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Phiên đăng nhập cuối</p>
                                            <p className="text-xs text-muted-foreground">Hôm nay lúc 14:45 • IP: 192.168.1.15</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5">Xem lịch sử</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/30">
                            <CardHeader>
                                <CardTitle className="text-lg">Vùng nguy hiểm</CardTitle>
                                <CardDescription>Các hành động quản trị nhạy cảm.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4">
                                <Button variant="destructive" className="flex-1 rounded-xl font-bold shadow-lg shadow-destructive/10">Thu hồi tất cả mã truy cập</Button>
                                <Button variant="outline" className="flex-1 rounded-xl font-bold">Liên hệ Quản trị viên cấp cao</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
