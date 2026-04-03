const getOrderLineKey = (entry) =>
  entry?.lineId || `${entry?.id}-${entry?.priceOptionId ?? entry?.name}`;

// Adds an item to order list or increments quantity when already present.
export const addOrIncrementOrderItem = (orderItems, item) => {
  const nextLineKey = getOrderLineKey(item);
  const existing = orderItems.find(
    (entry) => getOrderLineKey(entry) === nextLineKey,
  );

  if (existing) {
    return {
      orderItems: orderItems.map((entry) =>
        getOrderLineKey(entry) === nextLineKey
          ? { ...entry, qty: entry.qty + 1 }
          : entry,
      ),
      wasIncremented: true,
    };
  }

  return {
    orderItems: [
      ...orderItems,
      { ...item, lineId: nextLineKey, qty: 1, customPrice: 0 },
    ],
    wasIncremented: false,
  };
};

export const updateOrderItemQty = (orderItems, lineId, delta) =>
  orderItems
    .map((entry) =>
      getOrderLineKey(entry) === lineId
        ? { ...entry, qty: Math.max(0, entry.qty + delta) }
        : entry,
    )
    .filter((entry) => entry.qty > 0);

export const removeOrderItem = (orderItems, lineId) =>
  orderItems.filter((entry) => getOrderLineKey(entry) !== lineId);

export const updateOrderItemCustomPrice = (orderItems, lineId, value) => {
  const normalizedValue = Number.isFinite(value) ? Math.max(0, value) : 0;

  return orderItems.map((entry) =>
    getOrderLineKey(entry) === lineId
      ? { ...entry, customPrice: normalizedValue }
      : entry,
  );
};

export const calculateSubtotal = (orderItems) =>
  orderItems.reduce(
    (sum, entry) => sum + (entry.price + entry.customPrice) * entry.qty,
    0,
  );

export const buildNormalizedItems = (orderItems) =>
  orderItems.map((entry) => ({
    priceOptionId: entry.priceOptionId,
    quantity: entry.qty,
    subtotal: (entry.price + entry.customPrice) * entry.qty,
  }));

export const hasInvalidPriceOption = (items) =>
  items.some((item) => !item.priceOptionId);
