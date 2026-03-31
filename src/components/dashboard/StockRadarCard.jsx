import { FiArrowRight, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";

const toneClasses = {
  red: "from-red-500 to-rose-400 bg-red-50 text-red-700",
  amber: "from-amber-500 to-orange-400 bg-amber-50 text-amber-700",
  emerald: "from-emerald-500 to-green-400 bg-emerald-50 text-emerald-700",
};

const StockRadarCard = ({
  stockRadar,
  criticalPercentage = 0,
  criticalCount = 0,
  totalItems = 0,
}) => {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-4">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Inventory
          </p>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            Stock Radar
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {criticalCount} critical ({criticalPercentage}% of {totalItems || 0}
            )
          </p>
        </div>
        <FiClock className="text-slate-400" size={18} />
      </div>

      <div className="space-y-2 sm:space-y-3">
        {stockRadar.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
            No inventory data yet.
          </div>
        ) : null}

        {stockRadar.map((item) => {
          const tone = toneClasses[item.tone] || toneClasses.amber;
          const [fromColor, toColor, bgColor, textColor] = tone.split(" ");

          return (
            <div
              key={item.name}
              className="rounded-xl border border-slate-100 p-2.5 sm:p-3"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-800">{item.name}</p>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${bgColor} ${textColor}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-linear-to-r ${fromColor} ${toColor}`}
                  style={{ width: `${item.level}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {item.level}% remaining
              </p>
            </div>
          );
        })}
      </div>

      <Link
        to="/inventory"
        state={{ menu: "Inventory" }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white sm:mt-5 sm:py-3"
      >
        Replenishment Planner <FiArrowRight size={15} />
      </Link>
    </aside>
  );
};

export default StockRadarCard;
