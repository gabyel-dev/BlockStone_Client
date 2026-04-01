import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";
import { getTransactionById } from "../../api/print";
import { formatDateTimeInTimeZone } from "../../utils/timezoneDate";

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const formatUnit = (unitValue) => {
  const normalized = String(unitValue ?? "")
    .trim()
    .toLowerCase();

  if (["page", "sheet", "session", "set", "print"].includes(normalized)) {
    return normalized;
  }

  return normalized || "-";
};

// Isolated transaction-by-id modal so detail fetch/debugging stays in one place.
const TransactionDetailModal = ({ transactionId, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);

  useEffect(() => {
    if (!transactionId) return;

    let isMounted = true;

    const fetchOrderDetail = async () => {
      try {
        setIsOrderLoading(true);
        const response = await getTransactionById(transactionId);

        if (!isMounted) {
          return;
        }

        setSelectedOrder(response?.data?.data);
      } catch {
        if (!isMounted) {
          return;
        }
        toast.error("Unable to load full order details.");
      } finally {
        if (isMounted) {
          setIsOrderLoading(false);
        }
      }
    };

    fetchOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onClose]);

  if (!transactionId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/45 p-4 backdrop-blur-[2px]">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-[26px] border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              Full Order View
            </p>
            <h2 className="text-2xl font-black text-slate-900">
              Transaction #{transactionId}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
          >
            <FiX size={18} />
          </button>
        </div>

        {isOrderLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-600">
            Loading complete transaction details...
          </div>
        ) : null}

        {!isOrderLoading && selectedOrder?.transaction ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatDateTimeInTimeZone(
                    selectedOrder.transaction.transaction_date,
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Cashier
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedOrder.transaction.first_name || "-"}{" "}
                  {selectedOrder.transaction.last_name || ""}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Gross Total
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {peso.format(
                    Number(selectedOrder.transaction.total_amount ?? 0),
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Net Total
                </p>
                <p className="mt-1 text-sm font-black text-emerald-700">
                  {peso.format(
                    Number(selectedOrder.transaction.total_net_amount ?? 0),
                  )}
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-2 py-1">Service</th>
                    <th className="px-2 py-1">Category</th>
                    <th className="px-2 py-1">Option</th>
                    <th className="px-2 py-1 text-right">Price</th>
                    <th className="px-2 py-1 text-right">Unit</th>
                    <th className="px-2 py-1 text-right">Qty</th>
                    <th className="px-2 py-1 text-right">Net</th>
                    <th className="px-2 py-1 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.items || []).map((item) => (
                    <tr
                      key={item.id}
                      className="rounded-lg bg-slate-50 text-sm text-slate-700"
                    >
                      <td className="rounded-l-lg px-2 py-2.5 font-semibold text-slate-900">
                        {item.service_name}
                      </td>
                      <td className="px-2 py-2.5">{item.category_name}</td>
                      <td className="px-2 py-2.5">{item.option_name}</td>
                      <td className="px-2 py-2.5 text-right">
                        {peso.format(Number(item.price ?? 0))}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-slate-700">
                        {formatUnit(item.unit)}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-2 py-2.5 text-right font-semibold text-emerald-700">
                        {peso.format(Number(item.net_amount ?? 0))}
                      </td>
                      <td className="rounded-r-lg px-2 py-2.5 text-right font-black text-slate-900">
                        {peso.format(Number(item.subtotal ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TransactionDetailModal;
