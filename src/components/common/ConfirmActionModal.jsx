import { FiAlertTriangle, FiX } from "react-icons/fi";

const ConfirmActionModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmTone = "danger",
  isSubmitting = false,
  onCancel,
  onConfirm,
}) => {
  if (!open) {
    return null;
  }

  const confirmClass =
    confirmTone === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-slate-900 hover:bg-slate-800";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-rose-600">
              <FiAlertTriangle size={18} />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 p-1.5 text-slate-500 transition hover:border-slate-800 hover:text-slate-800"
            aria-label="Close confirmation dialog"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`rounded-lg px-3 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {isSubmitting ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
