import { NavLink } from "react-router-dom";
import { FaPlus } from "react-icons/fa6";

// Filter buttons shown in dashboard header.
const periods = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

const getSafeDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
};

const toIsoDate = (date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const getIsoWeekValue = (value) => {
  const sourceDate = getSafeDate(value);
  const utcDate = new Date(
    Date.UTC(
      sourceDate.getFullYear(),
      sourceDate.getMonth(),
      sourceDate.getDate(),
    ),
  );
  const dayNum = utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
};

const isoWeekToDate = (weekValue) => {
  const [yearPart, weekPart] = String(weekValue || "").split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);

  if (!year || !week) {
    return toIsoDate(new Date());
  }

  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;
  const monday = new Date(simple);
  monday.setUTCDate(simple.getUTCDate() - day + 1);

  return monday.toISOString().slice(0, 10);
};

const getMonthValue = (value) => toIsoDate(getSafeDate(value)).slice(0, 7);

// Renders top dashboard controls: title, period filter, date picker, and actions.
const DashboardHeader = ({
  firstName,
  period,
  referenceDate,
  onPeriodChange,
  onDateChange,
}) => {
  // Called when user selects a different filter period.
  const handlePeriodClick = (nextPeriod) => {
    onPeriodChange(nextPeriod);
  };

  const handleWeekInput = (event) => {
    onDateChange(isoWeekToDate(event.target.value));
  };

  const handleMonthInput = (event) => {
    const monthValue = event.target.value;
    if (!monthValue) {
      return;
    }

    onDateChange(`${monthValue}-01`);
  };

  const currentYear = new Date().getFullYear();
  const yearlyOptions = [currentYear - 2, currentYear - 1, currentYear];

  const renderTimelineControl = () => {
    if (period === "daily") {
      return null;
    }

    if (period === "weekly") {
      return (
        <details open className="w-full sm:w-auto">
          <summary className="cursor-pointer list-none rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-3 sm:py-2">
            Weekly Timeline
          </summary>
          <div className="mt-2">
            <input
              type="week"
              value={getIsoWeekValue(referenceDate)}
              onChange={handleWeekInput}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>
        </details>
      );
    }

    if (period === "monthly") {
      return (
        <details open className="w-full sm:w-auto">
          <summary className="cursor-pointer list-none rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-3 sm:py-2">
            Monthly Timeline
          </summary>
          <div className="mt-2">
            <input
              type="month"
              value={getMonthValue(referenceDate)}
              onChange={handleMonthInput}
              className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>
        </details>
      );
    }

    return (
      <details open className="w-full sm:w-auto">
        <summary className="cursor-pointer list-none rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:px-3 sm:py-2">
          Yearly Categories
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
          {yearlyOptions.map((year) => {
            const isActiveYear = String(referenceDate || "").startsWith(
              `${year}-`,
            );

            return (
              <button
                key={year}
                type="button"
                onClick={() => onDateChange(`${year}-01-01`)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  isActiveYear
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </details>
    );
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
          Dashboard
        </p>
        <h1 className="text-lg font-black text-slate-900 sm:text-2xl">
          Welcome back, {firstName || "Operator"}
        </h1>
      </div>

      <div className="flex w-full flex-wrap items-center justify-start gap-1.5 sm:w-auto sm:justify-end sm:gap-2">
        <div className="sm:hidden">
          <select
            value={period}
            onChange={(event) => handlePeriodClick(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 sm:px-3 sm:py-2 sm:text-sm"
            aria-label="Select period"
          >
            {periods.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 p-1 sm:flex">
          {periods.map((item) => {
            const isActive = period === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handlePeriodClick(item.key)}
                className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {renderTimelineControl()}

        <NavLink
          to={"/pos"}
          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
        >
          <FaPlus size={12} /> Create Job
        </NavLink>
      </div>
    </div>
  );
};

export default DashboardHeader;
