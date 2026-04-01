import { motion, useReducedMotion } from "framer-motion";
import { FiCheckCircle, FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const MotionAside = motion.aside;
const MotionDiv = motion.div;
const MotionButton = motion.button;

// Formats currency values for consistent ticket display.
const formatAmount = (amount) => `P${amount.toFixed(2)}`;

// Renders the full order ticket summary and action for order placement.
const OrderTicketAside = ({
  customerName,
  onCustomerNameChange,
  orderItems,
  onDecreaseQty,
  onIncreaseQty,
  onRemoveItem,
  onCustomPriceChange,
  subtotal,
  notice,
  onSubmit,
  isSubmitting,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const motionSafe = (props) => (shouldReduceMotion ? {} : props);

  return (
    <MotionAside
      className="rounded-2xl border relative z-4  border-slate-200  p-3.5 sm:rounded-[28px] sm:p-5 xl:col-span-5"
      {...motionSafe({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      })}
    >
      <h2 className="text-lg font-black text-slate-900 sm:text-xl">
        Order Ticket
      </h2>

      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Customer Name
          </label>
          <input
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-900 sm:py-2.5"
          />
        </div>

        <div className="max-h-64 space-y-2 overflow-y-auto pr-1 sm:max-h-72">
          {orderItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm text-slate-500">
              Add services from the left panel.
            </div>
          ) : (
            orderItems.map((entry) => {
              const effectivePrice = entry.price + entry.customPrice;
              const lineTotal = effectivePrice * entry.qty;

              return (
                <MotionDiv
                  key={entry.id}
                  {...motionSafe({
                    initial: { opacity: 0, y: 6 },
                    animate: { opacity: 1, y: 0 },
                  })}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-2.5 sm:px-3 sm:py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 sm:text-sm">
                        {entry.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Fixed {formatAmount(entry.price)}
                        {entry.unit ? ` / ${entry.unit}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(entry.id)}
                      className="text-slate-400 transition hover:text-rose-600"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-2.5 grid gap-2 sm:mt-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Custom Price Add
                      </p>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.customPrice}
                        onChange={(e) =>
                          onCustomPriceChange(
                            entry.id,
                            Number(e.target.value || 0),
                          )
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-900 sm:text-sm"
                      />
                    </div>

                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Fixed Price
                      </p>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 sm:text-sm">
                        {formatAmount(effectivePrice)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between sm:mt-3">
                    <div className="inline-flex items-center rounded-lg border border-slate-200">
                      <button
                        onClick={() => onDecreaseQty(entry.id)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-800 sm:text-sm">
                        {entry.qty}
                      </span>
                      <button
                        onClick={() => onIncreaseQty(entry.id)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>
                    <p className="text-xs font-black text-slate-900 sm:text-sm">
                      {formatAmount(lineTotal)}
                    </p>
                  </div>
                </MotionDiv>
              );
            })
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold">{formatAmount(subtotal)}</span>
          </p>
          <p className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-base font-black text-slate-900">
            <span>Total</span>
            <span>{formatAmount(subtotal)}</span>
          </p>
        </div>

        <div>
          <MotionButton
            onClick={onSubmit}
            {...motionSafe({
              whileHover: { y: -1, scale: 1.01 },
              whileTap: { scale: 0.98 },
            })}
            disabled={isSubmitting}
            className={`flex w-full items-center justify-center gap-2 rounded-xl ${isSubmitting ? "bg-slate-500 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-700 cursor-pointer"} px-4 py-2.5 text-sm font-bold text-white transition  sm:py-3`}
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-b-white border-t-white border-transparent animate-spin"></span>
                Placing order...
              </>
            ) : (
              <>
                <FiCheckCircle size={16} />
                <span>Place Order</span>
              </>
            )}
          </MotionButton>
        </div>

        {notice ? (
          <p className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            {notice}
          </p>
        ) : null}
      </div>
    </MotionAside>
  );
};

export default OrderTicketAside;
