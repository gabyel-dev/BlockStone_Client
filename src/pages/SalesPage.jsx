import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { getTransactions } from "../api/print";
import TransactionDetailModal from "../components/sales/TransactionDetailModal";
import { periods, peso } from "./sales/constants";
import {
  formatDateTime,
  getIsoWeekValue,
  getMonthValue,
  isoWeekToDate,
} from "./sales/utils/dateFilters";
import { calculateSalesTotals } from "./sales/utils/metrics";

const SummarySkeleton = () => (
  <section className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="h-24 rounded-2xl border border-slate-200 bg-slate-50 sm:h-28"
      >
        <div className="h-full w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 via-white to-slate-100" />
      </div>
    ))}
  </section>
);

const SalesTableSkeleton = ({ rows = 6 }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:rounded-[28px] sm:p-5">
    <div className="mb-4 grid gap-3 sm:grid-cols-2">
      <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
      <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-14 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
        />
      ))}
    </div>
  </div>
);

const SalesPage = () => {
  const location = useLocation();
  const activeMenu = location.state?.menu || "Sales";

  const [period, setPeriod] = useState("daily");
  const [referenceDate, setReferenceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 8,
    total: 0,
    totalPages: 1,
    period: "daily",
  });
  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedTransactionId, setSelectedTransactionId] = useState(null);

  const lastSeenTransactionId = useRef(null);

  // STEP 1: Build one request function that always sends period/date/page filters.
  // The backend receives those filters and returns only the matching date window.
  const fetchSales = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        if (!silent) {
          setError("");
        }

        // STEP 2: Send filtered request (period + specific date + pagination).
        const response = await getTransactions({
          period,
          page,
          pageSize,
          date: referenceDate,
        });
        const transactions = response?.data?.data?.transactions ?? [];
        const responseMeta = response?.data?.data?.meta;

        // STEP 3: Persist latest result set in state for rendering and metric math.
        setSales(transactions);
        setMeta(
          responseMeta ?? {
            period,
            page,
            pageSize,
            total: transactions.length,
            totalPages: 1,
          },
        );

        // STEP 4: In silent polling mode, compare latest transaction id to detect new orders.
        const latestTid = transactions[0]?.tid;
        if (
          latestTid &&
          silent &&
          lastSeenTransactionId.current &&
          latestTid !== lastSeenTransactionId.current
        ) {
          toast.success(`New order #${latestTid} received.`);
        }
        if (latestTid) {
          lastSeenTransactionId.current = latestTid;
        }
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          "Unable to load sales records right now.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [page, pageSize, period, referenceDate],
  );

  useEffect(() => {
    // STEP 5: First load or any filter change triggers a full fetch.
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    // STEP 6: Poll every 10s to keep sales feed near real-time.
    const timer = setInterval(() => {
      fetchSales({ silent: true });
    }, 10000);

    return () => {
      clearInterval(timer);
    };
  }, [fetchSales]);

  // STEP 7: Compute review metrics from currently visible rows.
  // gross: sum(total_amount)
  // netIncome: sum(net_amount) when backend provides it, else fallback to gross
  // avg: gross / number of orders
  const totals = useMemo(() => calculateSalesTotals(sales), [sales]);

  const handleChangePeriod = (nextPeriod) => {
    setPeriod(nextPeriod);
    setPage(1);
  };

  // STEP 8: Weekly picker returns YYYY-Wnn; convert to ISO Monday date for API.
  const handleWeekInput = (event) => {
    setReferenceDate(isoWeekToDate(event.target.value));
    setPage(1);
  };

  // STEP 9: Monthly picker is normalized to first day of selected month.
  const handleMonthInput = (event) => {
    const monthValue = event.target.value;
    if (!monthValue) {
      return;
    }

    setReferenceDate(`${monthValue}-01`);
    setPage(1);
  };

  const currentYear = new Date().getFullYear();
  const yearlyOptions = [currentYear - 2, currentYear - 1, currentYear];

  const renderTimelineControl = () => {
    if (period === "daily") {
      return null;
    }

    if (period === "weekly") {
      return (
        <details className="w-full sm:w-auto ">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-sm">
            Weekly Timeline
          </summary>
          <div className="mt-2">
            <input
              type="week"
              value={getIsoWeekValue(referenceDate)}
              onChange={handleWeekInput}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 sm:text-sm"
            />
          </div>
        </details>
      );
    }

    if (period === "monthly") {
      return (
        <details className="w-full sm:w-auto">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-sm">
            Monthly Timeline
          </summary>
          <div className="mt-2">
            <input
              type="month"
              value={getMonthValue(referenceDate)}
              onChange={handleMonthInput}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900 sm:text-sm"
            />
          </div>
        </details>
      );
    }

    return (
      <details className="w-full sm:w-auto">
        <summary className="cursor-pointer list-none rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-600 sm:text-sm">
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
                onClick={() => {
                  setReferenceDate(`${year}-01-01`);
                  setPage(1);
                }}
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

  const shouldReduceMotion = useReducedMotion();
  const motionSafe = (props) => (shouldReduceMotion ? {} : props);

  return (
    <main className="min-h-screen py-4 text-slate-900 sm:py-7 pr-6 pl-6 md:pl-0">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {activeMenu}
          </p>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Sales Ledger
          </h1>
        </div>
      </header>

      {isLoading ? (
        <div className="mb-4 sm:mb-6">
          <SummarySkeleton />
        </div>
      ) : (
        <section className="mb-4 grid grid-cols-2 gap-2.5 sm:mb-6 sm:gap-4 xl:grid-cols-4">
          <motion.article
            {...motionSafe({
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.05 },
            })}
            className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Gross Sales
            </p>
            <p className="mt-1.5 text-base font-black text-slate-900 sm:mt-2 sm:text-2xl">
              {peso.format(totals.gross)}
            </p>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Visible page total
            </p>
          </motion.article>
          <motion.article
            {...motionSafe({
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.1 },
            })}
            className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Orders
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-base font-black text-slate-900 sm:mt-2 sm:gap-2 sm:text-2xl">
              <FiShoppingCart className="text-sky-600" /> {totals.orders}
            </p>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Current page
            </p>
          </motion.article>
          <motion.article
            {...motionSafe({
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.15 },
            })}
            className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Printed
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-base font-black text-slate-900 sm:mt-2 sm:gap-2 sm:text-2xl">
              <FiPackage className="text-emerald-600" /> {totals.items}
            </p>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Units on page
            </p>
          </motion.article>
          <motion.article
            {...motionSafe({
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.2 },
            })}
            className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Avg Ticket
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-base font-black text-slate-900 sm:mt-2 sm:gap-2 sm:text-2xl">
              <FiTrendingUp className="text-indigo-600" />{" "}
              {peso.format(totals.avg)}
            </p>
            <p className="mt-1 hidden text-xs text-slate-500 sm:block">
              Per order (page)
            </p>
          </motion.article>
        </section>
      )}

      {isLoading ? (
        <SalesTableSkeleton rows={6} />
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-3.5 sm:rounded-[28px] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-slate-50 p-1 sm:flex">
              {periods.map((entry) => {
                const isActive = period === entry.key;
                return (
                  <button
                    key={entry.key}
                    onClick={() => handleChangePeriod(entry.key)}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FiCalendar size={14} /> {entry.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="sm:hidden">
              <select
                value={period}
                onChange={(event) => handleChangePeriod(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-900"
                aria-label="Select sales period"
              >
                {periods.map((entry) => (
                  <option key={entry.key} value={entry.key}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>

            {renderTimelineControl()}

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Gross {peso.format(totals.gross)} | Net{" "}
              {peso.format(totals.netIncome)}
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="space-y-2 md:hidden">
            {sales.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-5 text-center text-sm font-semibold text-slate-500">
                No transactions found for this period.
              </div>
            ) : (
              sales.map((transaction, index) => (
                <motion.article
                  key={transaction.tid}
                  {...motionSafe({
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0 },
                    transition: { delay: index * 0.04 },
                  })}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        Order #{transaction.tid}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(transaction.transaction_date)}
                      </p>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {peso.format(Number(transaction.total_amount ?? 0))}
                    </p>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <p>
                      Cashier: {transaction.first_name || "-"}{" "}
                      {transaction.last_name || ""}
                    </p>
                    <p>
                      Items: {transaction.total_qty || 0} pcs (
                      {transaction.item_count || 0} lines)
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                      {transaction.payment_method || "cash"}
                    </span>
                    <button
                      onClick={() => setSelectedTransactionId(transaction.tid)}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      View Full
                    </button>
                  </div>
                </motion.article>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <th className="px-3 py-2">Order #</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Cashier</th>
                  <th className="px-3 py-2">Items</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-10 text-center text-sm font-semibold text-slate-500"
                    >
                      No transactions found for this period.
                    </td>
                  </tr>
                ) : null}

                {sales.map((transaction, index) => (
                  <motion.tr
                    key={transaction.tid}
                    {...motionSafe({
                      initial: { opacity: 0, y: 6 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: index * 0.03 },
                    })}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 text-sm text-slate-700"
                  >
                    <td className="rounded-l-xl px-3 py-3 font-black text-slate-900">
                      #{transaction.tid}
                    </td>
                    <td className="px-3 py-3">
                      {formatDateTime(transaction.transaction_date)}
                    </td>
                    <td className="px-3 py-3">
                      {transaction.first_name || "-"}{" "}
                      {transaction.last_name || ""}
                    </td>
                    <td className="px-3 py-3">
                      {transaction.total_qty || 0} pcs (
                      {transaction.item_count || 0} lines)
                    </td>

                    <td className="px-3 py-3 text-right font-black text-slate-900">
                      {peso.format(Number(transaction.total_amount ?? 0))}
                    </td>
                    <td className="rounded-r-xl px-3 py-3 text-right">
                      <button
                        onClick={() =>
                          setSelectedTransactionId(transaction.tid)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        View Full
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:mt-4">
            <p className="text-xs font-semibold text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={meta.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition enabled:hover:border-slate-900 enabled:hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))
                }
                disabled={meta.page >= meta.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition enabled:hover:border-slate-900 enabled:hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </section>
      )}

      <TransactionDetailModal
        transactionId={selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
      />
    </main>
  );
};

export default SalesPage;
