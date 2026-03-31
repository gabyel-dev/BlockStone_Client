const HEALTHY_TARGET_COUNT = 50;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const normalizeCount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.trunc(parsed));
};

export const getDerivedStatus = (count) => {
  if (count <= 0) {
    return "out";
  }

  if (count <= 10) {
    return "critical";
  }

  if (count <= 30) {
    return "watch";
  }

  return "healthy";
};

export const getPriority = (count) => {
  if (count <= 10) {
    return "critical";
  }

  if (count <= 30) {
    return "watch";
  }

  return "normal";
};

export const getTone = (status) => {
  if (status === "critical" || status === "out") {
    return "red";
  }

  if (status === "watch") {
    return "amber";
  }

  return "emerald";
};

export const getStockPercent = (count) => {
  return clamp(
    Math.round((normalizeCount(count) / HEALTHY_TARGET_COUNT) * 100),
    0,
    100,
  );
};

export const toLabel = (value) => {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) {
    return "Unknown";
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

export const enrichInventoryItem = (item = {}) => {
  const count = normalizeCount(item.inventory_count);
  const derivedStatus = getDerivedStatus(count);
  const status =
    String(item.status || "")
      .trim()
      .toLowerCase() || derivedStatus;
  const priority = getPriority(count);

  return {
    ...item,
    inventory_count: count,
    status,
    status_label: toLabel(status),
    priority,
    priority_label: toLabel(priority),
    stock_percent: getStockPercent(count),
    tone: getTone(status),
  };
};

export const normalizeInventoryList = (rows = []) => {
  return rows.map(enrichInventoryItem);
};

export const summarizeInventory = (rows = []) => {
  const items = normalizeInventoryList(rows);
  const totalItems = items.length;
  const criticalItems = items.filter(
    (item) => item.priority === "critical",
  ).length;
  const totalCount = items.reduce((sum, item) => sum + item.inventory_count, 0);
  const criticalPercentage = totalItems
    ? Math.round((criticalItems / totalItems) * 100)
    : 0;

  return {
    totalItems,
    criticalItems,
    totalCount,
    criticalPercentage,
  };
};

export const mapInventoryToRadar = (rows = [], limit = 4) => {
  const items = normalizeInventoryList(rows)
    .slice()
    .sort((a, b) => {
      if (a.stock_percent !== b.stock_percent) {
        return a.stock_percent - b.stock_percent;
      }

      return a.inventory_count - b.inventory_count;
    })
    .slice(0, limit);

  return items.map((item) => ({
    iid: item.iid,
    name: item.inventory_name,
    level: item.stock_percent,
    tone: item.tone,
    status: item.status_label,
  }));
};
