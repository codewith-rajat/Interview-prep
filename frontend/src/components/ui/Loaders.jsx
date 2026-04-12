export function Spinner({ size = "md" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} border-4 border-gray-700 border-t-emerald-500 rounded-full animate-spin`} />
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingButton({ isLoading, children, ...props }) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-gray-900 animate-pulse rounded-lg h-20" />
      ))}
    </div>
  );
}
