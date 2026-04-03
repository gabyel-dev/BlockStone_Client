import { useEffect, useState } from "react";
import {
  FiBell,
  FiClock,
  FiLayers,
  FiRefreshCw,
  FiSliders,
  FiTarget,
  FiZap,
} from "react-icons/fi";
import { useLocation, useOutletContext } from "react-router-dom";
import {
  DEFAULT_USER_SETTINGS,
  readUserSettings,
  resetWorkspacePersonalization,
  updateUserSettings,
  USER_SETTINGS_DASHBOARD_REFRESH_OPTIONS,
  USER_SETTINGS_DOCK_PANEL_OPTIONS,
  USER_SETTINGS_REFRESH_OPTIONS,
} from "../utils/userSettings";

const SettingsPage = () => {
  const location = useLocation();
  const { user } = useOutletContext();
  const userId = user?.id || "guest";
  const activeMenu = location.state?.menu || "Settings";
  const [settings, setSettings] = useState(() => readUserSettings(userId));
  const [savedAt, setSavedAt] = useState(0);
  const [workspaceResetAt, setWorkspaceResetAt] = useState(0);

  useEffect(() => {
    setSettings(readUserSettings(userId));
  }, [userId]);

  const updateSetting = (patch) => {
    const next = updateUserSettings(userId, patch);
    setSettings(next);
    setSavedAt(Date.now());
  };

  const restoreDefaults = () => {
    const next = updateUserSettings(userId, DEFAULT_USER_SETTINGS);
    setSettings(next);
    setSavedAt(Date.now());
  };

  const resetPersonalization = () => {
    resetWorkspacePersonalization(userId);
    setWorkspaceResetAt(Date.now());
  };

  const isSavedVisible = savedAt && Date.now() - savedAt < 3000;
  const isResetVisible =
    workspaceResetAt && Date.now() - workspaceResetAt < 3000;

  return (
    <main className="min-h-screen bg-white p-4 text-slate-900 sm:p-6 lg:p-8">
      <h1 className="mb-1 text-3xl font-black tracking-tight text-slate-900">
        {activeMenu}
      </h1>
      <p className="text-sm text-slate-500">
        Configure notifications, accessibility, and dashboard interaction
        behavior.
      </p>

      {isSavedVisible ? (
        <p className="mt-2 inline-flex rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Settings saved
        </p>
      ) : null}

      {isResetVisible ? (
        <p className="mt-2 ml-2 inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
          Personalization reset
        </p>
      ) : null}

      <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          <FiBell size={13} /> Notification Controls
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiBell size={14} /> Realtime Notifications
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Poll live inventory and operational signals.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.enableRealtimeNotifications}
              onChange={(event) =>
                updateSetting({
                  enableRealtimeNotifications: event.target.checked,
                })
              }
            />
          </label>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiClock size={14} /> Notification Refresh Rate
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Faster refresh improves timeliness but increases requests.
              </p>
            </div>
            <select
              value={settings.notificationRefreshMs}
              onChange={(event) =>
                updateSetting({
                  notificationRefreshMs: Number(event.target.value),
                })
              }
              disabled={!settings.enableRealtimeNotifications}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {USER_SETTINGS_REFRESH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiSliders size={14} /> Assistant Dock Default View
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Choose which tab opens when launching the assistant.
              </p>
            </div>
            <select
              value={settings.dockDefaultPanel}
              onChange={(event) =>
                updateSetting({
                  dockDefaultPanel: String(event.target.value || "chat"),
                })
              }
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
            >
              {USER_SETTINGS_DOCK_PANEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 sm:col-span-2">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiZap size={14} /> Auto-open Notifications on Critical Alert
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Automatically opens notifications if a new critical stock alert
                appears.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.autoOpenNotificationsOnCritical}
              onChange={(event) =>
                updateSetting({
                  autoOpenNotificationsOnCritical: event.target.checked,
                })
              }
            />
          </label>
        </div>

        <h2 className="mt-6 mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          <FiLayers size={13} /> Workspace Experience
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiLayers size={14} /> Compact Density
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use tighter typography and spacing in the workspace.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.compactDensity}
              onChange={(event) =>
                updateSetting({ compactDensity: event.target.checked })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiZap size={14} /> Ambient Motion Effects
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Enable subtle floating effects in workspace background.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.enableAmbientMotion}
              onChange={(event) =>
                updateSetting({ enableAmbientMotion: event.target.checked })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiRefreshCw size={14} /> Route Transition Animation
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Animate page transitions when switching routes.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.enablePageTransitions}
              onChange={(event) =>
                updateSetting({ enablePageTransitions: event.target.checked })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiSliders size={14} /> High Contrast Mode
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Improve readability with stronger text and UI contrast.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.highContrastMode}
              onChange={(event) =>
                updateSetting({ highContrastMode: event.target.checked })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 sm:col-span-2">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiLayers size={14} /> Large Touch Targets
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Increase clickable sizes for buttons, tabs, and inputs.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.largeTouchTargets}
              onChange={(event) =>
                updateSetting({ largeTouchTargets: event.target.checked })
              }
            />
          </label>
        </div>

        <h2 className="mt-6 mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          <FiTarget size={13} /> Dashboard Interactivity
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiClock size={14} /> Dashboard Auto Refresh
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Controls how often dashboard data refreshes automatically.
              </p>
            </div>
            <select
              value={settings.dashboardRefreshMs}
              onChange={(event) =>
                updateSetting({
                  dashboardRefreshMs: Number(event.target.value),
                })
              }
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
            >
              {USER_SETTINGS_DASHBOARD_REFRESH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiZap size={14} /> Show Quick Action Toolbar
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Display one-click actions for refresh, focus, and layout
                controls.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.dashboardShowQuickActions}
              onChange={(event) =>
                updateSetting({
                  dashboardShowQuickActions: event.target.checked,
                })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiTarget size={14} /> Highlight Critical Stock Card
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Emphasize Stock Radar when critical inventory exists.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.dashboardHighlightCriticalStock}
              onChange={(event) =>
                updateSetting({
                  dashboardHighlightCriticalStock: event.target.checked,
                })
              }
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                <FiSliders size={14} /> Card Visibility Toggles
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Enable per-card show or hide controls on dashboard.
              </p>
            </div>
            <input
              type="checkbox"
              className="mt-1"
              checked={settings.dashboardEnableCardVisibility}
              onChange={(event) =>
                updateSetting({
                  dashboardEnableCardVisibility: event.target.checked,
                })
              }
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Active profile: {user?.first_name || "User"} {user?.last_name || ""}
          <br />
          Default notification refresh:{" "}
          {DEFAULT_USER_SETTINGS.notificationRefreshMs / 1000}s
          <br />
          Default dashboard refresh:{" "}
          {DEFAULT_USER_SETTINGS.dashboardRefreshMs / 1000}s
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restoreDefaults}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
          >
            <FiRefreshCw size={13} /> Restore default settings
          </button>

          <button
            type="button"
            onClick={resetPersonalization}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:border-cyan-400"
          >
            <FiSliders size={13} /> Reset layout and dock memory
          </button>
        </div>
      </section>
    </main>
  );
};

export default SettingsPage;
