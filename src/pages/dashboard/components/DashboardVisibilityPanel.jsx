import { FiEye, FiEyeOff } from "react-icons/fi";

export default function DashboardVisibilityPanel({
  cardIds,
  cardLabels,
  hiddenCards,
  onToggleVisibility,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
        Card visibility
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {cardIds.map((cardId) => {
          const hidden = hiddenCards.includes(cardId);
          return (
            <button
              key={cardId}
              type="button"
              onClick={() => onToggleVisibility(cardId)}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                hidden
                  ? "border-slate-300 bg-slate-100 text-slate-600 hover:border-slate-400"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:border-emerald-400"
              }`}
            >
              {hidden ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              {cardLabels[cardId] || cardId}
            </button>
          );
        })}
      </div>
    </div>
  );
}
