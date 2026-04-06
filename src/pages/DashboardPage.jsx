import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiGrid, FiMaximize2, FiMove } from "react-icons/fi";
import { useOutletContext } from "react-router-dom";
import ShiftAgendaModal from "../components/Agendas/shiftAgenda";
import CategoryIncomeChartCard from "../components/dashboard/CategoryIncomeChartCard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PulseSection from "../components/dashboard/PulseSection";
import RevenueMixCard from "../components/dashboard/RevenueMixCard";
import ShiftAgendaCard from "../components/dashboard/ShiftAgendaCard";
import StockRadarCard from "../components/dashboard/StockRadarCard";
import ThroughputChartCard from "../components/dashboard/ThroughputChartCard";
import DashboardSkeleton from "../components/skeletons/dashboard/DashboardSkeleton";
import { useInventoryData } from "../hooks/useInventoryData";
import { getTodayDateValue } from "../utils/timezoneDate";
import { readUserSettings } from "../utils/userSettings";
import DashboardControlsPanel from "./dashboard/components/DashboardControlsPanel";
import DashboardVisibilityPanel from "./dashboard/components/DashboardVisibilityPanel";
import {
  DASHBOARD_CARD_IDS,
  DEFAULT_CARD_SHAPES,
  SHAPE_LABEL,
  SHAPE_SPAN_CLASS,
} from "./dashboard/constants/layout";
import { useAiPulse } from "./dashboard/hooks/useAiPulse";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import useDashboardLayoutManager from "./dashboard/hooks/useDashboardLayoutManager";
import { useShiftAgendaData } from "./dashboard/hooks/useShiftAgendaData";

const MotionArticle = motion.article;

const CARD_LABELS = {
  pulse: "Live Pulse",
  agenda: "Shift Agenda",
  throughput: "Throughput",
  revenue: "Revenue Mix",
  category: "Category Income",
  stock: "Stock Radar",
};

const DashboardPage = () => {
  const { user } = useOutletContext();
  const userId = user?.id || "guest";
  const canUseAi = String(user?.role || "").toLowerCase() === "admin";

  const [dashboardSettings, setDashboardSettings] = useState(() =>
    readUserSettings(userId),
  );
  const [period, setPeriod] = useState("daily");
  const [referenceDate, setReferenceDate] = useState(() => getTodayDateValue());
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [dashboardActionHint, setDashboardActionHint] = useState("");

  const {
    canEditLayout,
    isEditMode,
    toggleEditMode,
    cardOrder,
    visibleCardOrder,
    cardShapes,
    hiddenCards,
    activeDragCardId,
    hoverDragCardId,
    handleCardDragStart,
    handleCardDragEnter,
    handleCardDragEnd,
    resetCardLayout,
    setCompactShapes,
    toggleCardShape,
    toggleCardVisibility,
    showAllCards,
    shuffleLayout,
    focusCardFirst,
  } = useDashboardLayoutManager(userId);

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
    setDashboardSettings(readUserSettings(userId));
  }, [userId]);

  useEffect(() => {
    const handleSettingsChanged = (event) => {
      const changedUserId = String(event?.detail?.userId || "guest");
      if (changedUserId !== String(userId)) {
        return;
      }

      setDashboardSettings(readUserSettings(userId));
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
    if (period !== "daily") {
      return;
    }

    const syncDailyReferenceDate = () => {
      const todayInManila = getTodayDateValue();
      setReferenceDate((current) =>
        current === todayInManila ? current : todayInManila,
      );
    };

    syncDailyReferenceDate();
    const timer = window.setInterval(syncDailyReferenceDate, 30000);

    return () => window.clearInterval(timer);
  }, [period]);

  const visibleCards = dashboardSettings.dashboardEnableCardVisibility
    ? visibleCardOrder
    : cardOrder;

  const criticalStockCount = Number(inventoryMetrics.criticalItems ?? 0);

  const setHintMessage = (message) => {
    const normalized = String(message || "");
    setDashboardActionHint(normalized);
    window.setTimeout(() => {
      setDashboardActionHint((current) =>
        current === normalized ? "" : current,
      );
    }, 2500);
  };

  const handleToggleCardVisibility = (cardId) => {
    const isHidden = hiddenCards.includes(cardId);
    toggleCardVisibility(cardId);
    setHintMessage(
      isHidden
        ? `${CARD_LABELS[cardId]} is now visible.`
        : `${CARD_LABELS[cardId]} hidden.`,
    );
  };

  const handleShowAllCards = () => {
    showAllCards();
    setHintMessage("All dashboard cards are visible.");
  };

  const handleRefreshNow = async () => {
    reloadDashboard();
    await loadInventory();
    setHintMessage("Dashboard refreshed.");
  };

  const handleFocusCriticalStock = () => {
    if (hiddenCards.includes("stock")) {
      toggleCardVisibility("stock");
    }
    focusCardFirst("stock");

    setHintMessage(
      criticalStockCount > 0
        ? `Focused Stock Radar (${criticalStockCount} critical items).`
        : "Focused Stock Radar.",
    );
  };

  const handleShuffleLayout = () => {
    shuffleLayout();
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
    agenda: (
      <ShiftAgendaCard
        setClose={setIsAgendaModalOpen}
        agendaData={agendaData}
      />
    ),
    throughput: <ThroughputChartCard period={period} throughput={throughput} />,
    revenue: <RevenueMixCard mixData={revenueMix} />,
    category: <CategoryIncomeChartCard mixData={revenueMix} />,
    stock: (
      <StockRadarCard
        stockRadar={stockRadar}
        isLoading={isInventoryLoading}
        error={inventoryError}
        onRetry={loadInventory}
        criticalPercentage={inventoryMetrics.criticalPercentage}
        criticalCount={inventoryMetrics.criticalItems}
        totalItems={inventoryMetrics.totalItems}
      />
    ),
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full px-4 py-4 text-slate-900 md:pr-5 md:pl-5 lg:pl-0 sm:py-9">
      <DashboardHeader
        firstName={user?.first_name}
        period={period}
        referenceDate={referenceDate}
        onPeriodChange={setPeriod}
        onDateChange={setReferenceDate}
      />

      <div className="mb-4 sm:mb-6">
        <DashboardControlsPanel
          userId={userId}
          showQuickActions={dashboardSettings.dashboardShowQuickActions}
          canEditLayout={canEditLayout}
          isEditMode={isEditMode}
          onRefreshNow={handleRefreshNow}
          onFocusStockRisk={handleFocusCriticalStock}
          onShuffleLayout={handleShuffleLayout}
          onShowAllCards={handleShowAllCards}
          onToggleEditMode={toggleEditMode}
          onCompactView={setCompactShapes}
          onResetLayout={resetCardLayout}
          hintMessage={dashboardActionHint}
        />
      </div>

      {dashboardSettings.dashboardEnableCardVisibility ? (
        <div className="mb-4 sm:mb-6">
          <DashboardVisibilityPanel
            cardIds={DASHBOARD_CARD_IDS}
            cardLabels={CARD_LABELS}
            hiddenCards={hiddenCards}
            onToggleVisibility={handleToggleCardVisibility}
          />
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
          {visibleCards.map((cardId) => {
            const shape = cardShapes[cardId] || DEFAULT_CARD_SHAPES[cardId];
            const shapeClass =
              SHAPE_SPAN_CLASS[shape] || SHAPE_SPAN_CLASS.balanced;
            const isActive = activeDragCardId === cardId;
            const isHoverTarget = hoverDragCardId === cardId;
            const shouldHighlightCriticalStock =
              cardId === "stock" &&
              dashboardSettings.dashboardHighlightCriticalStock &&
              criticalStockCount > 0;

            return (
              <MotionArticle
                key={cardId}
                layout
                draggable={canEditLayout && isEditMode}
                onDragStart={(event) => {
                  if (!canEditLayout || !isEditMode) {
                    event.preventDefault();
                    return;
                  }

                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", cardId);
                  handleCardDragStart(cardId);
                }}
                onDragEnter={() => handleCardDragEnter(cardId)}
                onDragOver={(event) => {
                  if (!canEditLayout || !isEditMode || !activeDragCardId) {
                    return;
                  }

                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  handleCardDragEnter(cardId);
                }}
                onDrop={(event) => {
                  if (!canEditLayout || !isEditMode) {
                    return;
                  }

                  event.preventDefault();
                  handleCardDragEnter(cardId);
                }}
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
                      {CARD_LABELS[cardId]}
                    </div>
                  )}

                  {canEditLayout ? (
                    <button
                      type="button"
                      onClick={() => toggleCardShape(cardId)}
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

        {visibleCards.length === 0 ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            All cards are hidden. Use{" "}
            <span className="font-semibold">Show all cards</span> to restore
            your dashboard.
          </div>
        ) : null}
      </div>

      {isAgendaModalOpen ? (
        <ShiftAgendaModal
          onClose={setIsAgendaModalOpen}
          agendaData={agendaData}
          onCreate={addAgenda}
          onUpdate={editAgenda}
          onDelete={removeAgenda}
          isLoading={isAgendaLoading}
        />
      ) : null}
    </div>
  );
};

export default DashboardPage;
