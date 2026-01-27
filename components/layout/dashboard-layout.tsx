"use client";

import React from "react";
import { AdminSidebar } from "./admin-sidebar";
import {
    LogOut,
    Bell,
    Search,
    LayoutDashboard,
    Settings,
    User as UserIcon,
    HelpCircle,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { authStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const { user: adminUser } = useAdminAuth();

    const handleLogout = () => {
        authStore.clearAuth();
        toast.success("Đăng xuất thành công");
        router.push("/auth/login");
    };

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
                {/* Shadcn Sidebar */}
                <Sidebar collapsible="icon" className="border-r border-border/50">
                    <SidebarHeader className="h-16 px-4 flex flex-row items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden overflow-hidden">
                            <span className="font-bold text-sm tracking-tight truncate">QUẢN TRỊ OMNIADLY</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Quản trị</span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="px-2">
                        <AdminSidebar />
                    </SidebarContent>

                    <SidebarFooter className="p-2 border-t border-border/50">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Trung tâm hỗ trợ" className="text-muted-foreground hover:text-foreground">
                                    <HelpCircle className="h-4 w-4" />
                                    <span>Trung tâm hỗ trợ</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                {/* Main Content Area */}
                <SidebarInset className="flex flex-col min-w-0 overflow-hidden bg-muted/20">
                    {/* Header */}
                    <header className="sticky top-0 h-16 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-sm z-30 shrink-0">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="h-4 mr-2" />
                            <div className="relative hidden md:flex items-center">
                                <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    placeholder="Tìm kiếm..."
                                    className="pl-9 w-64 lg:w-96 h-9 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary/40 transition-all rounded-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-5">
                            <Button variant="ghost" size="icon" className="relative group hover:bg-muted/60 rounded-full h-9 w-9">
                                <Bell className="h-[1.1rem] w-[1.1rem] text-muted-foreground group-hover:text-foreground transition-colors" />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
                            </Button>

                            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative flex items-center gap-2.5 px-1.5 py-1.5 hover:bg-muted/60 transition-all rounded-full sm:rounded-lg">
                                        <Avatar className="h-8 w-8 border border-border/50 shadow-sm ring-1 ring-border/5 transition-transform hover:scale-105">
                                            <AvatarImage src={""} alt={adminUser?.email} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                {adminUser?.email?.charAt(0) || "A"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                                            <span className="text-xs font-bold leading-none">{adminUser?.fullName || "Quản trị viên"}</span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[100px]">
                                                {adminUser?.email}
                                            </span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-60 mt-2 shadow-2xl border-border/40 p-1.5 font-sans" sideOffset={8}>
                                    <DropdownMenuLabel className="font-normal px-2 py-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-bold tracking-tight">{adminUser?.fullName || "Quản trị viên OmniAdly"}</p>
                                            <p className="text-[11px] text-muted-foreground font-mono">{adminUser?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="opacity-50" />
                                    <div className="py-1">
                                        <DropdownMenuItem onClick={() => router.push("/profile")} className="rounded-md gap-3 cursor-pointer py-2">
                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Cài đặt tài khoản</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push("/settings")} className="rounded-md gap-3 cursor-pointer py-2">
                                            <Settings className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">Cài đặt hệ thống</span>
                                        </DropdownMenuItem>
                                    </div>
                                    <DropdownMenuSeparator className="opacity-50" />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/5 rounded-md gap-3 cursor-pointer py-2 mt-1">
                                        <LogOut className="h-4 w-4" />
                                        <span className="text-sm font-semibold">Đăng xuất</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-10">
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {children}
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
