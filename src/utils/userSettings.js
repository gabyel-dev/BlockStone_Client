const SETTINGS_KEY_PREFIX = "blockstone.user.settings.v1";

const ALLOWED_REFRESH_MS = [10000, 20000, 30000, 60000];
const ALLOWED_DASHBOARD_REFRESH_MS = [10000, 15000, 30000, 60000];
const ALLOWED_DOCK_DEFAULT_PANEL = ["chat", "notifications"];

export const DEFAULT_USER_SETTINGS = {
  enableRealtimeNotifications: true,
  notificationRefreshMs: 20000,
  compactDensity: false,
  enableAmbientMotion: true,
  enablePageTransitions: true,
  highContrastMode: false,
  largeTouchTargets: false,
  dockDefaultPanel: "chat",
  autoOpenNotificationsOnCritical: false,
  dashboardRefreshMs: 15000,
  dashboardShowQuickActions: true,
  dashboardHighlightCriticalStock: true,
  dashboardEnableCardVisibility: true,
};

export const getUserSettingsStorageKey = (userId) =>
  `${SETTINGS_KEY_PREFIX}:${String(userId || "guest")}`;

const sanitizeRefreshMs = (value) => {
  const parsed = Number(value);
  if (ALLOWED_REFRESH_MS.includes(parsed)) {
    return parsed;
  }

  return DEFAULT_USER_SETTINGS.notificationRefreshMs;
};

const sanitizeDashboardRefreshMs = (value) => {
  const parsed = Number(value);
  if (ALLOWED_DASHBOARD_REFRESH_MS.includes(parsed)) {
    return parsed;
  }

  return DEFAULT_USER_SETTINGS.dashboardRefreshMs;
};

const sanitizeBoolean = (value, fallback) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
};

const sanitizeDockDefaultPanel = (value) => {
  const parsed = String(value || "").toLowerCase();
  if (ALLOWED_DOCK_DEFAULT_PANEL.includes(parsed)) {
    return parsed;
  }

  return DEFAULT_USER_SETTINGS.dockDefaultPanel;
};

export const readUserSettings = (userId) => {
  if (typeof window === "undefined") {
    return DEFAULT_USER_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(getUserSettingsStorageKey(userId));
    if (!raw) {
      return DEFAULT_USER_SETTINGS;
    }

    const parsed = JSON.parse(raw);

    return {
      enableRealtimeNotifications: sanitizeBoolean(
        parsed?.enableRealtimeNotifications,
        DEFAULT_USER_SETTINGS.enableRealtimeNotifications,
      ),
      notificationRefreshMs: sanitizeRefreshMs(parsed?.notificationRefreshMs),
      compactDensity: sanitizeBoolean(
        parsed?.compactDensity,
        DEFAULT_USER_SETTINGS.compactDensity,
      ),
      enableAmbientMotion: sanitizeBoolean(
        parsed?.enableAmbientMotion,
        DEFAULT_USER_SETTINGS.enableAmbientMotion,
      ),
      enablePageTransitions: sanitizeBoolean(
        parsed?.enablePageTransitions,
        DEFAULT_USER_SETTINGS.enablePageTransitions,
      ),
      highContrastMode: sanitizeBoolean(
        parsed?.highContrastMode,
        DEFAULT_USER_SETTINGS.highContrastMode,
      ),
      largeTouchTargets: sanitizeBoolean(
        parsed?.largeTouchTargets,
        DEFAULT_USER_SETTINGS.largeTouchTargets,
      ),
      dockDefaultPanel: sanitizeDockDefaultPanel(parsed?.dockDefaultPanel),
      autoOpenNotificationsOnCritical: sanitizeBoolean(
        parsed?.autoOpenNotificationsOnCritical,
        DEFAULT_USER_SETTINGS.autoOpenNotificationsOnCritical,
      ),
      dashboardRefreshMs: sanitizeDashboardRefreshMs(
        parsed?.dashboardRefreshMs,
      ),
      dashboardShowQuickActions: sanitizeBoolean(
        parsed?.dashboardShowQuickActions,
        DEFAULT_USER_SETTINGS.dashboardShowQuickActions,
      ),
      dashboardHighlightCriticalStock: sanitizeBoolean(
        parsed?.dashboardHighlightCriticalStock,
        DEFAULT_USER_SETTINGS.dashboardHighlightCriticalStock,
      ),
      dashboardEnableCardVisibility: sanitizeBoolean(
        parsed?.dashboardEnableCardVisibility,
        DEFAULT_USER_SETTINGS.dashboardEnableCardVisibility,
      ),
    };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
};

export const writeUserSettings = (userId, nextSettings) => {
  if (typeof window === "undefined") {
    return DEFAULT_USER_SETTINGS;
  }

  const safeSettings = {
    enableRealtimeNotifications: sanitizeBoolean(
      nextSettings?.enableRealtimeNotifications,
      DEFAULT_USER_SETTINGS.enableRealtimeNotifications,
    ),
    notificationRefreshMs: sanitizeRefreshMs(
      nextSettings?.notificationRefreshMs,
    ),
    compactDensity: sanitizeBoolean(
      nextSettings?.compactDensity,
      DEFAULT_USER_SETTINGS.compactDensity,
    ),
    enableAmbientMotion: sanitizeBoolean(
      nextSettings?.enableAmbientMotion,
      DEFAULT_USER_SETTINGS.enableAmbientMotion,
    ),
    enablePageTransitions: sanitizeBoolean(
      nextSettings?.enablePageTransitions,
      DEFAULT_USER_SETTINGS.enablePageTransitions,
    ),
    highContrastMode: sanitizeBoolean(
      nextSettings?.highContrastMode,
      DEFAULT_USER_SETTINGS.highContrastMode,
    ),
    largeTouchTargets: sanitizeBoolean(
      nextSettings?.largeTouchTargets,
      DEFAULT_USER_SETTINGS.largeTouchTargets,
    ),
    dockDefaultPanel: sanitizeDockDefaultPanel(nextSettings?.dockDefaultPanel),
    autoOpenNotificationsOnCritical: sanitizeBoolean(
      nextSettings?.autoOpenNotificationsOnCritical,
      DEFAULT_USER_SETTINGS.autoOpenNotificationsOnCritical,
    ),
    dashboardRefreshMs: sanitizeDashboardRefreshMs(
      nextSettings?.dashboardRefreshMs,
    ),
    dashboardShowQuickActions: sanitizeBoolean(
      nextSettings?.dashboardShowQuickActions,
      DEFAULT_USER_SETTINGS.dashboardShowQuickActions,
    ),
    dashboardHighlightCriticalStock: sanitizeBoolean(
      nextSettings?.dashboardHighlightCriticalStock,
      DEFAULT_USER_SETTINGS.dashboardHighlightCriticalStock,
    ),
    dashboardEnableCardVisibility: sanitizeBoolean(
      nextSettings?.dashboardEnableCardVisibility,
      DEFAULT_USER_SETTINGS.dashboardEnableCardVisibility,
    ),
  };

  window.localStorage.setItem(
    getUserSettingsStorageKey(userId),
    JSON.stringify(safeSettings),
  );

  window.dispatchEvent(
    new CustomEvent("app:settings-changed", {
      detail: {
        userId: String(userId || "guest"),
        settings: safeSettings,
      },
    }),
  );

  return safeSettings;
};

export const updateUserSettings = (userId, patch) => {
  const current = readUserSettings(userId);
  const merged = {
    ...current,
    ...patch,
  };

  return writeUserSettings(userId, merged);
};

export const USER_SETTINGS_REFRESH_OPTIONS = [
  { label: "10s", value: 10000 },
  { label: "20s", value: 20000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
];

export const USER_SETTINGS_DOCK_PANEL_OPTIONS = [
  { label: "Open Chat first", value: "chat" },
  { label: "Open Notifications first", value: "notifications" },
];

export const USER_SETTINGS_DASHBOARD_REFRESH_OPTIONS = [
  { label: "10s", value: 10000 },
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "60s", value: 60000 },
];

export const resetWorkspacePersonalization = (userId) => {
  if (typeof window === "undefined") {
    return;
  }

  const safeUserId = String(userId || "guest");
  const keys = [
    `blockstone.dashboard.layout.cards.v1:${safeUserId}`,
    `blockstone.dashboard.layout.shapes.v1:${safeUserId}`,
    `blockstone.pos.layout.panels.v1:${safeUserId}`,
    "blockstone.ai.assistant.dock-position.v1",
    "blockstone.ai.assistant.chat.v1",
  ];

  keys.forEach((key) => window.localStorage.removeItem(key));

  window.dispatchEvent(
    new CustomEvent("app:workspace-reset", {
      detail: {
        userId: safeUserId,
      },
    }),
  );
};
