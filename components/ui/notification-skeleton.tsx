import { Skeleton } from "@/components/ui/skeleton"
import { Bell } from "lucide-react"

export function NotificationSkeleton() {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between mt-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 bg-card rounded-lg border">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <NotificationSkeleton />
          {index < count - 1 && <div className="border-b border-border" />}
        </div>
      ))}
    </div>
  )
}
