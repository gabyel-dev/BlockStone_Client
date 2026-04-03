import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiLoader, FiMove, FiPlus, FiRotateCcw } from "react-icons/fi";
import { useLocation, useOutletContext } from "react-router-dom";
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

const POS_PANEL_IDS = ["catalog", "ticket"];
const POS_LAYOUT_KEY_PREFIX = "blockstone.pos.layout.panels.v1";

const getPosLayoutStorageKey = (userId) =>
  `${POS_LAYOUT_KEY_PREFIX}:${String(userId || "guest")}`;

const readPosPanelOrder = (userId) => {
  if (typeof window === "undefined") {
    return POS_PANEL_IDS;
  }

  try {
    const raw = window.localStorage.getItem(getPosLayoutStorageKey(userId));
    if (!raw) {
      return POS_PANEL_IDS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return POS_PANEL_IDS;
    }

    const cleaned = parsed.filter((id) => POS_PANEL_IDS.includes(id));
    const missing = POS_PANEL_IDS.filter((id) => !cleaned.includes(id));
    return [...cleaned, ...missing];
  } catch {
    return POS_PANEL_IDS;
  }
};

const moveInArray = (list, from, to) => {
  if (from < 0 || to < 0 || from === to) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

const PosPage = () => {
  const location = useLocation();
  const { user } = useOutletContext();
  const userId = user?.id || "guest";
  const activeMenu = location.state?.menu || "POS";
  const MotionMain = motion.main;
  const MotionArticle = motion.article;
  const MotionButton = motion.button;
  const MotionSection = motion.section;

  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [notice, setNotice] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [activeItemKey, setActiveItemKey] = useState("");
  const [panelOrder, setPanelOrder] = useState(() => readPosPanelOrder(userId));
  const [activeDragPanelId, setActiveDragPanelId] = useState(null);
  const [hoverDragPanelId, setHoverDragPanelId] = useState(null);
  const draggingPanelIdRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const motionSafe = (props) => (shouldReduceMotion ? {} : props);

  useEffect(() => {
    setPanelOrder(readPosPanelOrder(userId));
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      getPosLayoutStorageKey(userId),
      JSON.stringify(panelOrder),
    );
  }, [panelOrder, userId]);

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

  const handlePanelDragStart = (panelId) => (event) => {
    draggingPanelIdRef.current = panelId;
    setActiveDragPanelId(panelId);
    setHoverDragPanelId(panelId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", panelId);
  };

  const handlePanelDragOver = (panelId) => (event) => {
    if (!activeDragPanelId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (hoverDragPanelId !== panelId) {
      setHoverDragPanelId(panelId);
    }
  };

  const handlePanelDrop = (panelId) => (event) => {
    event.preventDefault();

    const draggingId = draggingPanelIdRef.current;
    if (!draggingId) {
      return;
    }

    if (draggingId !== panelId) {
      setPanelOrder((current) => {
        const from = current.indexOf(draggingId);
        const to = current.indexOf(panelId);
        return moveInArray(current, from, to);
      });
    }

    setHoverDragPanelId(panelId);
  };

  const handlePanelDragEnd = () => {
    draggingPanelIdRef.current = null;
    setActiveDragPanelId(null);
    setHoverDragPanelId(null);
  };

  const resetPosLayout = () => {
    setPanelOrder(POS_PANEL_IDS);
  };

  const catalogPanel = (
    <div className="space-y-3 sm:space-y-4">
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
          className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:rounded-3xl sm:p-5"
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
                    P{item.price.toFixed(2)} {item.unit ? `/ ${item.unit}` : ""}
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
  );

  const ticketPanel = (
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
  );

  const posPanelContent = {
    catalog: catalogPanel,
    ticket: ticketPanel,
  };

  const posPanelLabel = {
    catalog: "Service Catalog",
    ticket: "Order Ticket",
  };

  const posPanelSpan = {
    catalog: "xl:col-span-7",
    ticket: "xl:col-span-5",
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:mb-6 sm:px-4 sm:py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            POS Workspace
          </p>
          <p className="text-xs text-slate-600">
            Drag and reorder panels to match your preferred workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={resetPosLayout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
        >
          <FiRotateCcw size={13} /> Reset POS layout
        </button>
      </div>

      <img
        src="/logo.png"
        alt="logo"
        className="pointer-events-none absolute z-0 right-1/4 top-1/3 scale-150 opacity-3"
      />

      <section className="grid z-3 overflow-hidden gap-4 sm:gap-6 xl:grid-cols-12">
        {panelOrder.map((panelId) => {
          const isActive = activeDragPanelId === panelId;
          const isHoverTarget = hoverDragPanelId === panelId;

          return (
            <MotionSection
              key={panelId}
              layout
              draggable
              onDragStart={handlePanelDragStart(panelId)}
              onDragOver={handlePanelDragOver(panelId)}
              onDrop={handlePanelDrop(panelId)}
              onDragEnd={handlePanelDragEnd}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className={`rounded-2xl border border-dashed border-slate-300 bg-white/70 p-2 transition ${posPanelSpan[panelId]} ${
                isActive
                  ? "scale-[0.99] border-cyan-400 bg-cyan-50/60 shadow-[0_18px_34px_-24px_rgba(6,182,212,0.55)]"
                  : isHoverTarget
                    ? "border-cyan-300 bg-cyan-50/45"
                    : "hover:border-slate-200"
              }`}
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                <FiMove size={12} /> {posPanelLabel[panelId]}
              </div>
              {posPanelContent[panelId]}
            </MotionSection>
          );
        })}
      </section>
    </MotionMain>
  );
};

export default PosPage;
