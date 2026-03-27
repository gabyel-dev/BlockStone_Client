import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const ShiftAgendaCard = ({ setClose, agendaData }) => {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:rounded-[30px] sm:p-6 xl:col-span-4"
    >
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h3 className="text-base font-black text-slate-900 sm:text-lg">
          Shift Agenda
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          All
        </span>
      </div>

      <div className="space-y-2.5 sm:space-y-4">
        {agendaData
          .map((a) => (
            <motion.div
              key={a.aid}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: a.aid * 0.05 }}
              whileHover={{ scale: 1.01, x: 2 }}
              className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 shadow-[0_8px_18px_rgba(15,23,42,0.04)] sm:gap-3 sm:p-3"
            >
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${a.priority === "high" ? "bg-red-500" : a.priority === "med" ? "bg-orange-500" : "bg-green-500"}`}
              />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {a.agenda_title}
                </p>
                <p className="text-xs text-slate-500">
                  {a.agenda_descrription}
                </p>
              </div>
            </motion.div>
          ))
          .slice(0, 3)}
      </div>

      <motion.button
        onClick={() => setClose(true)}
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition hover:bg-slate-800 sm:mt-6 sm:py-3"
      >
        {/* TODO: on click, load agenda list from backend (aid, title, priority) before opening modal. */}
        Open Full Timeline <FiArrowRight size={16} />
      </motion.button>
    </motion.aside>
  );
};

export default ShiftAgendaCard;
