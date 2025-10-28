"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoadingSkeleton({ className, children }: LoadingSkeletonProps) {
  if (children) {
    return (
      <div className={cn("animate-pulse", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse bg-muted rounded", className)} />
  );
}

// Predefined skeleton components for common use cases
export function ProfileCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-3">
        <LoadingSkeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-3 w-24" />
        </div>
      </div>
      <LoadingSkeleton className="h-3 w-full" />
      <LoadingSkeleton className="h-3 w-3/4" />
      <div className="flex gap-2">
        <LoadingSkeleton className="h-8 w-16" />
        <LoadingSkeleton className="h-8 w-16" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function DataTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <LoadingSkeleton className="h-10 flex-1" />
        <LoadingSkeleton className="h-10 w-32" />
        <LoadingSkeleton className="h-10 w-24" />
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b">
          <LoadingSkeleton className="h-10 w-10 rounded-full" />
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-4 w-48" />
          <LoadingSkeleton className="h-4 w-20" />
          <LoadingSkeleton className="h-4 w-24" />
          <div className="flex gap-2 ml-auto">
            <LoadingSkeleton className="h-8 w-8" />
            <LoadingSkeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-32" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-20" />
        <LoadingSkeleton className="h-24 w-full" />
      </div>
      <div className="flex gap-3">
        <LoadingSkeleton className="h-10 flex-1" />
        <LoadingSkeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
