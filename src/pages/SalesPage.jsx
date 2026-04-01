import { useLocation, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";
import ConfirmActionModal from "../components/common/ConfirmActionModal";
import TransactionDetailModal from "../components/sales/TransactionDetailModal";
import { useMotionSafe } from "../hooks/useMotionSafe";
import { periods, peso } from "./sales/constants";
import { useSalesPage } from "./sales/hooks/useSalesPage";
import {
  formatDateTime,
  getIsoWeekValue,
  getMonthValue,
} from "./sales/utils/dateFilters";

const SummarySkeleton = () => (
  <section className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="h-24 rounded-2xl border border-slate-200 bg-slate-50 sm:h-28"
      >
        <div className="h-full w-full animate-pulse rounded-2xl bg-linear-to-br from-slate-100 via-white to-slate-100" />
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
  const { user } = useOutletContext();
  const location = useLocation();
  const activeMenu = location.state?.menu || "Sales";
  const Motion = motion;
  const motionSafe = useMotionSafe();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const {
    period,
    referenceDate,
    sales,
    meta,
    isLoading,
    error,
    selectedTransactionId,
    transactionToDelete,
    isDeletingTransaction,
    totals,
    yearlyOptions,
    handleChangePeriod,
    handleWeekInput,
    handleMonthInput,
    handleYearSelect,
    openTransaction,
    closeTransaction,
    openDeletePrompt,
    closeDeletePrompt,
    prevPage,
    nextPage,
    handleDeleteTransaction,
  } = useSalesPage({ pageSize: 8 });

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
          <Motion.article
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
          </Motion.article>

          <Motion.article
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
          </Motion.article>

          <Motion.article
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
          </Motion.article>

          <Motion.article
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
          </Motion.article>
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
                    type="button"
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

            {period === "weekly" ? (
              <details className="w-full sm:w-auto">
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
            ) : period === "monthly" ? (
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
            ) : period === "yearly" ? (
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
                        onClick={() => handleYearSelect(year)}
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
            ) : null}

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
                <Motion.article
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
                        OID-#{transaction.tid}
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

                  <div className="mt-3 flex items-end justify-end">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openTransaction(transaction.tid)}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                      >
                        expand
                      </button>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => openDeletePrompt(transaction)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </Motion.article>
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
                  <Motion.tr
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openTransaction(transaction.tid)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                        >
                          expand
                        </button>
                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => openDeletePrompt(transaction)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-rose-700 transition hover:border-rose-400 hover:bg-rose-100"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </Motion.tr>
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
                type="button"
                onClick={prevPage}
                disabled={meta.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition enabled:hover:border-slate-900 enabled:hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiChevronLeft size={14} /> Prev
              </button>
              <button
                type="button"
                onClick={nextPage}
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
        onClose={closeTransaction}
      />

      <ConfirmActionModal
        open={Boolean(transactionToDelete)}
        title="Delete transaction?"
        message={`Transaction #${transactionToDelete?.tid || ""} will be permanently removed.`}
        confirmLabel="Delete transaction"
        confirmTone="danger"
        isSubmitting={isDeletingTransaction}
        onCancel={closeDeletePrompt}
        onConfirm={handleDeleteTransaction}
      />
    </main>
  );
};

export default SalesPage;
