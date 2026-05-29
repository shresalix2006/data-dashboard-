export function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-pulse" id="custom-skeleton-loader">
      {/* 1. Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={`sk-metric-${i}`} className="rounded-none border border-editorial-border bg-white p-6 min-h-[160px]">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-150 rounded-none" />
                <div className="h-8 w-24 bg-gray-200 rounded-none" />
              </div>
              <div className="h-10 w-10 bg-gray-150 rounded-none" />
            </div>
            <div className="mt-6 flex justify-between border-t border-editorial-border pt-4">
              <div className="h-3.5 w-28 bg-gray-150 rounded-none" />
              <div className="h-3.5 w-14 bg-gray-100 rounded-none" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Charts Double-Row Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Codebase Composition Skeleton */}
        <div className="rounded-none border border-editorial-border bg-white p-6 lg:col-span-4 space-y-4">
          <div className="space-y-2">
            <div className="h-4.5 w-36 bg-gray-200 rounded-none" />
            <div className="h-3.5 w-48 bg-gray-100 rounded-none" />
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-none" />
          <div className="flex justify-center py-4">
            <div className="h-[150px] w-[150px] rounded-full border-12 border-gray-100 flex items-center justify-center animate-spin duration-[3000ms]" />
          </div>
          <div className="space-y-2.5 pb-2">
            {[1, 2, 3].map((v) => (
              <div key={v} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 bg-gray-100 rounded-none" />
                  <div className="h-3.5 w-16 bg-gray-100 rounded-none" />
                </div>
                <div className="h-3.5 w-24 bg-gray-100 rounded-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Trend Skeleton */}
        <div className="rounded-none border border-editorial-border bg-white p-6 lg:col-span-8 flex flex-col justify-between min-h-[350px]">
          <div className="flex justify-between items-center border-b border-editorial-border pb-4">
            <div className="space-y-1.5">
              <div className="h-4.5 w-48 bg-gray-200 rounded-none" />
              <div className="h-3.5 w-64 bg-gray-100 rounded-none" />
            </div>
            <div className="h-8 w-32 bg-gray-100 rounded-none" />
          </div>
          <div className="h-10 w-full bg-gray-50 flex items-center p-3 my-2 space-x-3 rounded-none">
            <div className="h-4 w-12 bg-gray-100 rounded-none" />
            <div className="h-4 w-28 bg-gray-200 rounded-none" />
          </div>
          <div className="flex-1 w-full flex items-end gap-1.5 mt-4 min-h-[160px]">
            {[...Array(14)].map((_, i) => (
              <div
                key={`sk-bar-${i}`}
                style={{ height: `${20 + Math.sin(i / 1.5) * 45 + Math.random() * 25}%` }}
                className="flex-1 bg-gray-100/70 rounded-none"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Contributors List Skeleton */}
      <div className="rounded-none border border-editorial-border bg-white p-6">
        <div className="space-y-1 pb-4 border-b border-editorial-border">
          <div className="h-4.5 w-40 bg-gray-200 rounded-none" />
          <div className="h-3.5 w-56 bg-gray-100 rounded-none" />
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div key={`sk-contrib-${idx}`} className="flex items-center gap-3.5 p-4 rounded-none border border-editorial-border bg-editorial-bg/30">
              <div className="h-10 w-10 bg-gray-150 rounded-none" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-20 bg-gray-200 rounded-none" />
                <div className="h-3.5 w-28 bg-gray-100 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
