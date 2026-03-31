import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventory,
  updateInventoryItem,
} from "../api/inventory";
import {
  mapInventoryToRadar,
  normalizeInventoryList,
  summarizeInventory,
} from "../utils/inventoryMetrics";

let inFlightLoadPromise = null;

export const useInventoryData = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const syncInventory = useCallback((rows) => {
    const normalized = normalizeInventoryList(rows);
    setInventory(normalized);
    return normalized;
  }, []);

  const loadInventory = useCallback(
    async ({ silent = false } = {}) => {
      if (inFlightLoadPromise) {
        return inFlightLoadPromise;
      }

      if (!silent) {
        setIsLoading(true);
      }

      inFlightLoadPromise = getInventory()
        .then((response) => {
          const rows = response?.data?.data?.inventory ?? [];
          const normalized = syncInventory(rows);
          setError("");
          return normalized;
        })
        .catch(() => {
          setError("Unable to load inventory. Please try again.");
          return [];
        })
        .finally(() => {
          inFlightLoadPromise = null;
          if (!silent) {
            setIsLoading(false);
          }
        });

      return inFlightLoadPromise;
    },
    [syncInventory],
  );

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const addInventoryItem = useCallback(
    async (payload) => {
      try {
        setIsSaving(true);
        await createInventoryItem(payload);
        const next = await loadInventory({ silent: true });
        setError("");
        return {
          success: true,
          data: next,
        };
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          "Unable to create inventory item";
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsSaving(false);
      }
    },
    [loadInventory],
  );

  const editInventoryItem = useCallback(
    async ({ iid, payload }) => {
      try {
        setIsSaving(true);
        await updateInventoryItem({ iid, payload });
        const next = await loadInventory({ silent: true });
        setError("");
        return {
          success: true,
          data: next,
        };
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          "Unable to update inventory item";
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsSaving(false);
      }
    },
    [loadInventory],
  );

  const removeInventoryItem = useCallback(
    async (iid) => {
      try {
        setIsSaving(true);
        await deleteInventoryItem(iid);

        const next = await loadInventory({ silent: true });
        setError("");
        return {
          success: true,
          data: next,
        };
      } catch (requestError) {
        const message =
          requestError?.response?.data?.message ||
          "Unable to delete inventory item";
        setError(message);
        return {
          success: false,
          message,
        };
      } finally {
        setIsSaving(false);
      }
    },
    [loadInventory],
  );

  const stockRadar = useMemo(() => mapInventoryToRadar(inventory), [inventory]);

  const metrics = useMemo(() => summarizeInventory(inventory), [inventory]);

  return {
    inventory,
    stockRadar,
    metrics,
    isLoading,
    isSaving,
    error,
    loadInventory,
    addInventoryItem,
    editInventoryItem,
    removeInventoryItem,
  };
};
