import { useLocation } from "react-router-dom";

const settingGroups = [
  {
    id: "stock-alert",
    label: "Auto-alert on low stock",
    description: "Send internal warning when stock drops below threshold.",
  },
  {
    id: "price-approval",
    label: "Require approval before service price update",
    description: "Enforce supervisor approval for service pricing edits.",
  },
  {
    id: "profit-preview",
    label: "Show profit estimate on services tab",
    description: "Display estimated margin beside each service option.",
  },
  {
    id: "shift-lock",
    label: "Lock inventory edits during active shift",
    description:
      "Prevent stock edits while active production shift is running.",
  },
];

const SettingsPage = () => {
  const location = useLocation();
  const activeMenu = location.state?.menu || "Settings";

  return (
    <main className="min-h-screen bg-white p-4 text-slate-900 sm:p-6 lg:p-8">
      <h1 className="mb-1 text-3xl font-black tracking-tight text-slate-900">
        {activeMenu}
      </h1>
      <p className="text-sm text-slate-500">
        Placeholder features only. No functionality is wired yet.
      </p>

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {settingGroups.map((group) => (
            <label
              key={group.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {group.label}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {group.description}
                </p>
              </div>
              <input type="checkbox" disabled className="mt-1" />
            </label>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;
