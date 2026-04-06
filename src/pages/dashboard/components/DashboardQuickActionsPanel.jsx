import { FiAlertTriangle, FiEye, FiRotateCcw, FiShuffle } from "react-icons/fi";

export default function DashboardQuickActionsPanel({
  onRefreshNow,
  onFocusStockRisk,
  onShuffleLayout,
  onShowAllCards,
  hintMessage,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:p-4">
      <div className="mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Quick Actions
        </p>
        <p className="text-xs text-slate-600">
          Fast controls for live dashboard operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={onRefreshNow}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <FiRotateCcw size={14} />
          Refresh now
        </button>
        <button
          type="button"
          onClick={onFocusStockRisk}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:border-amber-400"
        >
          <FiAlertTriangle size={14} />
          Focus stock risk
        </button>
        <button
          type="button"
          onClick={onShuffleLayout}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <FiShuffle size={14} />
          Shuffle cards
        </button>
        <button
          type="button"
          onClick={onShowAllCards}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <FiEye size={14} />
          Show all cards
        </button>
      </div>

      {hintMessage ? (
        <p className="mt-3 inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
          {hintMessage}
        </p>
      ) : null}
    </div>
  );
}
