const DASHBOARD_LAYOUT_KEY_PREFIX = "blockstone.dashboard.layout.cards.v1";
const DASHBOARD_SHAPE_KEY_PREFIX = "blockstone.dashboard.layout.shapes.v1";
const DASHBOARD_HIDDEN_CARDS_KEY_PREFIX =
  "blockstone.dashboard.layout.hidden-cards.v1";

export const DASHBOARD_CARD_IDS = [
  "pulse",
  "agenda",
  "throughput",
  "revenue",
  "category",
  "stock",
];

export const DEFAULT_CARD_SHAPES = {
  pulse: "wide",
  agenda: "compact",
  throughput: "wide",
  revenue: "balanced",
  category: "wide",
  stock: "compact",
};

export const SHAPE_SEQUENCE = ["compact", "balanced", "wide", "full"];

export const SHAPE_SPAN_CLASS = {
  compact: "xl:col-span-4",
  balanced: "xl:col-span-6",
  wide: "xl:col-span-8",
  full: "xl:col-span-12",
};

export const SHAPE_LABEL = {
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

export const readCardOrder = (userId) => {
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

export const readCardShapes = (userId) => {
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

export const readHiddenCards = (userId) => {
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

export const writeCardOrder = (userId, cardOrder) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getLayoutStorageKey(userId),
    JSON.stringify(cardOrder),
  );
};

export const writeCardShapes = (userId, cardShapes) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getShapeStorageKey(userId),
    JSON.stringify(cardShapes),
  );
};

export const writeHiddenCards = (userId, hiddenCards) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getHiddenCardsStorageKey(userId),
    JSON.stringify(hiddenCards),
  );
};

export const getNextShape = (currentShape) => {
  const index = SHAPE_SEQUENCE.indexOf(currentShape);
  if (index < 0) {
    return SHAPE_SEQUENCE[0];
  }

  return SHAPE_SEQUENCE[(index + 1) % SHAPE_SEQUENCE.length];
};

export const moveInArray = (list, from, to) => {
  if (from < 0 || to < 0 || from === to) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
