import { useEffect, useState } from "react";
import { getDashboard } from "../../../api/auth";

// Loads dashboard KPI/chart payload with polling tied to selected period/date.
export const useDashboardData = ({ period, referenceDate }) => {
  const [summary, setSummary] = useState({});
  const [throughput, setThroughput] = useState([]);
  const [revenueMix, setRevenueMix] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer;

    const loadDashboard = async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await getDashboard({
          period,
          date: referenceDate,
        });
        const payload = response?.data?.data;

        if (!isMounted) {
          return;
        }

        setSummary(payload.summary ?? {});
        setThroughput(payload.throughput ?? []);
        setRevenueMix(payload.revenueMix ?? []);
      } catch {
        if (!isMounted) {
          return;
        }

        setSummary({});
        setThroughput([]);
        setRevenueMix([]);
      } finally {
        if (isMounted && !silent) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    refreshTimer = setInterval(() => {
      loadDashboard({ silent: true });
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, [period, referenceDate]);

  return {
    summary,
    throughput,
    revenueMix,
    isLoading,
  };
};
