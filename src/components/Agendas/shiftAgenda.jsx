import { FaPlus } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConfirmActionModal from "../common/ConfirmActionModal";

const defaultForm = {
  title: "",
  description: "",
  priority: "purchase",
};

const mapAgendaDescription = (agenda = {}) => {
  return agenda.agenda_descrription;
};

export default function ShiftAgendaModal({
  onClose,
  agendaData,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
}) {
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const MotionArticle = motion.article;
  const [form, setForm] = useState(defaultForm);
  const [editingAgendaId, setEditingAgendaId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingAgendaId(null);
  };

  const isEditMode = Boolean(editingAgendaId);

  const handleSubmit = async () => {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
    };

    if (!payload.title || !payload.description) {
      toast.error("Please complete title and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditMode) {
        await onUpdate?.(editingAgendaId, payload);
        toast.success("Agenda updated.");
      } else {
        await onCreate?.(payload);
        toast.success("Agenda added.");
      }
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to save agenda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate?.aid) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onDelete?.(deleteCandidate.aid);
      toast.success("Agenda deleted.");
      if (editingAgendaId === deleteCandidate.aid) {
        resetForm();
      }
      setDeleteCandidate(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete agenda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectAgendaForEdit = (agenda) => {
    setEditingAgendaId(agenda.aid);
    setForm({
      title: agenda.agenda_title || "",
      description: mapAgendaDescription(agenda),
      priority: agenda.priority || "purchase",
    });
  };

  return (
    <>
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:px-6"
      >
        <MotionDiv
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-[30px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        >
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                  Shift Agenda
                </p>
                <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {isEditMode ? "Edit Agenda" : "Create Agenda"}
                </h1>
              </div>

              <span className="flex gap-3 pt-4">
                {isEditMode && (
                  <MotionButton
                    whileHover={{ scale: 1.05, rotate: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetForm}
                    className="rounded-full border border-slate-200 bg-white/70 p-2 shadow-sm"
                    title="New agenda"
                    type="button"
                  >
                    <FaPlus className="text-black/70 text-2xl" />
                  </MotionButton>
                )}
              </span>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                {isEditMode ? "Update agenda" : "Add new agenda"}
              </p>
              <div className="mt-3 space-y-3">
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="Title"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900"
                />
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      priority: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900"
                >
                  <option value="priority">Priority</option>
                  <option value="purchase">Purchase</option>
                  <option value="profit">Profit</option>
                </select>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Description"
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900"
                />
              </div>
            </section>

            <section className="space-y-3">
              {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  Loading agendas...
                </div>
              ) : null}

              {!isLoading && agendaData.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                  No agendas yet. Add one using the form.
                </div>
              ) : null}

              {agendaData.map((a) => (
                <MotionArticle
                  key={a.aid}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        {a.priority}
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-900">
                        {a.agenda_title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {mapAgendaDescription(a)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => selectAgendaForEdit(a)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(a)}
                        className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </MotionArticle>
              ))}
            </section>
          </div>

          <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
            <div className="flex items-center justify-end gap-2">
              <MotionButton
                onClick={() => onClose(false)}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting}
              >
                <FiX size={15} /> Close
              </MotionButton>
              <MotionButton
                type="button"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add"}
              </MotionButton>
            </div>
          </div>
        </MotionDiv>
      </MotionDiv>

      <ConfirmActionModal
        open={Boolean(deleteCandidate)}
        title="Delete agenda item?"
        message={`This will permanently remove "${deleteCandidate?.agenda_title}".`}
        confirmLabel="Delete agenda"
        confirmTone="danger"
        isSubmitting={isSubmitting}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
