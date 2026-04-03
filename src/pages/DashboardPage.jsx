import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiMaximize2,
  FiMinimize2,
  FiMove,
  FiRefreshCw,
  FiRotateCcw,
  FiShuffle,
  FiTarget,
} from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import CategoryIncomeChartCard from "../components/dashboard/CategoryIncomeChartCard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PulseSection from "../components/dashboard/PulseSection";
import RevenueMixCard from "../components/dashboard/RevenueMixCard";
import ShiftAgendaCard from "../components/dashboard/ShiftAgendaCard";
import StockRadarCard from "../components/dashboard/StockRadarCard";
import ThroughputChartCard from "../components/dashboard/ThroughputChartCard";
import DashboardSkeleton from "../components/skeletons/dashboard/DashboardSkeleton";
import ShiftAgendaModal from "../components/Agendas/shiftAgenda";
import { useInventoryData } from "../hooks/useInventoryData";
import { getTodayDateValue } from "../utils/timezoneDate";
import { readUserSettings } from "../utils/userSettings";
import { useAiPulse } from "./dashboard/hooks/useAiPulse";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import { useShiftAgendaData } from "./dashboard/hooks/useShiftAgendaData";

const DASHBOARD_CARD_IDS = [
  "pulse",
  "agenda",
  "throughput",
  "revenue",
  "category",
  "stock",
];

const DASHBOARD_LAYOUT_KEY_PREFIX = "blockstone.dashboard.layout.cards.v1";
const DASHBOARD_SHAPE_KEY_PREFIX = "blockstone.dashboard.layout.shapes.v1";
const DASHBOARD_HIDDEN_CARDS_KEY_PREFIX =
  "blockstone.dashboard.layout.hidden-cards.v1";

const DEFAULT_CARD_SHAPES = {
  pulse: "wide",
  agenda: "compact",
  throughput: "wide",
  revenue: "balanced",
  category: "wide",
  stock: "compact",
};

const SHAPE_SEQUENCE = ["compact", "balanced", "wide", "full"];

const SHAPE_SPAN_CLASS = {
  compact: "xl:col-span-4",
  balanced: "xl:col-span-6",
  wide: "xl:col-span-8",
  full: "xl:col-span-12",
};

const SHAPE_LABEL = {
  compact: "Compact",
  balanced: "Balanced",
  wide: "Wide",
  full: "Full",
};

const getLayoutStorageKey = (userId) =>
  `${DASHBOARD_LAYOUT_KEY_PREFIX}:${String(userId || "guest")}`;

const getShapeStorageKey = (userId) =>
  `${DASHBOARD_SHAPE_KEY_PREFIX}:${String(userId || "guest")}`;

const getHiddenCardsStorageKey = (userId) =>
  `${DASHBOARD_HIDDEN_CARDS_KEY_PREFIX}:${String(userId || "guest")}`;

const readCardOrder = (userId) => {
  if (typeof window === "undefined") {
    return DASHBOARD_CARD_IDS;
  }

  try {
    const raw = window.localStorage.getItem(getLayoutStorageKey(userId));
    if (!raw) {
      return DASHBOARD_CARD_IDS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return DASHBOARD_CARD_IDS;
    }

    const cleaned = parsed.filter((id) => DASHBOARD_CARD_IDS.includes(id));
    const missing = DASHBOARD_CARD_IDS.filter((id) => !cleaned.includes(id));

    return [...cleaned, ...missing];
  } catch {
    return DASHBOARD_CARD_IDS;
  }
};

const readCardShapes = (userId) => {
  if (typeof window === "undefined") {
    return DEFAULT_CARD_SHAPES;
  }

  try {
    const raw = window.localStorage.getItem(getShapeStorageKey(userId));
    if (!raw) {
      return DEFAULT_CARD_SHAPES;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_CARD_SHAPES;
    }

    return DASHBOARD_CARD_IDS.reduce((accumulator, cardId) => {
      const requestedShape = String(parsed?.[cardId] || "").trim();
      accumulator[cardId] = SHAPE_SEQUENCE.includes(requestedShape)
        ? requestedShape
        : DEFAULT_CARD_SHAPES[cardId];
      return accumulator;
    }, {});
  } catch {
    return DEFAULT_CARD_SHAPES;
  }
};

const readHiddenCards = (userId) => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(getHiddenCardsStorageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id) => DASHBOARD_CARD_IDS.includes(id));
  } catch {
    return [];
  }
};

const getNextShape = (currentShape) => {
  const index = SHAPE_SEQUENCE.indexOf(currentShape);
  if (index < 0) {
    return SHAPE_SEQUENCE[0];
  }

  return SHAPE_SEQUENCE[(index + 1) % SHAPE_SEQUENCE.length];
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

const MotionArticle = motion.article;

// Main dashboard page that loads analytics and passes data into UI cards.
const DashboardPage = () => {
  const { user } = useOutletContext();
  const userId = user?.id || "guest";
  const canUseAi = String(user?.role || "").toLowerCase() === "admin";
  const [dashboardSettings, setDashboardSettings] = useState(() =>
    readUserSettings(userId),
  );
  const [isLargeScreen, setIsLargeScreen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth >= 1024;
  });

  // Selected filter values for dashboard analytics.
  const [period, setPeriod] = useState("daily");
  const [referenceDate, setReferenceDate] = useState(() => getTodayDateValue());
  const [onClose, setOnClose] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cardOrder, setCardOrder] = useState(() => readCardOrder(userId));
  const [cardShapes, setCardShapes] = useState(() => readCardShapes(userId));
  const [hiddenCards, setHiddenCards] = useState(() => readHiddenCards(userId));
  const [activeDragCardId, setActiveDragCardId] = useState(null);
  const [hoverDragCardId, setHoverDragCardId] = useState(null);
  const [dashboardActionHint, setDashboardActionHint] = useState("");
  const draggingCardIdRef = useRef(null);
  const canEditLayout = isLargeScreen;

  const { summary, throughput, revenueMix, isLoading, reloadDashboard } =
    useDashboardData({
      period,
      referenceDate,
      refreshMs: dashboardSettings.dashboardRefreshMs,
    });
  const {
    stockRadar,
    metrics: inventoryMetrics,
    isLoading: isInventoryLoading,
    error: inventoryError,
    loadInventory,
  } = useInventoryData();
  const { agendaData, addAgenda, editAgenda, removeAgenda, isAgendaLoading } =
    useShiftAgendaData();

  const inventorySnapshot = useMemo(
    () => ({
      criticalCount: Number(inventoryMetrics.criticalItems ?? 0),
      criticalPercentage: Number(inventoryMetrics.criticalPercentage ?? 0),
      totalItems: Number(inventoryMetrics.totalItems ?? 0),
    }),
    [
      inventoryMetrics.criticalItems,
      inventoryMetrics.criticalPercentage,
      inventoryMetrics.totalItems,
    ],
  );

  const { aiPulse, isRefreshingPulse } = useAiPulse({
    enabled: canUseAi,
    summary,
    period,
    referenceDate,
    stockRadar,
    inventoryMetrics: inventorySnapshot,
    revenueMix,
    throughput,
    agendaCount: Array.isArray(agendaData) ? agendaData.length : 0,
  });

  useEffect(() => {
    setCardOrder(readCardOrder(userId));
    setCardShapes(readCardShapes(userId));
    setHiddenCards(readHiddenCards(userId));
    setDashboardSettings(readUserSettings(userId));
  }, [userId]);

  useEffect(() => {
    const handleSettingsChanged = (event) => {
      const changedUserId = String(event?.detail?.userId || "guest");
      if (changedUserId !== String(userId)) {
        return;
      }

      setDashboardSettings(event?.detail?.settings || readUserSettings(userId));
    };

    const handleStorage = () => {
      setDashboardSettings(readUserSettings(userId));
    };

    window.addEventListener("app:settings-changed", handleSettingsChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("app:settings-changed", handleSettingsChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (period !== "daily") {
      return;
    }

    const syncDailyReferenceDate = () => {
      const todayInManila = getTodayDateValue();
      setReferenceDate((current) =>
        current === todayInManila ? current : todayInManila,
      );
    };

    // Sync immediately on entering daily mode and then keep it aligned past midnight in PHT.
    syncDailyReferenceDate();
    const timer = window.setInterval(syncDailyReferenceDate, 30000);

    return () => window.clearInterval(timer);
  }, [period]);

  useEffect(() => {
    if (canEditLayout) {
      return;
    }

    setIsEditMode(false);
    setActiveDragCardId(null);
    setHoverDragCardId(null);
    draggingCardIdRef.current = null;
  }, [canEditLayout]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      getLayoutStorageKey(userId),
      JSON.stringify(cardOrder),
    );
  }, [cardOrder, userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      getShapeStorageKey(userId),
      JSON.stringify(cardShapes),
    );
  }, [cardShapes, userId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      getHiddenCardsStorageKey(userId),
      JSON.stringify(hiddenCards),
    );
  }, [hiddenCards, userId]);

  const handleCardDragStart = (cardId) => (event) => {
    if (!canEditLayout || !isEditMode) {
      event.preventDefault();
      return;
    }

    draggingCardIdRef.current = cardId;
    setActiveDragCardId(cardId);
    setHoverDragCardId(cardId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", cardId);
  };

  const handleCardDragOver = (cardId) => (event) => {
    if (!canEditLayout || !isEditMode || !activeDragCardId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (hoverDragCardId !== cardId) {
      setHoverDragCardId(cardId);
    }
  };

  const handleCardDrop = (cardId) => (event) => {
    if (!canEditLayout || !isEditMode) {
      return;
    }

    event.preventDefault();

    const draggingId = draggingCardIdRef.current;
    if (!draggingId) {
      return;
    }

    if (draggingId !== cardId) {
      setCardOrder((current) => {
        const from = current.indexOf(draggingId);
        const to = current.indexOf(cardId);
        return moveInArray(current, from, to);
      });
    }

    setHoverDragCardId(cardId);
  };

  const handleCardDragEnd = () => {
    draggingCardIdRef.current = null;
    setActiveDragCardId(null);
    setHoverDragCardId(null);
  };

  const resetCardLayout = () => {
    setCardOrder(DASHBOARD_CARD_IDS);
    setCardShapes(DEFAULT_CARD_SHAPES);
    setHiddenCards([]);
  };

  const setCompactShapes = () => {
    setCardShapes(
      DASHBOARD_CARD_IDS.reduce((accumulator, cardId) => {
        accumulator[cardId] = cardId === "pulse" ? "wide" : "compact";
        return accumulator;
      }, {}),
    );
  };

  const toggleCardShape = (cardId) => () => {
    setCardShapes((current) => ({
      ...current,
      [cardId]: getNextShape(current[cardId]),
    }));
  };

  const visibleCardOrder = dashboardSettings.dashboardEnableCardVisibility
    ? cardOrder.filter((cardId) => !hiddenCards.includes(cardId))
    : cardOrder;

  const criticalStockCount = Number(inventoryMetrics.criticalItems ?? 0);

  const setHintMessage = (message) => {
    setDashboardActionHint(String(message || ""));
    window.setTimeout(() => {
      setDashboardActionHint((current) =>
        current === String(message || "") ? "" : current,
      );
    }, 2500);
  };

  const toggleCardVisibility = (cardId) => {
    setHiddenCards((current) => {
      if (current.includes(cardId)) {
        setHintMessage(`${cardLabels[cardId]} is now visible.`);
        return current.filter((value) => value !== cardId);
      }

      const next = [...current, cardId];
      setHintMessage(`${cardLabels[cardId]} hidden.`);
      return next;
    });
  };

  const showAllCards = () => {
    setHiddenCards([]);
    setHintMessage("All dashboard cards are visible.");
  };

  const handleRefreshNow = async () => {
    reloadDashboard();
    await loadInventory();
    setHintMessage("Dashboard refreshed.");
  };

  const focusCriticalStock = () => {
    setHiddenCards((current) => current.filter((item) => item !== "stock"));
    setCardOrder((current) => {
      const withoutStock = current.filter((item) => item !== "stock");
      return ["stock", ...withoutStock];
    });

    setHintMessage(
      criticalStockCount > 0
        ? `Focused Stock Radar (${criticalStockCount} critical items).`
        : "Focused Stock Radar.",
    );
  };

  const shuffleLayout = () => {
    setCardOrder((current) => {
      const next = [...current];
      for (let index = next.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
      }
      return next;
    });
    setHintMessage("Card order shuffled.");
  };

  const cardContent = {
    pulse: (
      <PulseSection
        summary={summary}
        period={period}
        aiPulse={aiPulse}
        isRefreshingPulse={isRefreshingPulse}
      />
    ),
    agenda: <ShiftAgendaCard setClose={setOnClose} agendaData={agendaData} />,
    throughput: <ThroughputChartCard period={period} throughput={throughput} />,
    revenue: <RevenueMixCard mixData={revenueMix} />,
    category: <CategoryIncomeChartCard mixData={revenueMix} />,
    stock: (
      <StockRadarCard
        stockRadar={stockRadar}
        isLoading={isInventoryLoading}
        error={inventoryError}
        onRetry={() => loadInventory()}
        criticalPercentage={inventoryMetrics.criticalPercentage}
        criticalCount={inventoryMetrics.criticalItems}
        totalItems={inventoryMetrics.totalItems}
      />
    ),
  };

  const cardLabels = {
    pulse: "Live Pulse",
    agenda: "Shift Agenda",
    throughput: "Throughput",
    revenue: "Revenue Mix",
    category: "Category Income",
    stock: "Stock Radar",
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full px-4 py-4 text-slate-900 md:pl-5 lg:pl-0 md:pr-5 sm:py-9">
      <DashboardHeader
        firstName={user?.first_name}
        period={period}
        referenceDate={referenceDate}
        onPeriodChange={setPeriod}
        onDateChange={setReferenceDate}
      />

      {dashboardSettings.dashboardShowQuickActions ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:mb-6 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Quick Actions
              </p>
              <p className="text-xs text-slate-600">
                Fast controls for live dashboard operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshNow}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                <FiRefreshCw size={13} /> Refresh now
              </button>

              <button
                type="button"
                onClick={focusCriticalStock}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:border-amber-400"
              >
                <FiTarget size={13} /> Focus stock risk
              </button>

              <button
                type="button"
                onClick={shuffleLayout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                <FiShuffle size={13} /> Shuffle layout
              </button>

              <button
                type="button"
                onClick={showAllCards}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                <FiEye size={13} /> Show all cards
              </button>
            </div>
          </div>

          {dashboardActionHint ? (
            <p className="mt-2 inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
              <FiActivity size={12} className="mr-1" /> {dashboardActionHint}
            </p>
          ) : null}
        </div>
      ) : null}

      {dashboardSettings.dashboardEnableCardVisibility ? (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:mb-6 sm:px-4 sm:py-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Toggle Card Visibility
          </p>
          <div className="flex flex-wrap gap-2">
            {DASHBOARD_CARD_IDS.map((cardId) => {
              const isHidden = hiddenCards.includes(cardId);
              return (
                <button
                  key={`visibility-${cardId}`}
                  type="button"
                  onClick={() => toggleCardVisibility(cardId)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isHidden
                      ? "border-slate-300 bg-slate-100 text-slate-500"
                      : "border-slate-900 bg-slate-900 text-white"
                  }`}
                >
                  {isHidden ? <FiEyeOff size={12} /> : <FiEye size={12} />}{" "}
                  {cardLabels[cardId]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {canEditLayout ? (
        <div className="mb-4 hidden flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] sm:mb-6 sm:px-4 sm:py-3 lg:flex">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Personalize Workspace
            </p>
            <p className="text-xs text-slate-600">
              Drag cards anytime. Tap each card shape to resize dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditMode((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isEditMode
                  ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              <FiEdit3 size={13} />{" "}
              {isEditMode ? "Done Editing" : "Edit Layout"}
            </button>

            <button
              type="button"
              onClick={setCompactShapes}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              <FiMinimize2 size={13} /> Compact view
            </button>

            <button
              type="button"
              onClick={resetCardLayout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              <FiRotateCcw size={13} /> Reset layout
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative">
        {canEditLayout && isEditMode && activeDragCardId ? (
          <div className="pointer-events-none absolute inset-0 z-0 rounded-2xl border border-slate-200/70 bg-slate-50/40 p-2">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <FiGrid size={12} /> Drop only on boxed cards. Outside area is
              locked.
            </div>
            <div className="grid h-[calc(100%-1.25rem)] grid-cols-12 gap-1.5">
              {Array.from({ length: 72 }).map((_, index) => (
                <span
                  key={`drag-grid-${index}`}
                  className="rounded border border-slate-300/60 bg-white/45"
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="relative z-10 grid gap-3 sm:gap-4 xl:grid-cols-12">
          {visibleCardOrder.map((cardId) => {
            const isActive = activeDragCardId === cardId;
            const isHoverTarget = hoverDragCardId === cardId;
            const shape = cardShapes[cardId] || DEFAULT_CARD_SHAPES[cardId];
            const shapeClass =
              SHAPE_SPAN_CLASS[shape] || SHAPE_SPAN_CLASS.balanced;
            const shouldHighlightCriticalStock =
              cardId === "stock" &&
              dashboardSettings.dashboardHighlightCriticalStock &&
              criticalStockCount > 0;

            return (
              <MotionArticle
                key={cardId}
                layout
                draggable={canEditLayout && isEditMode}
                onDragStart={handleCardDragStart(cardId)}
                onDragOver={handleCardDragOver(cardId)}
                onDrop={handleCardDrop(cardId)}
                onDragEnd={handleCardDragEnd}
                transition={{ type: "spring", stiffness: 360, damping: 32 }}
                className={`group rounded-2xl border bg-white/75 transition ${shapeClass} ${
                  canEditLayout && isEditMode
                    ? "cursor-grab border-dashed border-slate-300 active:cursor-grabbing"
                    : "cursor-default border-transparent"
                } ${
                  isActive
                    ? "scale-[0.99] border-cyan-400 bg-cyan-50/60 shadow-[0_18px_34px_-24px_rgba(6,182,212,0.55)]"
                    : isHoverTarget
                      ? "border-cyan-300 bg-cyan-50/45"
                      : "hover:border-slate-200"
                } ${
                  shouldHighlightCriticalStock
                    ? "ring-2 ring-amber-300/80 shadow-[0_18px_34px_-24px_rgba(245,158,11,0.5)]"
                    : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  {canEditLayout && isEditMode ? (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                      <FiMove size={12} /> Drag card
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {cardLabels[cardId]}
                    </div>
                  )}

                  {canEditLayout ? (
                    <button
                      type="button"
                      onClick={toggleCardShape(cardId)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                      title="Cycle card size"
                    >
                      <FiMaximize2 size={11} /> {SHAPE_LABEL[shape]}
                    </button>
                  ) : null}
                </div>
                {cardContent[cardId]}
              </MotionArticle>
            );
          })}
        </div>

        {visibleCardOrder.length === 0 ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            All cards are hidden. Use{" "}
            <span className="font-semibold">Show all cards</span> to restore
            your dashboard.
          </div>
        ) : null}
      </div>

      {onClose && (
        <ShiftAgendaModal
          onClose={setOnClose}
          agendaData={agendaData}
          onCreate={addAgenda}
          onUpdate={editAgenda}
          onDelete={removeAgenda}
          isLoading={isAgendaLoading}
        />
      )}
    </div>
  );
};

export default DashboardPage;
