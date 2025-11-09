export default function DashboardLoading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-4 bg-muted rounded w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-3">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-10 bg-muted rounded w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 bg-muted rounded w-40" />
            <div className="border rounded-lg p-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
