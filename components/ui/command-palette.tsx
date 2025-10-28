"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { 
  Search, 
  Users, 
  Building2, 
  BarChart3, 
  Calendar,
  Mail, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  Monitor,
  Target,
  Package,
  Sparkles,
  Share2,
  CheckCircle,
  Bell,
  TrendingUp,
  HelpCircle,
  BookOpen,
  Plus,
} from "lucide-react"

import {
  Command as CommandPrimitive,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Enhanced search data with categories and actions
interface SearchItem {
  title: string
  url?: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  category: string
  keywords?: string[]
  action?: () => void
  badge?: string
  isNew?: boolean
  isPopular?: boolean
}

const searchData: SearchItem[] = [
  // Navigation
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Building2,
    description: "Main dashboard overview",
    category: "Navigation",
    keywords: ["home", "overview", "main"]
  },
  {
    title: "Brands",
    url: "/dashboard/brands",
    icon: Target,
    description: "Manage your brands",
    category: "Navigation",
    keywords: ["brand", "company", "organization"]
  },
  {
    title: "Contents",
    url: "/dashboard/contents",
    icon: Sparkles,
    description: "AI-generated content management (redirects to brand content)",
    category: "Navigation",
    keywords: ["content", "ai", "generate", "create"]
  },
  {
    title: "Social Accounts",
    url: "/dashboard/social-accounts",
    icon: Share2,
    description: "Connect and manage social media accounts",
    category: "Navigation",
    keywords: ["social", "media", "facebook", "twitter", "instagram"]
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
    description: "Schedule and manage posts",
    category: "Navigation",
    keywords: ["schedule", "calendar", "posts", "timing"]
  },
  {
    title: "Posts",
    url: "/dashboard/posts",
    icon: Mail,
    description: "View and manage published posts",
    category: "Navigation",
    keywords: ["post", "published", "social", "media"]
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: TrendingUp,
    description: "View performance analytics",
    category: "Navigation",
    keywords: ["analytics", "performance", "metrics", "stats"]
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
    description: "Generate and view reports",
    category: "Navigation",
    keywords: ["report", "data", "export", "analysis"]
  },
  {
    title: "Approvals",
    url: "/dashboard/approvals",
    icon: CheckCircle,
    description: "Review pending approvals",
    category: "Navigation",
    keywords: ["approval", "review", "pending", "approve"]
  },
  {
    title: "Team",
    url: "/dashboard/team",
    icon: Users,
    description: "Manage team members",
    category: "Navigation",
    keywords: ["team", "member", "user", "collaboration"]
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
    description: "View all notifications",
    category: "Navigation",
    keywords: ["notification", "alert", "message", "update"]
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    description: "Manage your profile",
    category: "Navigation",
    keywords: ["profile", "account", "personal", "settings"]
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Application settings",
    category: "Navigation",
    keywords: ["settings", "preferences", "configuration"]
  },
  {
    title: "Help & Support",
    url: "/dashboard/help",
    icon: HelpCircle,
    description: "Get help and support",
    category: "Navigation",
    keywords: ["help", "support", "documentation", "guide"]
  },
  {
    title: "Documentation",
    url: "/dashboard/docs",
    icon: BookOpen,
    description: "Browse documentation",
    category: "Navigation",
    keywords: ["docs", "documentation", "guide", "manual"]
  }
]

// Quick actions
const quickActions: SearchItem[] = [
  {
    title: "Create New Brand",
    url: "/dashboard/brands/new",
    icon: Plus,
    description: "Set up a new brand profile",
    category: "Quick Actions",
    keywords: ["create", "new", "brand", "add"],
    isNew: true
  },
  {
    title: "Generate Content",
    url: "/dashboard/contents/new",
    icon: Sparkles,
    description: "Create AI-powered content",
    category: "Quick Actions",
    keywords: ["generate", "ai", "content", "create"],
    isPopular: true
  },
  {
    title: "Schedule Post",
    url: "/dashboard/calendar",
    icon: Calendar,
    description: "Schedule a new post",
    category: "Quick Actions",
    keywords: ["schedule", "post", "calendar", "publish"]
  },
  {
    title: "View Analytics",
    url: "/dashboard/analytics",
    icon: TrendingUp,
    description: "Check performance metrics",
    category: "Quick Actions",
    keywords: ["analytics", "performance", "metrics", "stats"]
  }
]

interface CommandPaletteProps {
  children?: React.ReactNode
  className?: string
}

export function CommandPalette({ children, className }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const { theme, setTheme } = useTheme()

  const handleSelect = (url: string) => {
    setOpen(false)
    window.location.href = url
  }

  const handleThemeToggle = (newTheme: string) => {
    setTheme(newTheme)
    setOpen(false)
  }

  const handleAction = (action: () => void) => {
    action()
    setOpen(false)
  }

  // Keyboard shortcut to open search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, SearchItem[]> = {}
    
    const allItems = searchData.concat(quickActions)
    allItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    
    return groups
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className={cn(
              "relative h-9 w-full items-center justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64",
              className
            )}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-flex">Search...</span>
            <span className="inline-flex lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-2xl">
        <CommandPrimitive className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Search pages, actions, and more..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            
            {Object.entries(groupedItems).map(([category, items]) => (
              <React.Fragment key={category}>
                <CommandGroup heading={category}>
                  {items.map((item) => (
                    <CommandItem
                      key={item.title}
                      value={`${item.title} ${item.description} ${item.keywords?.join(' ') || ''}`}
                      onSelect={() => {
                        if (item.url) {
                          handleSelect(item.url)
                        } else if (item.action) {
                          handleAction(item.action)
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0 p-1 rounded-md bg-muted/50">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.title}</span>
                            {item.isNew && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                            {item.isPopular && (
                              <Badge variant="default" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        {item.badge && (
                          <Badge variant="outline" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            ))}

            {/* Theme Settings */}
            <CommandGroup heading="Theme">
              <CommandItem
                value="light"
                onSelect={() => handleThemeToggle("light")}
                className="cursor-pointer"
              >
                <Sun className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Light Mode</span>
                  <span className="text-xs text-muted-foreground">Switch to light theme</span>
                </div>
              </CommandItem>
              <CommandItem
                value="dark"
                onSelect={() => handleThemeToggle("dark")}
                className="cursor-pointer"
              >
                <Moon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>Dark Mode</span>
                  <span className="text-xs text-muted-foreground">Switch to dark theme</span>
                </div>
              </CommandItem>
              <CommandItem
                value="system"
                onSelect={() => handleThemeToggle("system")}
                className="cursor-pointer"
              >
                <Monitor className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>System</span>
                  <span className="text-xs text-muted-foreground">Use system theme</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}
