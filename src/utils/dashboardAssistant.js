const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const periodLabels = {
  daily: "today",
  weekly: "this week",
  monthly: "this month",
  yearly: "this year",
};

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};

const formatPercent = (value) => `${Math.abs(toNumber(value)).toFixed(1)}%`;

const getTopRevenueCategory = (revenueMix = []) => {
  const safeList = Array.isArray(revenueMix) ? revenueMix : [];
  if (safeList.length === 0) {
    return null;
  }

  const sorted = [...safeList].sort(
    (left, right) => toNumber(right.value) - toNumber(left.value),
  );

  return sorted[0]?.label || null;
};

const getCriticalStockItems = (stockRadar = [], limit = 2) => {
  const safeList = Array.isArray(stockRadar) ? stockRadar : [];
  return [...safeList]
    .sort((left, right) => toNumber(left.level) - toNumber(right.level))
    .slice(0, limit)
    .map((item) => item.name)
    .filter(Boolean);
};

export const buildAiPulse = ({
  summary,
  period,
  stockRadar,
  criticalCount,
  revenueMix,
}) => {
  const safeSummary = summary ?? {};
  const label = periodLabels[period] ?? "this period";

  const totalOrders = toNumber(safeSummary.totalOrders);
  const netIncomeTrendDirection = safeSummary.netIncomeTrendDirection ?? "flat";
  const netIncomeChangePct = toNumber(safeSummary.netIncomeChangePct);
  const netIncomeComparisonLabel =
    safeSummary.netIncomeComparisonLabel ?? "vs previous period";

  const lowStockItems = getCriticalStockItems(stockRadar);
  const topCategory = getTopRevenueCategory(revenueMix);

  if (toNumber(criticalCount) >= 3) {
    return {
      tone: "rose",
      headline: `AI signal: Potential stock shortage detected in ${criticalCount} critical items.`,
      description:
        lowStockItems.length > 0
          ? `Priority restock: ${lowStockItems.join(", ")} to avoid fulfillment delays.`
          : "Review low-level inventory items to prevent production interruption.",
    };
  }

  if (netIncomeTrendDirection === "down" && netIncomeChangePct <= -5) {
    return {
      tone: "amber",
      headline: `AI signal: Sales momentum is softer ${label}.`,
      description: `Net income is down ${formatPercent(netIncomeChangePct)} ${netIncomeComparisonLabel}; push high-margin bundles${topCategory ? ` and feature ${topCategory}` : ""}.`,
    };
  }

  if (totalOrders === 0) {
    return {
      tone: "amber",
      headline: `AI signal: No completed orders recorded ${label}.`,
      description:
        "Trigger a quick promo and monitor cashier conversion in the next hour.",
    };
  }

  return {
    tone: "emerald",
    headline: "AI signal: Production flow is stable with healthy output.",
    description: topCategory
      ? `Top revenue driver is ${topCategory}; keep that lane prioritized while monitoring finishing queue.`
      : "Maintain current pace and keep an eye on finishing workload for same-day targets.",
  };
};

export const getAssistantRecommendations = () => [
  "What's the sales today?",
  "Which stocks are at risk right now?",
  "How can we improve profit this week?",
  "Give me a whole-system health summary.",
  "Generate an AI pulse report.",
];

const buildStockReply = ({ stockRadar, inventoryMetrics }) => {
  const criticalItems = getCriticalStockItems(stockRadar, 3);
  const criticalCount = toNumber(inventoryMetrics?.criticalCount);
  const criticalPercentage = toNumber(inventoryMetrics?.criticalPercentage);

  if (criticalCount <= 0) {
    return "Inventory risk is low right now. No critical stock items detected in current radar.";
  }

  return `There are ${criticalCount} critical items (${criticalPercentage.toFixed(1)}% of tracked inventory). Highest risk: ${criticalItems.join(", ") || "n/a"}.`;
};

const buildImproveReply = ({ summary, revenueMix, inventoryMetrics }) => {
  const safeSummary = summary ?? {};
  const placedOrders = toNumber(safeSummary.placedOrders);
  const totalOrders = toNumber(safeSummary.totalOrders);
  const avgTicket = toNumber(safeSummary.avgTicket);
  const criticalCount = toNumber(inventoryMetrics?.criticalCount);
  const topCategory = getTopRevenueCategory(revenueMix);

  const lines = [
    "Improvement plan:",
    `1) Raise average ticket from ${peso.format(avgTicket)} via bundle upsells at checkout.`,
    `2) Convert placed orders faster: ${placedOrders}/${totalOrders || 1} currently completed in this range.`,
    `3) Protect operations by reducing critical stock count (current: ${criticalCount}).`,
  ];

  if (topCategory) {
    lines.push(`4) Double-down on high-performing category: ${topCategory}.`);
  }

  return lines.join("\n");
};

export const createAssistantReply = ({
  input,
  context,
  todaySales,
  aiPulse,
}) => {
  const normalized = String(input || "")
    .trim()
    .toLowerCase();

  const summary = context?.summary ?? {};
  const throughput = Array.isArray(context?.throughput)
    ? context.throughput
    : [];
  const stockRadar = Array.isArray(context?.stockRadar)
    ? context.stockRadar
    : [];
  const inventoryMetrics = context?.inventoryMetrics ?? {};
  const revenueMix = Array.isArray(context?.revenueMix)
    ? context.revenueMix
    : [];

  if (/sales\s*today|today\s*sales|revenue\s*today/.test(normalized)) {
    if (todaySales) {
      return `Today's sales snapshot (${todaySales.date}): ${peso.format(
        toNumber(todaySales.totalRevenue),
      )} from ${toNumber(todaySales.totalOrders)} orders. Avg ticket is ${peso.format(toNumber(todaySales.avgTicket))}.`;
    }

    return "Today's exact sales are not ready yet. Please try again in a few seconds.";
  }

  if (/stock|inventory|short|critical/.test(normalized)) {
    return buildStockReply({ stockRadar, inventoryMetrics });
  }

  if (/improve|optimization|optimi|better|profit/.test(normalized)) {
    return buildImproveReply({ summary, revenueMix, inventoryMetrics });
  }

  if (/pulse|report|status|health/.test(normalized)) {
    return `${aiPulse.headline}\n${aiPulse.description}`;
  }

  if (/system|whole system|architecture|modules/.test(normalized)) {
    const topCategory = getTopRevenueCategory(revenueMix);
    const agendaCount = toNumber(context?.agendaCount);
    return [
      "I am monitoring live system signals from Dashboard KPIs, Throughput, Revenue Mix, Stock Radar, and Shift Agenda.",
      `Current snapshot: ${toNumber(summary.totalOrders)} orders, ${peso.format(toNumber(summary.totalRevenue))} revenue, ${throughput.length} throughput points tracked, ${agendaCount} shift agendas queued.`,
      topCategory
        ? `Primary revenue category right now is ${topCategory}.`
        : "Revenue category split is still limited for confident ranking.",
      buildStockReply({ stockRadar, inventoryMetrics }),
    ].join("\n");
  }

  return [
    "I can help with live ops, sales, stock risk, and optimization guidance.",
    `${aiPulse.headline}`,
    aiPulse.description,
    "Try: 'What's the sales today?' or 'How can we improve profit this week?'",
  ].join("\n");
};

const parseJsonFromText = (text) => {
  const raw = String(text || "").trim();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

export const parseAiPulseFromText = (text) => {
  const parsed = parseJsonFromText(text);
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const tone = String(parsed.tone || "").toLowerCase();
  const headline = String(parsed.headline || "").trim();
  const description = String(parsed.description || "").trim();

  if (!headline || !description) {
    return null;
  }

  const safeTone = ["emerald", "amber", "rose"].includes(tone) ? tone : "amber";

  return {
    tone: safeTone,
    headline,
    description,
  };
};
