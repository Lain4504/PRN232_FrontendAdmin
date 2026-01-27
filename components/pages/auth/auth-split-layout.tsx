"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function AuthSplitLayout({
  children,
  title = "Welcome back",
  subtitle = "Sign in to your account",
  quote = "Omniadly Admin helps manage and optimize social media campaigns efficiently and securely.",
  author = "@Omniadly Admin Team",
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  quote?: string;
  author?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left: Form area */}
        <div className="flex items-center justify-center p-3 sm:p-6 lg:p-12 min-h-screen lg:min-h-0">
          <div className="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Logo */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 sm:mb-6">
                <div className="relative">
                  <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-r from-primary to-primary/80 shadow-lg" />
                  <Sparkles className="absolute -top-1 -right-1 size-2.5 sm:size-3 text-primary animate-pulse" />
                </div>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Omniadly Admin
                </span>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground text-base sm:text-lg">{subtitle}</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-transparent rounded-2xl p-4 sm:p-6 lg:p-8 shadow-none border-0">
              {children}
            </div>
          </div>
        </div>

        {/* Right: Features/Testimonial */}
        <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="absolute top-20 right-20 size-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 size-24 rounded-full bg-primary/5 blur-2xl" />

          <div className="relative z-10 max-w-lg space-y-8">
            {/* Quote */}
            <div className="space-y-6">
              <div className="text-6xl leading-none text-primary/20 font-serif">&ldquo;</div>
              <p className="text-2xl font-medium leading-relaxed text-foreground/90">
                {quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">A</span>
                </div>
                <div>
                  <p className="font-medium">{author}</p>
                  <p className="text-sm text-muted-foreground">Admin Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}