import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getDashboard } from "../api/auth";
import CategoryIncomeChartCard from "../components/dashboard/CategoryIncomeChartCard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import PulseSection from "../components/dashboard/PulseSection";
import QuickActionsCard from "../components/dashboard/QuickActionsCard";
import RevenueMixCard from "../components/dashboard/RevenueMixCard";
import ShiftAgendaCard from "../components/dashboard/ShiftAgendaCard";
import StockRadarCard from "../components/dashboard/StockRadarCard";
import ThroughputChartCard from "../components/dashboard/ThroughputChartCard";
import DashboardSkeleton from "../components/skeletons/dashboard/DashboardSkeleton";
import ShiftAgendaModal from "../components/Agendas/shiftAgenda";
import { getShiftAgenda } from "../api/print";

// Main dashboard page that loads analytics and passes data into UI cards.
const DashboardPage = () => {
  const { user } = useOutletContext();

  // Selected filter values for dashboard analytics.
  const [period, setPeriod] = useState("daily");
  const [referenceDate, setReferenceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [summary, setSummary] = useState({});
  const [throughput, setThroughput] = useState([]);
  const [revenueMix, setRevenueMix] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onClose, setOnClose] = useState(false);

  const [agendaData, setAgendaData] = useState([]);

  const stockRadar = [
    { name: "Matte Paper A4", level: 12, tone: "red", status: "Critical" },
    {
      name: "Cyan Ink Cartridge",
      level: 45,
      tone: "amber",
      status: "Watch",
    },
    { name: "Glossy Flyers", level: 0, tone: "red", status: "Out" },
    {
      name: "Cardstock 300gsm",
      level: 78,
      tone: "emerald",
      status: "Healthy",
    },
  ];

  // Dashboard API result states.
  useEffect(() => {
    let isMounted = true;
    let refreshTimer;

    // STEP 6: Fetch dashboard payload from backend and store it in component state.
    const loadDashboard = async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await getDashboard({
          period,
          date: referenceDate,
        });
        const payload = response?.data?.data ?? {};

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

    // STEP 7: Initial fetch for first render/filter change.
    loadDashboard();

    // STEP 8: Near-real-time behavior via polling.
    // Why it is real-time (practically): every interval asks the server again,
    // and the server recomputes from current DB rows, so dashboard reflects latest writes.
    refreshTimer = setInterval(() => {
      loadDashboard({ silent: true });
    }, 15000);

    // STEP 9: Cleanup to avoid memory leaks or setState after unmount.
    return () => {
      isMounted = false;
      clearInterval(refreshTimer);
    };
  }, [period, referenceDate]);

  useEffect(() => {
    const loadAgenda = async () => {
      try {
        const cachedRaw = localStorage.getItem("agenda-data");

        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (Array.isArray(cached)) {
              setAgendaData(cached);
              return;
            }
          } catch {
            localStorage.removeItem("agenda-data");
          }
        }

        const response = await getShiftAgenda();
        const fetched = response?.data?.agendaData;
        const normalized = Array.isArray(fetched) ? fetched : [];

        setAgendaData(normalized);
        localStorage.setItem("agenda-data", JSON.stringify(normalized));
      } catch (error) {
        setAgendaData([]);
        localStorage.removeItem("agenda-data");
      }
    };

    loadAgenda();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="w-full px-4 py-4 text-slate-900 md:pl-5 lg:pl-0 md:pr-5 sm:py-9">
      <DashboardHeader
        firstName={user?.first_name}
        period={period}
        referenceDate={referenceDate}
        onPeriodChange={setPeriod}
        onDateChange={setReferenceDate}
      />

      <section className="grid gap-4 sm:gap-6 xl:grid-cols-12">
        <PulseSection summary={summary} period={period} />
        <ShiftAgendaCard setClose={setOnClose} agendaData={agendaData} />
      </section>

      {onClose && (
        <ShiftAgendaModal onClose={setOnClose} agendaData={agendaData} />
      )}

      <section className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-12">
        <ThroughputChartCard period={period} throughput={throughput} />
        <RevenueMixCard mixData={revenueMix} />
      </section>

      <section className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-12">
        <CategoryIncomeChartCard mixData={revenueMix} />
        <StockRadarCard stockRadar={stockRadar} />
      </section>

      <QuickActionsCard />
    </div>
  );
};

export default DashboardPage;
