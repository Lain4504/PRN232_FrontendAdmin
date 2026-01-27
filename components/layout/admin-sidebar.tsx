"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Users,
  CreditCard,
  BarChart3,
  ShieldCheck,
  Zap,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "Tổng quan",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Thanh toán",
    url: "/payments",
    icon: CreditCard,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    isActive && "bg-primary/10 text-primary hover:bg-primary/15"
                  )}
                >
                  <Link href={item.url}>
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      isActive ? "text-primary" : "group-hover:scale-110"
                    )} />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
