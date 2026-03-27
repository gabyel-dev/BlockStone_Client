import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa6";
import { FiX } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ShiftAgendaModal({ onClose, agendaData }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose?.(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:px-6"
    >
      <motion.div
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
                Pending Agenda
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Designed layout preview. Actions are intentionally disabled.
              </p>
            </div>

            <span className="flex gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.05, rotate: -3 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-slate-200 bg-white/70 p-2 shadow-sm"
              >
                <FaPlus className="text-black/50 text-2xl" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full border border-slate-200 bg-white/70 p-2 shadow-sm"
              >
                <FaEdit className="text-black/50 text-2xl" />
              </motion.button>
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:space-y-6 sm:p-7">
          {agendaData.map((a) => (
            <section key={a.aid} className="grid gap-3 sm:grid-cols-3">
              <motion.article
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {a.priority}
                </p>
                <p className="mt-2 text-sm font-black text-slate-900">
                  {a.agenda_title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {a.agenda_descrription}
                </p>
              </motion.article>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur sm:px-7">
          <div className="flex items-center justify-end gap-2">
            <motion.button
              onClick={() => onClose(false)}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600"
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiX size={15} /> Close
            </motion.button>
            <motion.button
              type="button"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* TODO: call create/update agenda endpoint here, then refresh list and close. */}
              Save Changes
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
