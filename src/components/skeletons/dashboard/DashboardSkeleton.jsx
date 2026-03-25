const shimmer = "animate-pulse rounded-xl bg-slate-200/80";

const DashboardSkeleton = () => {
  return (
    <div className="w-full py-7 text-slate-900">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={`${shimmer} mb-2 h-3 w-24`} />
          <div className={`${shimmer} h-8 w-56`} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="rounded-xl bg-slate-100 p-1">
            <div className="flex items-center gap-2">
              <div className={`${shimmer} h-9 w-16`} />
              <div className={`${shimmer} h-9 w-16`} />
              <div className={`${shimmer} h-9 w-16`} />
              <div className={`${shimmer} h-9 w-16`} />
            </div>
          </div>
          <div className={`${shimmer} h-10 w-36`} />
          <div className={`${shimmer} h-10 w-28`} />
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-8 xl:col-span-8">
          <div className={`${shimmer} mb-3 h-3 w-24`} />
          <div className={`${shimmer} mb-3 h-8 w-3/4`} />
          <div className={`${shimmer} mb-8 h-4 w-full max-w-xl`} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4"
              >
                <div className={`${shimmer} mb-2 h-3 w-16`} />
                <div className={`${shimmer} mb-2 h-8 w-24`} />
                <div className={`${shimmer} h-3 w-20`} />
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-4">
          <div className={`${shimmer} mb-6 h-7 w-36`} />
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-xl bg-slate-50 p-3">
                <div className={`${shimmer} mb-2 h-4 w-28`} />
                <div className={`${shimmer} h-3 w-full`} />
              </div>
            ))}
          </div>
          <div className={`${shimmer} mt-6 h-11 w-full`} />
        </aside>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <div className={`${shimmer} mb-2 h-3 w-24`} />
              <div className={`${shimmer} h-7 w-40`} />
            </div>
            <div className={`${shimmer} h-7 w-20`} />
          </div>
          <div className={`${shimmer} h-64 w-full rounded-2xl`} />
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-5">
          <div className={`${shimmer} mb-5 h-7 w-32`} />
          <div className={`${shimmer} mx-auto mb-5 h-52 w-52 rounded-full`} />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-lg bg-slate-100 p-3">
                <div className={`${shimmer} h-4 w-full`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-12">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className={`${shimmer} mb-2 h-3 w-24`} />
              <div className={`${shimmer} h-7 w-44`} />
            </div>
            <div className={`${shimmer} h-7 w-7`} />
          </div>
          <div className={`${shimmer} h-64 w-full rounded-2xl`} />
        </div>

        <aside className="rounded-[30px] border border-slate-200 bg-white p-6 xl:col-span-4">
          <div className={`${shimmer} mb-5 h-7 w-28`} />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-slate-100 p-3"
              >
                <div className={`${shimmer} mb-2 h-4 w-2/3`} />
                <div className={`${shimmer} h-2 w-full`} />
              </div>
            ))}
          </div>
          <div className={`${shimmer} mt-5 h-11 w-full`} />
        </aside>
      </section>

      <section className="mt-6 rounded-[30px] border border-slate-200 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className={`${shimmer} mb-2 h-3 w-24 bg-slate-700`} />
            <div className={`${shimmer} mb-2 h-7 w-52 bg-slate-700`} />
            <div className={`${shimmer} h-4 w-72 bg-slate-700`} />
          </div>
          <div className="flex gap-2">
            <div className={`${shimmer} h-10 w-28 bg-slate-700`} />
            <div className={`${shimmer} h-10 w-28 bg-slate-700`} />
            <div className={`${shimmer} h-10 w-24 bg-slate-700`} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardSkeleton;
