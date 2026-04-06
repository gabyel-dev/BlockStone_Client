import { FiRotateCcw, FiSettings } from "react-icons/fi";

export default function DashboardLayoutToolbar({
  canEditLayout,
  isEditMode,
  onToggleEditMode,
  onCompactView,
  onResetLayout,
}) {
  if (!canEditLayout) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:p-4">
      <div className="mb-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Personalize Workspace
        </p>
        <p className="text-xs text-slate-600">
          Customize card layout and density. Available on large screens only.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
            isEditMode
              ? "border-cyan-300 bg-cyan-50 text-cyan-800"
              : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
          }`}
        >
          <FiSettings size={14} />
          {isEditMode ? "Done" : "Personalize"}
        </button>

        <button
          type="button"
          onClick={onCompactView}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          disabled={!isEditMode}
        >
          Compact View
        </button>

        <button
          type="button"
          onClick={onResetLayout}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isEditMode}
        >
          <FiRotateCcw size={14} />
          Reset Layout
        </button>
      </div>
    </div>
  );
}
