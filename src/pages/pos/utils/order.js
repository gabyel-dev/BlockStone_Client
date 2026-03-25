// Adds an item to order list or increments quantity when already present.
export const addOrIncrementOrderItem = (orderItems, item) => {
  const existing = orderItems.find((entry) => entry.id === item.id);

  if (existing) {
    return {
      orderItems: orderItems.map((entry) =>
        entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry,
      ),
      wasIncremented: true,
    };
  }

  return {
    orderItems: [...orderItems, { ...item, qty: 1, customPrice: 0 }],
    wasIncremented: false,
  };
};

export const updateOrderItemQty = (orderItems, id, delta) =>
  orderItems
    .map((entry) =>
      entry.id === id
        ? { ...entry, qty: Math.max(0, entry.qty + delta) }
        : entry,
    )
    .filter((entry) => entry.qty > 0);

export const removeOrderItem = (orderItems, id) =>
  orderItems.filter((entry) => entry.id !== id);

export const updateOrderItemCustomPrice = (orderItems, id, value) => {
  const normalizedValue = Number.isFinite(value) ? Math.max(0, value) : 0;

  return orderItems.map((entry) =>
    entry.id === id ? { ...entry, customPrice: normalizedValue } : entry,
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
