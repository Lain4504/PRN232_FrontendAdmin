"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Globe, Palette, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Cài đặt hệ thống</h1>
                    <p className="text-muted-foreground">Cấu hình hành vi bảng quản trị Omniadly và các tùy chọn hệ thống.</p>
                </div>

                <div className="flex flex-col gap-6">
                    <Card className="border-border/50 bg-card/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/20 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Giao diện & UI</CardTitle>
                                    <CardDescription>Cá nhân hóa trải nghiệm trang quản trị của bạn.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Thanh bên thu gọn</Label>
                                    <p className="text-xs text-muted-foreground">Tự động thu gọn thanh bên khi tải trang.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Đồng bộ chế độ tối</Label>
                                    <p className="text-xs text-muted-foreground">Mặc định theo cài đặt màu của hệ thống.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Giảm hiệu ứng chuyển động</Label>
                                    <p className="text-xs text-muted-foreground">Giảm thiểu các hiệu ứng chuyển động mạnh trên trang quản trị.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/20 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Thông báo hệ thống</CardTitle>
                                    <CardDescription>Cấu hình cách bạn nhận các cảnh báo hệ thống quan trọng.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Thông báo đẩy</Label>
                                    <p className="text-xs text-muted-foreground">Nhận thông báo trình duyệt cho các sự kiện hệ thống.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Bản tin Email</Label>
                                    <p className="text-xs text-muted-foreground">Nhận bản tóm tắt hàng tuần về hoạt động của nền tảng.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/20 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Khu vực & Dữ liệu</CardTitle>
                                    <CardDescription>Quản lý dữ liệu và các tùy chọn bản địa hóa của bạn.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Tự động dịch</Label>
                                    <p className="text-xs text-muted-foreground">Dịch nội dung người dùng sang ngôn ngữ chính của bạn.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="outline" className="rounded-xl font-bold">Đặt lại mặc định</Button>
                                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">Lưu thay đổi</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
