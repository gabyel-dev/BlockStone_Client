import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiMinimize2,
  FiRefreshCw,
  FiRotateCcw,
  FiSettings,
  FiShuffle,
} from "react-icons/fi";

const getControlsCollapsedKey = (userId) =>
  `blockstone.dashboard.controls.collapsed.v1:${String(userId || "guest")}`;

const readCollapsedState = (userId) => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(getControlsCollapsedKey(userId));
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
};

export default function DashboardControlsPanel({
  userId,
  showQuickActions,
  canEditLayout,
  isEditMode,
  onRefreshNow,
  onFocusStockRisk,
  onShuffleLayout,
  onShowAllCards,
  onToggleEditMode,
  onCompactView,
  onResetLayout,
  hintMessage,
}) {
  const [collapsed, setCollapsed] = useState(() => readCollapsedState(userId));

  useEffect(() => {
    setCollapsed(readCollapsedState(userId));
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        getControlsCollapsedKey(userId),
        collapsed ? "1" : "0",
      );
    } catch {
      // Best effort persistence only.
    }
  }, [collapsed, userId]);

  if (!showQuickActions && !canEditLayout) {
    return null;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white/95 p-2.5 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.55)] sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Dashboard Controls
          </p>
          <p className="text-[11px] text-slate-600">
            Quick actions and layout personalization
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          title={collapsed ? "Show controls" : "Hide controls"}
        >
          {collapsed ? <FiChevronDown size={13} /> : <FiChevronUp size={13} />}
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed ? (
        <div className="mt-2 space-y-2">
          {showQuickActions ? (
            <div className="grid grid-cols-2 gap-1.5 xl:grid-cols-4">
              <button
                type="button"
                onClick={onRefreshNow}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                <FiRefreshCw size={13} />
                Refresh
              </button>
              <button
                type="button"
                onClick={onFocusStockRisk}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] font-semibold text-amber-800 transition hover:border-amber-400"
              >
                <FiAlertTriangle size={13} />
                Stock Risk
              </button>
              <button
                type="button"
                onClick={onShuffleLayout}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                <FiShuffle size={13} />
                Shuffle
              </button>
              <button
                type="button"
                onClick={onShowAllCards}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                <FiEye size={13} />
                Show All
              </button>
            </div>
          ) : null}

          {canEditLayout ? (
            <div className="grid grid-cols-1 gap-1.5 border-t border-slate-200 pt-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={onToggleEditMode}
                className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition ${
                  isEditMode
                    ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                <FiSettings size={13} />
                {isEditMode ? "Done" : "Personalize"}
              </button>

              <button
                type="button"
                onClick={onCompactView}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isEditMode}
              >
                <FiMinimize2 size={13} />
                Compact
              </button>

              <button
                type="button"
                onClick={onResetLayout}
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isEditMode}
              >
                <FiRotateCcw size={13} />
                Reset
              </button>
            </div>
          ) : null}

          {hintMessage ? (
            <p className="inline-flex rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700">
              {hintMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
