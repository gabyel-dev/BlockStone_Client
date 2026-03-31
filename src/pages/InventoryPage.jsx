import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useInventoryData } from "../hooks/useInventoryData";

const emptyForm = {
  inventory_key: "",
  inventory_name: "",
  inventory_description: "",
  inventory_category: "",
  inventory_count: "",
  status: "auto",
};

const inventoryKeyOptions = [
  {
    value: "paper_short",
    label: "Paper Short",
    category: "paper",
    defaultName: "Paper Short",
  },
  {
    value: "paper_a4",
    label: "Paper A4",
    category: "paper",
    defaultName: "Paper A4",
  },
  {
    value: "paper_long",
    label: "Paper Long",
    category: "paper",
    defaultName: "Paper Long",
  },
  {
    value: "laminating_film_a4",
    label: "Laminating Film A4",
    category: "laminating_film",
    defaultName: "Laminating Film A4",
  },
  {
    value: "laminating_film_id",
    label: "Laminating Film ID",
    category: "laminating_film",
    defaultName: "Laminating Film ID",
  },
];

const inventoryKeyMeta = inventoryKeyOptions.reduce((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {});

const priorityClass = {
  critical: "bg-red-100 text-red-700",
  watch: "bg-amber-100 text-amber-700",
  normal: "bg-emerald-100 text-emerald-700",
};

const statusOptions = ["auto", "healthy", "watch", "critical", "out"];

const normalizePayload = (form) => {
  const keyMeta = inventoryKeyMeta[form.inventory_key] || null;

  return {
    inventory_key: form.inventory_key,
    inventory_name: form.inventory_name.trim(),
    inventory_description: form.inventory_description.trim(),
    inventory_category: keyMeta?.category || form.inventory_category.trim(),
    inventory_count: Number(form.inventory_count || 0),
    status: form.status === "auto" ? "" : form.status,
  };
};

const InventoryPage = () => {
  const location = useLocation();
  const activeMenu = location.state?.menu || "Inventory";
  const {
    inventory,
    metrics,
    isLoading,
    isSaving,
    error,
    addInventoryItem,
    editInventoryItem,
    removeInventoryItem,
  } = useInventoryData();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const sortedInventory = useMemo(() => {
    return inventory
      .slice()
      .sort((a, b) => a.inventory_count - b.inventory_count);
  }, [inventory]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
  };

  const onFieldChange = (field, value) => {
    if (field === "inventory_key") {
      const keyMeta = inventoryKeyMeta[value] || null;

      setForm((prev) => ({
        ...prev,
        inventory_key: value,
        inventory_name: keyMeta?.defaultName || prev.inventory_name,
        inventory_category: keyMeta?.category || prev.inventory_category,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = normalizePayload(form);

    if (!payload.inventory_key) {
      setFormError("Select a stock key before saving.");
      return;
    }

    if (!payload.inventory_name || !payload.inventory_category) {
      setFormError("Name and mapped category are required.");
      return;
    }

    if (
      !Number.isInteger(payload.inventory_count) ||
      payload.inventory_count < 0
    ) {
      setFormError("Count must be a whole number greater than or equal to 0.");
      return;
    }

    const result = editingId
      ? await editInventoryItem({ iid: editingId, payload })
      : await addInventoryItem(payload);

    if (!result.success) {
      setFormError(result.message || "Unable to save inventory item.");
      return;
    }

    resetForm();
  };

  const onEdit = (item) => {
    setEditingId(item.iid);
    setForm({
      inventory_key: item.inventory_key || "",
      inventory_name: item.inventory_name || "",
      inventory_description: item.inventory_description || "",
      inventory_category: item.inventory_category || "",
      inventory_count: String(item.inventory_count ?? ""),
      status: item.status || "auto",
    });
    setFormError("");
  };

  const onDelete = async (iid) => {
    const shouldDelete = window.confirm("Delete this inventory item?");
    if (!shouldDelete) {
      return;
    }

    const result = await removeInventoryItem(iid);
    if (!result.success) {
      setFormError(result.message || "Unable to delete inventory item.");
    }

    if (editingId === iid) {
      resetForm();
    }
  };

  return (
    <main className="min-h-screen bg-white p-4 text-slate-900 sm:p-6 lg:p-8">
      <h1 className="mb-1 text-3xl font-black tracking-tight text-slate-900">
        {activeMenu}
      </h1>

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
        <h2 className="text-lg font-black text-slate-900">
          {editingId ? "Edit Inventory Item" : "Add Inventory Item"}
        </h2>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={form.inventory_key}
              onChange={(event) =>
                onFieldChange("inventory_key", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
            >
              <option value="">Select stock key</option>
              {inventoryKeyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Inventory name"
              value={form.inventory_name}
              onChange={(event) =>
                onFieldChange("inventory_name", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
            />
            <input
              type="text"
              placeholder="Category (auto)"
              value={form.inventory_category}
              readOnly
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min={0}
              placeholder="Count"
              value={form.inventory_count}
              onChange={(event) =>
                onFieldChange("inventory_count", event.target.value)
              }
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
            />
            <select
              value={form.status}
              onChange={(event) => onFieldChange("status", event.target.value)}
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
          </div>

          <textarea
            rows={3}
            placeholder="Description"
            value={form.inventory_description}
            onChange={(event) =>
              onFieldChange("inventory_description", event.target.value)
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-slate-200 focus:ring"
          />

          {formError || error ? (
            <p className="text-sm font-semibold text-rose-600">
              {formError || error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-black text-slate-900">Inventory List</h2>

        {isLoading ? (
          <p className="mt-3 text-sm text-slate-500">Loading inventory...</p>
        ) : null}

        {!isLoading && sortedInventory.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No inventory items yet.</p>
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
                        onClick={() => onEdit(item)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item.iid)}
                        className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default InventoryPage;
