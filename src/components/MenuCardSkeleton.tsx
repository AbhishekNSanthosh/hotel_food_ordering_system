export default function MenuCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[16/10] w-full bg-muted" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        {/* Title and Price */}
        <div className="flex justify-between items-start gap-4">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-5 bg-muted rounded w-1/5" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>

        {/* Bottom Row */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          {/* Spice Level Badge Skeleton */}
          <div className="h-4 bg-muted rounded w-12" />

          {/* Add Button Skeleton */}
          <div className="h-8 w-20 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  );
}
