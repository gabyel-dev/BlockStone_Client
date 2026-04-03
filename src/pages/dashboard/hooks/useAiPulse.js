import { useEffect, useMemo, useRef, useState } from "react";
import { askAiAssistant } from "../../../api/ai";
import {
  buildAiPulse,
  parseAiPulseFromText,
} from "../../../utils/dashboardAssistant";

const PULSE_REFRESH_MS =
  Number(import.meta.env.VITE_AI_PULSE_REFRESH_MS) || 3 * 60 * 1000;
const CHALLENGE_BACKOFF_MS = 10 * 60 * 1000;
const INITIAL_PULSE_DELAY_MS =
  Number(import.meta.env.VITE_AI_PULSE_INITIAL_DELAY_MS) || 60 * 1000;
const PULSE_CACHE_STORAGE_KEY = "blockstone.ai.pulse.cache.v1";
const PULSE_CACHE_TTL_MS =
  Number(import.meta.env.VITE_AI_PULSE_CACHE_TTL_MS) || PULSE_REFRESH_MS;

const extractText = (payload) => {
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

const buildPulsePrompt = ({ period, referenceDate }) =>
  [
    "Generate a LIVE PULSE report for a print business dashboard.",
    `Time filter: period=${period}, referenceDate=${referenceDate}.`,
    "Use the context data sent with this request.",
    "Return strict JSON only with this exact schema:",
    '{"tone":"emerald|amber|rose","headline":"one sentence","description":"short supporting sentence"}',
    "No markdown. No code fences. No extra keys.",
  ].join(" ");

const makeCacheKey = ({ period, referenceDate }) =>
  `${String(period || "daily")}:${String(referenceDate || "")}`;

const readPulseCache = (cacheKey) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(PULSE_CACHE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const entry = parsed?.[cacheKey];
    if (!entry) {
      return null;
    }

    const expiresAt = Number(entry?.expiresAt || 0);
    if (!expiresAt || expiresAt <= Date.now()) {
      return null;
    }

    return entry?.pulse || null;
  } catch {
    return null;
  }
};

const writePulseCache = (cacheKey, pulse) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = window.sessionStorage.getItem(PULSE_CACHE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    parsed[cacheKey] = {
      pulse,
      expiresAt: Date.now() + PULSE_CACHE_TTL_MS,
    };

    window.sessionStorage.setItem(
      PULSE_CACHE_STORAGE_KEY,
      JSON.stringify(parsed),
    );
  } catch {
    // Ignore cache write errors.
  }
};

export const useAiPulse = ({
  enabled = true,
  summary,
  period,
  referenceDate,
  stockRadar,
  inventoryMetrics,
  revenueMix,
  throughput,
  agendaCount,
}) => {
  const fallbackPulse = useMemo(
    () =>
      buildAiPulse({
        summary,
        period,
        stockRadar,
        criticalCount: inventoryMetrics?.criticalCount,
        revenueMix,
      }),
    [summary, period, stockRadar, inventoryMetrics?.criticalCount, revenueMix],
  );

  const [aiPulse, setAiPulse] = useState(fallbackPulse);
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);
  const latestContextRef = useRef(null);
  const blockedUntilRef = useRef(0);
  const cacheKey = useMemo(
    () => makeCacheKey({ period, referenceDate }),
    [period, referenceDate],
  );

  latestContextRef.current = {
    summary,
    period,
    referenceDate,
    stockRadar,
    inventoryMetrics,
    revenueMix,
    throughput,
    agendaCount,
    fallbackPulse,
  };

  useEffect(() => {
    if (!enabled) {
      setAiPulse(fallbackPulse);
      setIsRefreshingPulse(false);
      return;
    }

    const cachedPulse = readPulseCache(cacheKey);
    if (cachedPulse) {
      setAiPulse(cachedPulse);
    }

    setAiPulse((current) => current || fallbackPulse);

    let isMounted = true;
    let initialTimer;
    let refreshTimer;

    const refreshPulse = async () => {
      const context = latestContextRef.current;
      if (!context) {
        return;
      }

      const now = Date.now();
      if (blockedUntilRef.current && now < blockedUntilRef.current) {
        setAiPulse(context.fallbackPulse);
        return;
      }

      setIsRefreshingPulse(true);

      try {
        const response = await askAiAssistant({
          message: buildPulsePrompt({
            period: context.period,
            referenceDate: context.referenceDate,
          }),
          context,
        });

        const text = extractText(response?.data);
        const parsed = parseAiPulseFromText(text);

        if (isMounted && parsed) {
          setAiPulse(parsed);
          writePulseCache(cacheKey, parsed);
        }
      } catch (error) {
        const providerCode = error?.response?.data?.code;
        const status = Number(error?.response?.status || 0);
        const shouldBackoff =
          providerCode === "AI_PROVIDER_CHALLENGE" ||
          providerCode === "AI_PROVIDER_FORBIDDEN" ||
          status === 403 ||
          status === 503;

        if (shouldBackoff) {
          blockedUntilRef.current = Date.now() + CHALLENGE_BACKOFF_MS;
        }

        if (isMounted) {
          setAiPulse(context.fallbackPulse);
        }
      } finally {
        if (isMounted) {
          setIsRefreshingPulse(false);
        }
      }
    };

    initialTimer = setTimeout(() => {
      refreshPulse();
    }, INITIAL_PULSE_DELAY_MS);

    refreshTimer = setInterval(refreshPulse, PULSE_REFRESH_MS);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(refreshTimer);
    };
  }, [enabled, fallbackPulse, cacheKey]);

  return {
    aiPulse,
    isRefreshingPulse,
  };
};
