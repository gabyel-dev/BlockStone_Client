import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getServiceCatalog, updateServicePricing } from "../api/print";
import { useAuth } from "../context/authContext";
import { useInventoryData } from "../hooks/useInventoryData";

const priorityClass = {
  critical: "bg-red-100 text-red-700",
  watch: "bg-amber-100 text-amber-700",
  normal: "bg-emerald-100 text-emerald-700",
};

const statusOptions = ["auto", "healthy", "watch", "critical", "out"];

const getInventoryViewFromState = (inventoryView) => {
  const normalized = String(inventoryView || "Stocks").toLowerCase();
  return normalized === "services" ? "Services" : "Stocks";
};

const flattenServiceRows = (categories = []) => {
  const rows = [];

  for (const category of categories ?? []) {
    for (const service of category.services ?? []) {
      for (const option of service.options ?? []) {
        rows.push({
          category_name: category.category_name,
          service_id: service.service_id,
          service_name: service.service_name,
          description: service.description,
          is_active: service.is_active,
          price_option_id: option.price_option_id,
          option_name: option.option_name,
          unit: option.unit,
          price: Number(option.price ?? 0),
          cost_of_good: Number(option.cost_of_good ?? 0),
        });
      }
    }
  }

  return rows;
};

const ServiceDetailModal = ({
  row,
  isAdmin,
  isSaving,
  onClose,
  onSave,
  error,
}) => {
  const [price, setPrice] = useState(() => String(row?.price ?? 0));
  const [costOfGood, setCostOfGood] = useState(() =>
    String(row?.cost_of_good ?? 0),
  );

  if (!row) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    await onSave({
      price_option_id: row.price_option_id,
      price,
      cost_of_good: costOfGood,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Service Detail
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-900">
              {row.service_name}
            </h3>
            <p className="text-sm text-slate-500">
              {row.category_name} • {row.option_name} • {row.unit}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          {row.description || "No description"}
        </p>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-slate-700">Price</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                disabled={!isAdmin}
                onChange={(event) => setPrice(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring disabled:bg-slate-100"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-slate-700">
                Cost of goods
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costOfGood}
                disabled={!isAdmin}
                onChange={(event) => setCostOfGood(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring disabled:bg-slate-100"
              />
            </label>
          </div>

          {error ? (
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isAdmin || isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StockEditModal = ({ item, isSaving, onClose, onSave, error }) => {
  const [count, setCount] = useState(() => String(item?.inventory_count ?? 0));
  const [status, setStatus] = useState(() => String(item?.status || "auto"));

  if (!item) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();
    await onSave({
      iid: item.iid,
      inventory_count: count,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Edit Stock
            </p>
            <h3 className="mt-1 text-xl font-black text-slate-900">
              {item.inventory_name}
            </h3>
            <p className="text-sm text-slate-500">
              {item.inventory_key || "no-key"} • {item.inventory_category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-slate-700">Stock Count</span>
            <input
              type="number"
              min={0}
              value={count}
              onChange={(event) => setCount(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-semibold text-slate-700">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "auto"
                    ? "Auto status from count"
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const location = useLocation();
  const activeMenu = location.state?.menu || "Inventory";
  const activeInventoryView = getInventoryViewFromState(
    location.state?.inventoryView,
  );
  const { authUser } = useAuth();
  const isAdmin = authUser?.role === "admin";

  const { inventory, metrics, isLoading, isSaving, error, editInventoryItem } =
    useInventoryData();

  const [stockModalItem, setStockModalItem] = useState(null);
  const [stockEditError, setStockEditError] = useState("");

  const [serviceRows, setServiceRows] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState("");
  const [serviceSaving, setServiceSaving] = useState(false);
  const [selectedServiceRow, setSelectedServiceRow] = useState(null);

  const sortedInventory = useMemo(() => {
    return inventory
      .slice()
      .sort((a, b) => a.inventory_count - b.inventory_count);
  }, [inventory]);

  const loadServiceCatalog = async () => {
    setServiceLoading(true);
    setServiceError("");

    try {
      const response = await getServiceCatalog();
      const categories = response?.data?.data?.categories ?? [];
      setServiceRows(flattenServiceRows(categories));
    } catch {
      setServiceError("Unable to load services. Please try again.");
      setServiceRows([]);
    } finally {
      setServiceLoading(false);
    }
  };

  useEffect(() => {
    if (activeInventoryView === "Services") {
      loadServiceCatalog();
    }
  }, [activeInventoryView]);

  const openStockEditModal = (item) => {
    setStockEditError("");
    setStockModalItem(item);
  };

  const closeStockEditModal = () => {
    setStockEditError("");
    setStockModalItem(null);
  };

  const saveStockItem = async ({ iid, inventory_count, status }) => {
    const parsedCount = Number(inventory_count);

    if (!Number.isInteger(parsedCount) || parsedCount < 0) {
      setStockEditError(
        "Count must be a whole number greater than or equal to 0.",
      );
      return false;
    }

    const currentItem = inventory.find((item) => item.iid === iid);
    if (!currentItem) {
      setStockEditError("Inventory item not found.");
      return false;
    }

    const payload = {
      inventory_key: currentItem.inventory_key,
      inventory_name: currentItem.inventory_name,
      inventory_description: currentItem.inventory_description || "",
      inventory_category: currentItem.inventory_category,
      inventory_count: parsedCount,
      status: status === "auto" ? "" : status,
    };

    const result = await editInventoryItem({ iid, payload });
    if (!result.success) {
      setStockEditError(result.message || "Unable to update stock.");
      return false;
    }

    setStockEditError("");
    return true;
  };

  const saveServiceRow = async ({ price_option_id, price, cost_of_good }) => {
    const parsedPrice = Number(price);
    const parsedCost = Number(cost_of_good);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setServiceError("Price must be a non-negative number.");
      return false;
    }

    if (!Number.isFinite(parsedCost) || parsedCost < 0) {
      setServiceError("Cost of goods must be a non-negative number.");
      return false;
    }

    setServiceSaving(true);
    setServiceError("");

    try {
      await updateServicePricing({
        priceOptionId: price_option_id,
        payload: {
          price: parsedPrice,
          cost_of_good: parsedCost,
        },
      });

      setServiceRows((prev) =>
        prev.map((row) =>
          row.price_option_id === price_option_id
            ? {
                ...row,
                price: parsedPrice,
                cost_of_good: parsedCost,
              }
            : row,
        ),
      );

      setSelectedServiceRow((prev) =>
        prev && prev.price_option_id === price_option_id
          ? {
              ...prev,
              price: parsedPrice,
              cost_of_good: parsedCost,
            }
          : prev,
      );

      return true;
    } catch (requestError) {
      setServiceError(
        requestError?.response?.data?.message ||
          "Unable to update service pricing.",
      );
      return false;
    } finally {
      setServiceSaving(false);
    }
  };

  const renderStocks = () => {
    return (
      <>
        <section className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Total Items
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {metrics.totalItems}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Critical Priority
            </p>
            <p className="mt-2 text-2xl font-black text-red-600">
              {metrics.criticalItems}
            </p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Critical Percentage
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {metrics.criticalPercentage}%
            </p>
          </article>
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-lg font-black text-slate-900">Inventory List</h2>

          {error ? (
            <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p>
          ) : null}

          {isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading inventory...</p>
          ) : null}

          {!isLoading && sortedInventory.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No inventory items yet.
            </p>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Stock Key</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Count</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Priority</th>
                  <th className="px-2 py-2">Stock %</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedInventory.map((item) => (
                  <tr
                    key={item.iid}
                    className="border-b border-slate-100 align-top"
                  >
                    <td className="px-2 py-3">
                      <p className="font-semibold text-slate-900">
                        {item.inventory_name}
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-slate-500">
                        {item.inventory_description || "No description"}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {item.inventory_key || "-"}
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {item.inventory_category}
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {item.inventory_count}
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {item.status_label}
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-[0.12em] ${priorityClass[item.priority] || "bg-slate-100 text-slate-700"}`}
                      >
                        {item.priority_label}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {item.stock_percent}%
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openStockEditModal(item)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  };

  const renderServices = () => {
    return (
      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black text-slate-900">Services List</h2>
          {!isAdmin ? (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-600">
              Read only: admin only can edit pricing
            </p>
          ) : null}
        </div>

        {serviceError ? (
          <p className="mt-3 text-sm font-semibold text-rose-600">
            {serviceError}
          </p>
        ) : null}

        {serviceLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading services...</p>
        ) : null}

        {!serviceLoading && serviceRows.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No service options found.
          </p>
        ) : null}

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Service</th>
                <th className="px-2 py-2">Option</th>
                <th className="px-2 py-2">Price</th>
                <th className="px-2 py-2">Cost of Goods</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {serviceRows.map((row) => (
                <tr
                  key={row.price_option_id}
                  className="border-b border-slate-100"
                >
                  <td className="px-2 py-3 text-slate-700">
                    {row.category_name}
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    {row.service_name}
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    {row.option_name}
                  </td>
                  <td className="px-2 py-3 font-semibold text-slate-900">
                    PHP {Number(row.price).toFixed(2)}
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    PHP {Number(row.cost_of_good).toFixed(2)}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => setSelectedServiceRow(row)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        disabled={!isAdmin || serviceSaving}
                        onClick={() =>
                          saveServiceRow({
                            price_option_id: row.price_option_id,
                            price: row.price,
                            cost_of_good: row.cost_of_good,
                          })
                        }
                        className="rounded-lg border border-emerald-300 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Update Fixed COG
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-white p-4 text-slate-900 sm:p-6 lg:p-8">
      <h1 className="mb-1 text-3xl font-black tracking-tight text-slate-900">
        {activeMenu}
      </h1>

      {activeInventoryView === "Services" ? renderServices() : renderStocks()}

      <ServiceDetailModal
        key={selectedServiceRow?.price_option_id || "none"}
        row={selectedServiceRow}
        isAdmin={isAdmin}
        isSaving={serviceSaving}
        error={serviceError}
        onClose={() => setSelectedServiceRow(null)}
        onSave={async ({ price_option_id, price, cost_of_good }) => {
          const success = await saveServiceRow({
            price_option_id,
            price,
            cost_of_good,
          });

          if (success) {
            setSelectedServiceRow(null);
          }
        }}
      />

      <StockEditModal
        key={stockModalItem?.iid || "none"}
        item={stockModalItem}
        isSaving={isSaving}
        error={stockEditError}
        onClose={closeStockEditModal}
        onSave={async ({ iid, inventory_count, status }) => {
          const success = await saveStockItem({
            iid,
            inventory_count,
            status,
          });

          if (success) {
            closeStockEditModal();
          }
        }}
      />
    </main>
  );
};

export default InventoryPage;
