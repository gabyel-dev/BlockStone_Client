import { FiMoreVertical, FiShoppingCart, FiTarget } from "react-icons/fi";
import { LuPhilippinePeso } from "react-icons/lu";

const peso = new Intl.NumberFormat("en-PH", {
  currency: "PHP",
  minimumFractionDigits: 2,
});

const periodLabels = {
  daily: "Today",
  weekly: "This Week",
  monthly: "This Month",
  yearly: "This Year",
};

// Shows top KPI cards using live dashboard summary values.
const PulseSection = ({ summary, period = "weekly" }) => {
  const safeSummary = summary ?? {};
  const periodLabel = periodLabels[period] ?? "Selected Range";
  const rangeOrders = Number(safeSummary.totalOrders ?? 0);
  const rangePlacedOrders = Number(safeSummary.placedOrders ?? 0);

  // Card list is kept simple so values and labels are easy to edit later.
  const stats = [
    {
      label: "Revenue",
      value: peso.format(Number(safeSummary.totalRevenue ?? 0)),
      subtext: `Avg ticket ${peso.format(Number(safeSummary.avgTicket ?? 0))}`,
      icon: LuPhilippinePeso,
      iconClass: "text-sky-500",
      subClass: "text-emerald-600",
    },
    {
      label: periodLabel,
      value: `${rangeOrders}`,
      subtext: "Orders in selected range",
      icon: FiShoppingCart,
      iconClass: "text-indigo-500",
      subClass: "text-slate-500",
    },
    {
      label: "Rating",
      value: `${rangePlacedOrders}`,
      subtext: "Average service rating",
      icon: FiTarget,
      iconClass: "text-rose-500",
      subClass: "text-slate-500",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-sky-50 p-4 sm:rounded-[30px] sm:p-8 xl:col-span-8">
      <div className="absolute -right-16 -top-14 hidden h-52 w-52 rounded-full bg-sky-200/45 blur-3xl sm:block" />
      <div className="absolute -left-12 bottom-0 hidden h-40 w-40 rounded-full bg-indigo-200/35 blur-3xl sm:block" />

      <div className="relative flex flex-col gap-4 sm:gap-8">
        <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-6">
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
              Live Pulse
            </p>
            <h2 className="text-lg font-black leading-tight text-slate-900 sm:text-3xl">
              Print floor is stable with a high dispatch pace today.
            </h2>
            <p className="mt-2 hidden text-sm text-slate-600 sm:block sm:mt-3">
              Your bottleneck moved from print to finishing in the last 2 hours.
              Keep the current order pace to maintain same-day delivery.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {stats.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur sm:rounded-2xl sm:p-4 ${
                  index === stats.length - 1 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {card.label}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-lg font-black text-slate-900 sm:mt-2 sm:gap-2 sm:text-2xl">
                  <Icon className={card.iconClass} /> {card.value}
                </p>
                <p
                  className={`mt-1 text-[11px] font-semibold sm:text-xs ${card.subClass}`}
                >
                  {card.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PulseSection;
