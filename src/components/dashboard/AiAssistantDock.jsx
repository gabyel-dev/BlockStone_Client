import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiCpu,
  FiLoader,
  FiMove,
  FiSend,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { askAiAssistant } from "../../api/ai";
import { getDashboard } from "../../api/auth";
import { getTodayDateValue } from "../../utils/timezoneDate";
import { readUserSettings } from "../../utils/userSettings";
import {
  createAssistantReply,
  getAssistantRecommendations,
} from "../../utils/dashboardAssistant";

const CHAT_STORAGE_KEY = "blockstone.ai.assistant.chat.v1";
const DOCK_POSITION_STORAGE_KEY = "blockstone.ai.assistant.dock-position.v1";
const ONE_HOUR_MS = 60 * 60 * 1000;
const DOCK_MARGIN = 12;
const DEFAULT_DOCK_SIZE = {
  width: 120,
  height: 108,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getViewport = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
});

const getDefaultDockPosition = () => {
  if (typeof window === "undefined") {
    return { x: DOCK_MARGIN, y: DOCK_MARGIN };
  }

  const viewport = getViewport();

  return {
    x: viewport.width - DEFAULT_DOCK_SIZE.width - 24,
    y: viewport.height - DEFAULT_DOCK_SIZE.height - 24,
  };
};

const readDockPosition = () => {
  if (typeof window === "undefined") {
    return getDefaultDockPosition();
  }

  try {
    const raw = window.localStorage.getItem(DOCK_POSITION_STORAGE_KEY);
    if (!raw) {
      return getDefaultDockPosition();
    }

    const parsed = JSON.parse(raw);
    const x = Number(parsed?.x);
    const y = Number(parsed?.y);

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return getDefaultDockPosition();
    }

    return { x, y };
  } catch {
    return getDefaultDockPosition();
  }
};

const getDockSize = (dockButtonRef) => ({
  width: dockButtonRef.current?.offsetWidth || DEFAULT_DOCK_SIZE.width,
  height: dockButtonRef.current?.offsetHeight || DEFAULT_DOCK_SIZE.height,
});

const clampDockPosition = (position, size, viewport) => ({
  x: clamp(
    position.x,
    DOCK_MARGIN,
    Math.max(DOCK_MARGIN, viewport.width - size.width - DOCK_MARGIN),
  ),
  y: clamp(
    position.y,
    DOCK_MARGIN,
    Math.max(DOCK_MARGIN, viewport.height - size.height - DOCK_MARGIN),
  ),
});

const snapDockPositionToNearestBorder = (position, size, viewport) => {
  const clamped = clampDockPosition(position, size, viewport);

  const distances = {
    left: clamped.x,
    right: viewport.width - size.width - clamped.x,
    top: clamped.y,
    bottom: viewport.height - size.height - clamped.y,
  };

  const nearestBorder = Object.entries(distances).sort(
    (left, right) => left[1] - right[1],
  )[0]?.[0];

  if (nearestBorder === "left") {
    return {
      x: DOCK_MARGIN,
      y: clamped.y,
    };
  }

  if (nearestBorder === "right") {
    return {
      x: Math.max(DOCK_MARGIN, viewport.width - size.width - DOCK_MARGIN),
      y: clamped.y,
    };
  }

  if (nearestBorder === "top") {
    return {
      x: clamped.x,
      y: DOCK_MARGIN,
    };
  }

  return {
    x: clamped.x,
    y: Math.max(DOCK_MARGIN, viewport.height - size.height - DOCK_MARGIN),
  };
};

const readCachedMessages = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    const expiresAt = Number(parsed?.expiresAt ?? 0);
    const now = Date.now();

    if (!expiresAt || expiresAt < now) {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
      return [];
    }

    return Array.isArray(parsed?.messages) ? parsed.messages : [];
  } catch {
    return [];
  }
};

const saveMessages = (messages) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload = {
    messages,
    expiresAt: Date.now() + ONE_HOUR_MS,
  };

  window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
};

const makeMessage = ({ role, content }) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  content,
  createdAt: Date.now(),
});

const isTodaySalesQuestion = (text) =>
  /sales\s*today|today\s*sales|revenue\s*today/i.test(String(text || ""));

const extractResponseMessage = (payload) => {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  return (
    payload?.message ||
    payload?.data?.message ||
    payload?.response ||
    payload?.content ||
    payload?.choices?.[0]?.message?.content ||
    ""
  );
};

const renderHighlightedText = (text, keyPrefix) => {
  const value = String(text || "");
  const matches = [
    ...value.matchAll(
      /(\d+(?:\.\d+)?%|\b(?:critical|urgent|warning|risk|profit|loss|revenue|sales|stock|increase|decrease|today)\b)/gi,
    ),
  ];

  if (matches.length === 0) {
    return value;
  }

  const nodes = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    const start = Number(match.index || 0);
    const end = start + match[0].length;

    if (start > cursor) {
      nodes.push(value.slice(cursor, start));
    }

    nodes.push(
      <span
        key={`${keyPrefix}-highlight-${index}`}
        className="rounded bg-amber-100 px-1 font-semibold text-amber-800"
      >
        {match[0]}
      </span>,
    );

    cursor = end;
  });

  if (cursor < value.length) {
    nodes.push(value.slice(cursor));
  }

  return nodes;
};

const renderAssistantInline = (text, keyPrefix) => {
  const value = String(text || "");
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = value.split(pattern).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-part-${index}`;

    if (/^\*\*[^*]+\*\*$/.test(part)) {
      const content = part.slice(2, -2);
      return (
        <strong key={key} className="font-bold text-slate-900">
          {renderHighlightedText(content, `${key}-bold`)}
        </strong>
      );
    }

    if (/^\*[^*]+\*$/.test(part)) {
      const content = part.slice(1, -1);
      return (
        <em key={key} className="italic text-slate-700">
          {renderHighlightedText(content, `${key}-italic`)}
        </em>
      );
    }

    return <span key={key}>{renderHighlightedText(part, `${key}-plain`)}</span>;
  });
};

const renderAssistantMessage = (content, keyPrefix) => {
  const lines = String(content || "").split("\n");

  return lines.map((line, index) => (
    <p
      key={`${keyPrefix}-line-${index}`}
      className={index > 0 ? "mt-1" : undefined}
    >
      {renderAssistantInline(line, `${keyPrefix}-line-${index}`)}
    </p>
  ));
};

const formatElapsed = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const mm = Math.floor(safeSeconds / 60);
  const ss = safeSeconds % 60;

  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
};

const AiAssistantDock = ({ context, aiPulse, user }) => {
  const userId = user?.id || "guest";
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("chat");
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [responseElapsedSec, setResponseElapsedSec] = useState(0);
  const [dockPosition, setDockPosition] = useState(() => readDockPosition());
  const [isDraggingDock, setIsDraggingDock] = useState(false);
  const [dockSettings, setDockSettings] = useState(() =>
    readUserSettings(userId),
  );
  const [fallbackContext, setFallbackContext] = useState(() => ({
    summary: {},
    stockRadar: [],
  }));
  const [messages, setMessages] = useState(() => {
    const cached = readCachedMessages();
    if (cached.length > 0) {
      return cached;
    }

    return [
      makeMessage({
        role: "assistant",
        content:
          "AI Assistant is online. I can analyze sales, stock risk, system health, and recommendations from live dashboard data. Chat history auto-expires after 1 hour.",
      }),
    ];
  });

  const latestTodaySalesRef = useRef(null);
  const latestTodaySalesAtRef = useRef(0);
  const lastNotificationBadgeCountRef = useRef(0);
  const scrollContainerRef = useRef(null);
  const dockButtonRef = useRef(null);
  const dockDragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    isPointerDown: false,
    moved: false,
  });
  const preventToggleAfterDragRef = useRef(false);
  const hasLiveContext = useMemo(() => {
    if (!context || typeof context !== "object") {
      return false;
    }

    const hasSummary =
      context.summary && Object.keys(context.summary || {}).length > 0;
    const hasRadar =
      Array.isArray(context.stockRadar) && context.stockRadar.length > 0;

    return hasSummary || hasRadar;
  }, [context]);
  const resolvedContext = hasLiveContext ? context : fallbackContext;
  const safeAiPulse =
    aiPulse && aiPulse.headline && aiPulse.description
      ? aiPulse
      : {
          tone: "amber",
          headline: "AI pulse is warming up.",
          description: "Open Dashboard for richer live operational signals.",
        };
  const recommendations = useMemo(() => {
    const items = getAssistantRecommendations();
    return items.slice(0, Math.max(0, items.length - 2));
  }, []);

  const notifications = useMemo(() => {
    const rows = [];
    const stockRows = Array.isArray(resolvedContext?.stockRadar)
      ? resolvedContext.stockRadar
      : [];
    const criticalRows = stockRows.filter((item) => {
      const level = Number(item?.level ?? 100);
      const tone = String(item?.tone || "").toLowerCase();
      return tone === "red" || tone === "amber" || level <= 30;
    });

    if (criticalRows.length > 0) {
      rows.push({
        id: "stock-critical",
        tone: "warning",
        icon: FiAlertTriangle,
        title: `${criticalRows.length} stock alert(s)`,
        description: criticalRows
          .slice(0, 2)
          .map((item) => `${item.name}: ${item.level}%`)
          .join(" • "),
      });
    }

    const totalOrders = Number(resolvedContext?.summary?.totalOrders ?? 0);
    rows.push({
      id: "orders-today",
      tone: "info",
      icon: FiClock,
      title: `${totalOrders} orders in current view`,
      description: "Synced from dashboard summary data.",
    });

    if (safeAiPulse?.headline) {
      rows.push({
        id: "ai-pulse",
        tone: "success",
        icon: FiCheckCircle,
        title: "AI Pulse",
        description: String(safeAiPulse.headline),
      });
    }

    if (rows.length === 0) {
      rows.push({
        id: "all-clear",
        tone: "success",
        icon: FiCheckCircle,
        title: "All clear",
        description: "No alerts at this time.",
      });
    }

    return rows;
  }, [resolvedContext, safeAiPulse]);

  const notificationBadgeCount = useMemo(
    () =>
      notifications.filter((item) =>
        ["warning", "danger"].includes(String(item.tone || "")),
      ).length,
    [notifications],
  );

  useEffect(() => {
    setDockSettings(readUserSettings(userId));
  }, [userId]);

  useEffect(() => {
    const handleSettingsChanged = (event) => {
      const changedUserId = String(event?.detail?.userId || "guest");
      if (changedUserId !== String(userId)) {
        return;
      }

      setDockSettings(event?.detail?.settings || readUserSettings(userId));
    };

    const handleStorage = () => {
      setDockSettings(readUserSettings(userId));
    };

    window.addEventListener("app:settings-changed", handleSettingsChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("app:settings-changed", handleSettingsChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [userId]);

  useEffect(() => {
    const previousCount = Number(lastNotificationBadgeCountRef.current || 0);
    const currentCount = Number(notificationBadgeCount || 0);

    if (
      Boolean(dockSettings.autoOpenNotificationsOnCritical) &&
      currentCount > previousCount
    ) {
      setActivePanel("notifications");
      setIsOpen(true);
    }

    lastNotificationBadgeCountRef.current = currentCount;
  }, [notificationBadgeCount, dockSettings.autoOpenNotificationsOnCritical]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DOCK_POSITION_STORAGE_KEY,
      JSON.stringify(dockPosition),
    );
  }, [dockPosition]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      const viewport = getViewport();
      const size = getDockSize(dockButtonRef);

      setDockPosition((current) => clampDockPosition(current, size, viewport));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (hasLiveContext) {
      return;
    }

    let isMounted = true;

    const loadFallbackContext = async () => {
      try {
        const todayDate = getTodayDateValue();
        const response = await getDashboard({
          period: "daily",
          date: todayDate,
        });

        if (!isMounted) {
          return;
        }

        const payload = response?.data?.data ?? {};

        setFallbackContext({
          summary: payload.summary ?? {},
          stockRadar: Array.isArray(payload.stockRadar)
            ? payload.stockRadar
            : [],
        });
      } catch {
        if (!isMounted) {
          return;
        }

        setFallbackContext((current) => current);
      }
    };

    loadFallbackContext();
    const timer = window.setInterval(loadFallbackContext, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [hasLiveContext]);

  useEffect(() => {
    if (!isThinking) {
      setResponseElapsedSec(0);
      return;
    }

    const startedAt = Date.now();
    setResponseElapsedSec(0);

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setResponseElapsedSec(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [isThinking]);

  const handleDockOpen = (panel) => {
    if (preventToggleAfterDragRef.current) {
      preventToggleAfterDragRef.current = false;
      return;
    }

    setActivePanel(panel);
    setIsOpen(true);
  };

  const handleDockPointerDown = (event) => {
    if (event.pointerType !== "touch" && event.button !== 0) {
      return;
    }

    event.preventDefault();

    dockDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: dockPosition.x,
      originY: dockPosition.y,
      isPointerDown: true,
      moved: false,
    };

    dockButtonRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handleDockPointerMove = (event) => {
    if (
      !dockDragRef.current.isPointerDown ||
      dockDragRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const deltaX = event.clientX - dockDragRef.current.startX;
    const deltaY = event.clientY - dockDragRef.current.startY;

    if (
      !dockDragRef.current.moved &&
      (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)
    ) {
      dockDragRef.current.moved = true;
      setIsDraggingDock(true);
    }

    if (!dockDragRef.current.moved) {
      return;
    }

    const viewport = getViewport();
    const size = getDockSize(dockButtonRef);

    setDockPosition(
      clampDockPosition(
        {
          x: dockDragRef.current.originX + deltaX,
          y: dockDragRef.current.originY + deltaY,
        },
        size,
        viewport,
      ),
    );
  };

  const finishDockDrag = (event) => {
    if (
      !dockDragRef.current.isPointerDown ||
      dockDragRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    if (dockDragRef.current.moved) {
      const viewport = getViewport();
      const size = getDockSize(dockButtonRef);

      setDockPosition((current) =>
        snapDockPositionToNearestBorder(current, size, viewport),
      );
    }

    preventToggleAfterDragRef.current = Boolean(dockDragRef.current.moved);

    setIsDraggingDock(false);
    dockDragRef.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
      isPointerDown: false,
      moved: false,
    };
    dockButtonRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const loadTodaySales = async () => {
    const now = Date.now();
    if (
      latestTodaySalesRef.current &&
      now - latestTodaySalesAtRef.current < 60000
    ) {
      return latestTodaySalesRef.current;
    }

    const todayDate = getTodayDateValue();
    const response = await getDashboard({
      period: "daily",
      date: todayDate,
    });

    const summary = response?.data?.data?.summary ?? {};
    const payload = {
      date: todayDate,
      totalRevenue: Number(summary.totalRevenue ?? 0),
      totalOrders: Number(summary.totalOrders ?? 0),
      avgTicket: Number(summary.avgTicket ?? 0),
    };

    latestTodaySalesRef.current = payload;
    latestTodaySalesAtRef.current = now;
    return payload;
  };

  const pushUserMessage = (content) => {
    setMessages((current) => [
      ...current,
      makeMessage({ role: "user", content }),
    ]);
  };

  const pushAssistantMessage = (content) => {
    setMessages((current) => [
      ...current,
      makeMessage({ role: "assistant", content }),
    ]);
  };

  const handleAsk = async (question) => {
    const text = String(question || "").trim();
    if (!text || isThinking) {
      return;
    }

    pushUserMessage(text);
    setInput("");
    setIsThinking(true);

    try {
      let todaySales = null;
      if (isTodaySalesQuestion(text)) {
        todaySales = await loadTodaySales();
      }

      const assistantContext = {
        context: resolvedContext,
        aiPulse: safeAiPulse,
        todaySales,
      };

      const aiResponse = await askAiAssistant({
        message: text,
        context: assistantContext,
      });

      const reply = extractResponseMessage(aiResponse?.data);
      if (reply) {
        pushAssistantMessage(reply);
        return;
      }

      const fallbackReply = createAssistantReply({
        input: text,
        context: resolvedContext,
        todaySales,
        aiPulse: safeAiPulse,
      });
      pushAssistantMessage(fallbackReply);
    } catch {
      const fallbackReply = createAssistantReply({
        input: text,
        context: resolvedContext,
        todaySales: latestTodaySalesRef.current,
        aiPulse: safeAiPulse,
      });
      pushAssistantMessage(fallbackReply);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await handleAsk(input);
  };

  const clearMemory = () => {
    const seed = makeMessage({
      role: "assistant",
      content:
        "Memory cleared. Ask anything about sales, stock risk, and system improvements.",
    });

    setMessages([seed]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  };

  return (
    <>
      <div
        ref={dockButtonRef}
        className="fixed z-40 flex select-none flex-col items-end gap-2"
        onPointerMove={handleDockPointerMove}
        onPointerUp={finishDockDrag}
        onPointerCancel={finishDockDrag}
        style={{
          left: `${dockPosition.x}px`,
          top: `${dockPosition.y}px`,
        }}
      >
        <button
          type="button"
          onPointerDown={handleDockPointerDown}
          className="inline-flex touch-none items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.7)] transition hover:border-slate-900 hover:text-slate-900"
          style={{ cursor: isDraggingDock ? "grabbing" : "grab" }}
          aria-label="Drag AI dock"
          title="Drag dock"
        >
          <FiMove size={12} /> Move
        </button>

        <button
          type="button"
          onClick={() => handleDockOpen("notifications")}
          className="relative inline-flex touch-none items-center justify-center rounded-full border border-slate-300 bg-white p-3 text-slate-700 shadow-[0_14px_26px_-18px_rgba(15,23,42,0.7)] transition hover:border-slate-900 hover:text-slate-900"
          style={{ cursor: "pointer" }}
          aria-label="Open notifications"
        >
          <FiBell size={16} />
          {notificationBadgeCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-4.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
              {notificationBadgeCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={() =>
            handleDockOpen(
              String(dockSettings.dockDefaultPanel || "chat") ===
                "notifications"
                ? "notifications"
                : "chat",
            )
          }
          className="inline-flex touch-none items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-3 py-3 text-sm font-bold text-white shadow-[0_18px_34px_-20px_rgba(15,23,42,0.8)] transition hover:bg-slate-700"
          style={{ cursor: "pointer" }}
          aria-label="Open AI assistant"
        >
          <FiZap size={16} />
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[1px]">
          <aside className="absolute right-0 top-0 flex h-full w-[min(94vw,430px)] flex-col border-l border-slate-200 bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  AI Dock
                </p>
                <h3 className="mt-1 flex items-center gap-2 text-base font-black text-slate-900">
                  <FiCpu size={16} /> Copilot + Notifications
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Draggable dock pinned at bottom-right.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 p-2 text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
                aria-label="Close AI assistant"
              >
                <FiX size={16} />
              </button>
            </header>

            <div className="border-b border-slate-200 px-4 py-2 sm:px-5">
              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActivePanel("chat")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    activePanel === "chat"
                      ? "bg-white text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("notifications")}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    activePanel === "notifications"
                      ? "bg-white text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  Notifications
                </button>
              </div>
            </div>

            {activePanel === "chat" ? (
              <>
                <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Recommendations
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recommendations.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAsk(item)}
                        disabled={isThinking}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  ref={scrollContainerRef}
                  className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-5"
                >
                  {messages.map((message) => (
                    <article
                      key={message.id}
                      className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm ${
                        message.role === "assistant"
                          ? "border border-amber-200 bg-linear-to-br from-white via-amber-50/40 to-white text-slate-700"
                          : "ml-auto bg-slate-900 text-white"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div>
                          {renderAssistantMessage(message.content, message.id)}
                        </div>
                      ) : (
                        <p className="whitespace-pre-line">{message.content}</p>
                      )}
                    </article>
                  ))}

                  {isThinking ? (
                    <article className="max-w-[92%] rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <FiLoader
                            className="animate-spin text-slate-500"
                            size={14}
                          />
                          <span className="italic">
                            Analyzing live signals...
                          </span>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                          {formatElapsed(responseElapsedSec)}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Free tier responses can take around 20-30 seconds.
                      </p>
                    </article>
                  ) : null}
                </div>

                <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center gap-2"
                  >
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Ask about sales, stock, improvements..."
                      className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isThinking}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Send message"
                    >
                      <FiSend size={15} />
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={clearMemory}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                  >
                    <FiTrash2 size={13} /> Clear temporary memory
                  </button>
                </footer>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-5">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Live Notifications
                </p>
                <div className="space-y-2">
                  {notifications.map((item) => {
                    const Icon = item.icon || FiClock;
                    const toneClass =
                      item.tone === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : item.tone === "danger"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : item.tone === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-700";

                    return (
                      <article
                        key={item.id}
                        className={`rounded-xl border px-3 py-2.5 text-sm ${toneClass}`}
                      >
                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em]">
                          <Icon size={13} /> {item.title}
                        </p>
                        <p className="mt-1 text-xs">{item.description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default AiAssistantDock;
