import { useEffect, useMemo, useRef, useState } from "react";
import { askAiAssistant } from "../../../api/ai";
import {
  buildAiPulse,
  parseAiPulseFromText,
} from "../../../utils/dashboardAssistant";

const PULSE_REFRESH_MS =
  Number(import.meta.env.VITE_AI_PULSE_REFRESH_MS) || 3 * 60 * 1000;
const CHALLENGE_BACKOFF_MS = 10 * 60 * 1000;

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

  useEffect(() => {
    setAiPulse(fallbackPulse);
  }, [fallbackPulse]);

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

    let isMounted = true;

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

    refreshPulse();
    const timer = setInterval(refreshPulse, PULSE_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [enabled, fallbackPulse, period, referenceDate]);

  return {
    aiPulse,
    isRefreshingPulse,
  };
};
