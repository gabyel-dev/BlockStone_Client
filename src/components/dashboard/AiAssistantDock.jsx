import { useEffect, useMemo, useRef, useState } from "react";
import { FiCpu, FiSend, FiTrash2, FiX, FiZap } from "react-icons/fi";
import { askAiAssistant } from "../../api/ai";
import { getDashboard } from "../../api/auth";
import { getTodayDateValue } from "../../utils/timezoneDate";
import {
  createAssistantReply,
  getAssistantRecommendations,
} from "../../utils/dashboardAssistant";

const CHAT_STORAGE_KEY = "blockstone.ai.assistant.chat.v1";
const DOCK_POSITION_STORAGE_KEY = "blockstone.ai.assistant.dock-position.v1";
const ONE_HOUR_MS = 60 * 60 * 1000;
const CHAT_COOLDOWN_MS =
  Number(import.meta.env.VITE_AI_CHAT_COOLDOWN_MS) || 60000;
const DOCK_MARGIN = 12;
const DEFAULT_DOCK_SIZE = {
  width: 120,
  height: 48,
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

const AiAssistantDock = ({ context, aiPulse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState(0);
  const [dockPosition, setDockPosition] = useState(() => readDockPosition());
  const [isDraggingDock, setIsDraggingDock] = useState(false);
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
  const scrollContainerRef = useRef(null);
  const dockButtonRef = useRef(null);
  const dockDragRef = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
  });
  const preventToggleAfterDragRef = useRef(false);
  const recommendations = useMemo(() => getAssistantRecommendations(), []);
  const isCooldownActive = cooldownRemainingSec > 0;

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
    if (!cooldownUntil) {
      setCooldownRemainingSec(0);
      return;
    }

    const updateCooldown = () => {
      const remainingMs = Math.max(0, cooldownUntil - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);
      setCooldownRemainingSec(remainingSec);
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);

    return () => clearInterval(timer);
  }, [cooldownUntil]);

  const handleDockToggle = () => {
    if (preventToggleAfterDragRef.current) {
      preventToggleAfterDragRef.current = false;
      return;
    }

    setIsOpen((open) => !open);
  };

  const handleDockPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    dockDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: dockPosition.x,
      originY: dockPosition.y,
      moved: false,
    };

    setIsDraggingDock(true);
    dockButtonRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handleDockPointerMove = (event) => {
    if (!isDraggingDock || dockDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dockDragRef.current.startX;
    const deltaY = event.clientY - dockDragRef.current.startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dockDragRef.current.moved = true;
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
    if (!isDraggingDock || dockDragRef.current.pointerId !== event.pointerId) {
      return;
    }

    const viewport = getViewport();
    const size = getDockSize(dockButtonRef);

    setDockPosition((current) =>
      snapDockPositionToNearestBorder(current, size, viewport),
    );

    preventToggleAfterDragRef.current = dockDragRef.current.moved;

    setIsDraggingDock(false);
    dockDragRef.current.pointerId = null;
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

    if (isCooldownActive) {
      pushAssistantMessage(
        `Please wait ${cooldownRemainingSec}s before sending another AI request to avoid limits.`,
      );
      return;
    }

    pushUserMessage(text);
    setInput("");
    setIsThinking(true);
    setCooldownUntil(Date.now() + CHAT_COOLDOWN_MS);

    try {
      let todaySales = null;
      if (isTodaySalesQuestion(text)) {
        todaySales = await loadTodaySales();
      }

      const assistantContext = {
        context,
        aiPulse,
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
        context,
        todaySales,
        aiPulse,
      });
      pushAssistantMessage(fallbackReply);
    } catch {
      const fallbackReply = createAssistantReply({
        input: text,
        context,
        todaySales: latestTodaySalesRef.current,
        aiPulse,
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
      <button
        ref={dockButtonRef}
        type="button"
        onClick={handleDockToggle}
        onPointerDown={handleDockPointerDown}
        onPointerMove={handleDockPointerMove}
        onPointerUp={finishDockDrag}
        onPointerCancel={finishDockDrag}
        className="fixed z-40 inline-flex touch-none select-none items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-3 py-3 text-sm font-bold text-white shadow-[0_18px_34px_-20px_rgba(15,23,42,0.8)] transition hover:bg-slate-700"
        style={{
          left: `${dockPosition.x}px`,
          top: `${dockPosition.y}px`,
          cursor: isDraggingDock ? "grabbing" : "grab",
        }}
      >
        <FiZap size={16} />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[1px]">
          <aside className="absolute right-0 top-0 flex h-full w-[min(94vw,430px)] flex-col border-l border-slate-200 bg-white">
            <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  AI Assisted Chat
                </p>
                <h3 className="mt-1 flex items-center gap-2 text-base font-black text-slate-900">
                  <FiCpu size={16} /> Dashboard Copilot
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Temporary memory expires after 1 hour.
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
                    disabled={isThinking || isCooldownActive}
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
                      ? "border border-slate-200 bg-white text-slate-700"
                      : "ml-auto bg-slate-900 text-white"
                  }`}
                >
                  <p className="whitespace-pre-line">{message.content}</p>
                </article>
              ))}

              {isThinking ? (
                <article className="max-w-[92%] rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-500 shadow-sm">
                  Analyzing live signals...
                </article>
              ) : null}
            </div>

            <footer className="border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={
                    isCooldownActive
                      ? `Cooldown active: ${cooldownRemainingSec}s`
                      : "Ask about sales, stock, improvements..."
                  }
                  className="h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking || isCooldownActive}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Send message"
                >
                  <FiSend size={15} />
                </button>
              </form>

              {isCooldownActive ? (
                <p className="mt-2 text-xs text-amber-600">
                  AI request cooldown is active. Try again in{" "}
                  {cooldownRemainingSec}s.
                </p>
              ) : null}

              <button
                type="button"
                onClick={clearMemory}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              >
                <FiTrash2 size={13} /> Clear temporary memory
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default AiAssistantDock;
