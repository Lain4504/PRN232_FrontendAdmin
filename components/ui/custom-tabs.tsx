"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface CustomTabItem {
  value: string;
  label: string;
}

interface CustomTabsProps {
  items: CustomTabItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function CustomTabs({ 
  items, 
  activeTab, 
  onTabChange, 
  className 
}: CustomTabsProps) {
  return (
    <div className={cn(
      "flex gap-2 md:gap-6 mb-6 border-b border-border overflow-x-auto scrollbar-hide",
      className
    )}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onTabChange(item.value)}
          className={cn(
            "pb-2 px-2 md:px-1 text-sm font-medium flex items-center gap-1 md:gap-2 whitespace-nowrap flex-shrink-0 transition-colors",
            activeTab === item.value
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
