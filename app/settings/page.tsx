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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Settings</h1>
                    <p className="text-muted-foreground">Configure the AISAM administration panel behavior and system preferences.</p>
                </div>

                <div className="flex flex-col gap-6">
                    <Card className="border-border/50 bg-card/50 overflow-hidden shadow-sm">
                        <CardHeader className="bg-muted/30 border-b border-border/20 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Palette className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Appearance & UI</CardTitle>
                                    <CardDescription>Personalize your dashboard experience.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Compact Sidebar</Label>
                                    <p className="text-xs text-muted-foreground">Minimize the sidebar automatically on load.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Dark Mode Sync</Label>
                                    <p className="text-xs text-muted-foreground">Follow system color preference for the UI.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Reduced Motion</Label>
                                    <p className="text-xs text-muted-foreground">Minimize high-intensity animations across the dashboard.</p>
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
                                    <CardTitle className="text-lg">System Notifications</CardTitle>
                                    <CardDescription>Configure how you receive critical system alerts.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Push Notifications</Label>
                                    <p className="text-xs text-muted-foreground">Receive browser notifications for system events.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Email Digest</Label>
                                    <p className="text-xs text-muted-foreground">Receive a weekly summary of platform activity.</p>
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
                                    <CardTitle className="text-lg">Regional & Data</CardTitle>
                                    <CardDescription>Manage your data and localization preferences.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Auto-Translation</Label>
                                    <p className="text-xs text-muted-foreground">Translate user content into your primary language.</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="outline" className="rounded-xl font-bold">Reset to Default</Button>
                                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">Save Changes</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
