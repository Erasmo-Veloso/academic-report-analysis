export function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-12 bg-muted rounded-lg" />
      
      {/* Message skeletons */}
      <div className="space-y-3">
        <div className="flex justify-end">
          <div className="h-10 bg-muted rounded-lg w-2/3" />
        </div>
        <div className="flex justify-start">
          <div className="h-16 bg-muted rounded-lg w-3/4" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 bg-muted rounded-lg w-1/2" />
        </div>
        <div className="flex justify-start">
          <div className="h-20 bg-muted rounded-lg w-4/5" />
        </div>
      </div>
    </div>
  );
}
