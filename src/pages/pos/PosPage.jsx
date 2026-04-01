import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiLoader, FiPlus } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { createTransaction, getPrintServices } from "../../api/print";
import OrderTicketAside from "./components/OrderTicketAside";
import {
  buildItemKey,
  mapServicesObjectToCatalog,
  readCatalogCache,
  writeCatalogCache,
} from "./utils/catalog";
import {
  addOrIncrementOrderItem,
  buildNormalizedItems,
  calculateSubtotal,
  hasInvalidPriceOption,
  removeOrderItem,
  updateOrderItemCustomPrice,
  updateOrderItemQty,
} from "./utils/order";

const PosPage = () => {
  const location = useLocation();
  const activeMenu = location.state?.menu || "POS";
  const MotionMain = motion.main;
  const MotionArticle = motion.article;
  const MotionButton = motion.button;

  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [notice, setNotice] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [activeItemKey, setActiveItemKey] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const motionSafe = (props) => (shouldReduceMotion ? {} : props);

  // Loads available POS services from backend and prepares sectioned catalog state.
  useEffect(() => {
    const cachedCatalog = readCatalogCache();
    if (cachedCatalog.length > 0) {
      setCatalog(cachedCatalog);
      setIsCatalogLoading(false);
      return;
    }

    let isMounted = true;

    const fetchServices = async () => {
      try {
        setIsCatalogLoading(true);
        setCatalogError("");

        const response = await getPrintServices();
        const servicesObject = response?.data?.data?.services;
        const mappedCatalog = mapServicesObjectToCatalog(servicesObject);

        if (isMounted) {
          setCatalog(mappedCatalog);
          writeCatalogCache(mappedCatalog);
        }
      } catch {
        if (isMounted) {
          setCatalogError(
            "Unable to load services. Please refresh and try again.",
          );
          setCatalog([]);
        }
      } finally {
        if (isMounted) {
          setIsCatalogLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  // Adds a selected service to ticket or increments quantity if it already exists.
  const addItem = (item) => {
    const itemKey = buildItemKey(item);
    setActiveItemKey(itemKey);

    setOrderItems((prev) => {
      const { orderItems: nextItems, wasIncremented } = addOrIncrementOrderItem(
        prev,
        item,
      );

      if (wasIncremented) {
        toast.success(`${item.name} quantity increased.`);
      } else {
        toast.success(`${item.name} added to ticket.`);
      }

      return nextItems;
    });

    window.setTimeout(() => {
      setActiveItemKey("");
    }, 300);
  };

  // Adjusts line quantity and removes a line when quantity reaches zero.
  const updateQty = (id, delta) => {
    setOrderItems((prev) => updateOrderItemQty(prev, id, delta));
  };

  // Removes a line item from the ticket.
  const removeItem = (id) => {
    setOrderItems((prev) => removeOrderItem(prev, id));
  };

  // Updates per-line custom add-on price while preventing negative values.
  const updateCustomPrice = (id, value) => {
    setOrderItems((prev) => updateOrderItemCustomPrice(prev, id, value));
  };

  // Calculates subtotal using (fixed price + custom price) times quantity for each line.
  const subtotal = useMemo(() => calculateSubtotal(orderItems), [orderItems]);

  // Validates ticket input and sets a readable status message after submit.
  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.warning("Customer name is required.");
      return;
    }
    if (!orderItems.length) {
      toast.warning("Please add at least one service.");
      return;
    }

    const normalizedItems = buildNormalizedItems(orderItems);

    if (hasInvalidPriceOption(normalizedItems)) {
      toast.error("Unable to place order. Reload services and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createTransaction({
        paymentMethod: "Order",
        customerName: customerName.trim(),
        totalAmount: subtotal,
        items: normalizedItems,
      });

      const transactionId = response?.data?.data?.tid;
      setNotice(
        `Order created for ${customerName.trim()} (${orderItems.length} item types, Total P${subtotal.toFixed(2)}).`,
      );
      setOrderItems([]);
      setCustomerName("");
      toast.success(`Order #${transactionId} placed successfully.`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Unable to place order. Please try again.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionMain
      className="min-h-screen py-10 text-slate-900 pr-6 pl-6 md:pl-0"
      {...motionSafe({
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
      })}
    >
      <header className="mb-4 flex flex-wrap items-end justify-between gap-2 sm:mb-6 sm:gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {activeMenu}
          </p>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Create Service
          </h1>
        </div>
      </header>

      <img
        src="/logo.png"
        alt="logo"
        className="absolute z-0 right-1/4 top-1/3  scale-150 opacity-3"
      />

      <section className="grid  z-3 overflow-hidden gap-4 sm:gap-6 xl:grid-cols-12">
        <div className="space-y-3 sm:space-y-4 xl:col-span-7">
          {catalogError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {catalogError}
            </div>
          ) : null}

          {isCatalogLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:rounded-3xl sm:p-8">
              <div className="flex items-center gap-3 text-slate-600">
                <FiLoader className="animate-spin" size={18} />
                Fetching service catalog...
              </div>
            </div>
          ) : null}

          {catalog.map((group, groupIndex) => (
            <MotionArticle
              key={group.section}
              {...motionSafe({
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: groupIndex * 0.05 },
              })}
              className="rounded-2xl  border border-slate-200 bg-white p-3.5 sm:rounded-3xl sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <h2 className="text-base font-black text-slate-900 sm:text-lg">
                  {group.section}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  {group.items.length} services
                </span>
              </div>

              <div className="grid relative gap-2 overflow-hidden sm:grid-cols-2">
                {group.items.map((item, index) => (
                  <MotionButton
                    key={`${item.id}-${item.priceOptionId ?? item.name}`}
                    onClick={() => addItem(item)}
                    {...motionSafe({
                      initial: { opacity: 0, y: 6 },
                      animate: { opacity: 1, y: 0 },
                      transition: { delay: index * 0.03 },
                      whileHover: { scale: 1.01 },
                      whileTap: { scale: 0.98 },
                    })}
                    className={`group flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition sm:py-3 ${
                      activeItemKey ===
                      `${item.id}-${item.priceOptionId ?? item.name}`
                        ? "border-slate-900 bg-white ring-2 ring-slate-300"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                    }`}
                    aria-pressed={
                      activeItemKey ===
                      `${item.id}-${item.priceOptionId ?? item.name}`
                    }
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 sm:text-sm">
                        {item.name}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        P{item.price.toFixed(2)}{" "}
                        {item.unit ? `/ ${item.unit}` : ""}
                      </p>
                    </div>
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-lg transition sm:h-8 sm:w-8 ${
                        activeItemKey ===
                        `${item.id}-${item.priceOptionId ?? item.name}`
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                      }`}
                    >
                      <FiPlus size={14} />
                    </span>
                  </MotionButton>
                ))}
              </div>
            </MotionArticle>
          ))}
        </div>

        <OrderTicketAside
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          orderItems={orderItems}
          onDecreaseQty={(id) => updateQty(id, -1)}
          onIncreaseQty={(id) => updateQty(id, 1)}
          onRemoveItem={removeItem}
          onCustomPriceChange={updateCustomPrice}
          subtotal={subtotal}
          notice={notice}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </section>
    </MotionMain>
  );
};

export default PosPage;
