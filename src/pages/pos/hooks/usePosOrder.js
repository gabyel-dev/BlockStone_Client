import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createTransaction } from "../../../api/print";
import { buildItemKey } from "../utils/catalog";
import {
  addOrIncrementOrderItem,
  buildNormalizedItems,
  calculateSubtotal,
  hasInvalidPriceOption,
  removeOrderItem,
  updateOrderItemCustomPrice,
  updateOrderItemQty,
} from "../utils/order";

export const usePosOrder = () => {
  const [customerName, setCustomerName] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [notice, setNotice] = useState("");
  const [activeItemKey, setActiveItemKey] = useState("");

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

  const updateQty = (id, delta) => {
    setOrderItems((prev) => updateOrderItemQty(prev, id, delta));
  };

  const removeItem = (id) => {
    setOrderItems((prev) => removeOrderItem(prev, id));
  };

  const updateCustomPrice = (id, value) => {
    setOrderItems((prev) => updateOrderItemCustomPrice(prev, id, value));
  };

  const subtotal = useMemo(() => calculateSubtotal(orderItems), [orderItems]);

  const submitOrder = async () => {
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
    }
  };

  return {
    customerName,
    setCustomerName,
    orderItems,
    notice,
    activeItemKey,
    addItem,
    updateQty,
    removeItem,
    updateCustomPrice,
    subtotal,
    submitOrder,
  };
};
