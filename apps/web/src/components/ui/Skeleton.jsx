// apps/web/src/components/ui/Skeleton.jsx

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-[#e8eaed] rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 6,
  headers = [],
}) {
  return (
    <div className="w-full overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[#f8f9fa] text-[#5f6368] uppercase text-[11px] tracking-wider border-b border-[#dadce0]">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-5 py-3 border-r border-[#dadce0]/60 last:border-r-0">
                  {headers[i] ? (
                    <span className="font-semibold text-[#80868b]">{headers[i]}</span>
                  ) : (
                    <Skeleton className="h-3.5 w-20" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8eaed] bg-white">
            {Array.from({ length: rows }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-[#f8f9fa]/50">
                {Array.from({ length: cols }).map((_, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-5 py-3.5 border-r border-[#e8eaed]/60 last:border-r-0"
                  >
                    <Skeleton
                      className={`h-4 ${
                        cIdx === 0
                          ? "w-36"
                          : cIdx === cols - 1
                          ? "w-16 ml-auto"
                          : cIdx % 2 === 0
                          ? "w-28"
                          : "w-20"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatCardSkeleton({ count = 3 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${count} gap-3 sm:gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dadce0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-[#e8eaed]">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ClassGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#dadce0] overflow-hidden shadow-xs flex flex-col"
        >
          <div className="h-28 bg-[#e8eaed] animate-pulse p-4 flex flex-col justify-between">
            <Skeleton className="h-5 w-3/4 bg-white/60" />
            <Skeleton className="h-3.5 w-1/2 bg-white/50" />
          </div>
          <div className="p-4 space-y-3 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
          <div className="p-3 bg-[#f8f9fa] border-t border-[#e8eaed] flex justify-end">
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClassDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#dadce0] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8eaed]">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[#dadce0] p-5 shadow-xs">
        <TableSkeleton rows={4} cols={5} />
      </div>
    </div>
  );
}

export function PortalSkeleton({ role = "USER" }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-44 rounded-xl" />
      </div>

      <div className="bg-white rounded-2xl border border-[#dadce0] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e8eaed]">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <TableSkeleton rows={4} cols={role === "ADMIN" ? 6 : 6} />
      </div>
    </div>
  );
}
