const QuickActionsCard = () => {
  return (
    <section className="mt-4 rounded-3xl border border-slate-200 bg-linear-to-r from-slate-900 to-slate-800 p-4 text-white sm:mt-6 sm:rounded-[30px] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Quick Actions
          </p>
          <h3 className="text-lg font-black sm:text-xl">Need to move fast?</h3>
          <p className="mt-1 hidden text-sm text-slate-300 sm:block">
            Jump to proof approval, issue dispatch labels, or create express
            jobs directly from one command rail.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <button className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:px-4 sm:text-sm">
            Approve Proofs
          </button>
          <button className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:px-4 sm:text-sm">
            Dispatch Labels
          </button>
          <button className="col-span-2 rounded-xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-400 sm:col-span-1 sm:px-4 sm:text-sm">
            Open POS
          </button>
        </div>
      </div>
    </section>
  );
};

export default QuickActionsCard;
