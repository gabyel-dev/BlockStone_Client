import { FiArrowRight } from "react-icons/fi";

const agenda = [
  {
    title: "Dispatch Window",
    text: "10:00 AM - 11:30 AM",
    dot: "bg-emerald-500",
  },
  {
    title: "Machine Check",
    text: "HP Indigo #02 requires nozzle clean",
    dot: "bg-amber-500",
  },
  {
    title: "Client Review",
    text: "Acme proof approval pending",
    dot: "bg-sky-500",
  },
];

const ShiftAgendaCard = () => {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-4">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h3 className="text-base font-black text-slate-900 sm:text-lg">
          Shift Agenda
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          All
        </span>
      </div>

      <div className="space-y-2.5 sm:space-y-4">
        {agenda.map((item) => (
          <div
            key={item.title}
            className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 sm:gap-3 sm:p-3"
          >
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.dot}`} />
            <div>
              <p className="text-sm font-bold text-slate-800">{item.title}</p>
              <p className="text-xs text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 sm:mt-6 sm:py-3">
        Open Full Timeline <FiArrowRight size={16} />
      </button>
    </aside>
  );
};

export default ShiftAgendaCard;
