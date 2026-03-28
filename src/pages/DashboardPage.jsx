import { useState } from "react";
import { useOutletContext } from "react-router-dom";
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
import { stockRadar } from "./dashboard/constants/stockRadar";
import { useDashboardData } from "./dashboard/hooks/useDashboardData";
import { useShiftAgendaData } from "./dashboard/hooks/useShiftAgendaData";

// Main dashboard page that loads analytics and passes data into UI cards.
const DashboardPage = () => {
  const { user } = useOutletContext();

  // Selected filter values for dashboard analytics.
  const [period, setPeriod] = useState("daily");
  const [referenceDate, setReferenceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [onClose, setOnClose] = useState(false);

  const { summary, throughput, revenueMix, isLoading } = useDashboardData({
    period,
    referenceDate,
  });
  const { agendaData, addAgenda, editAgenda, removeAgenda, isAgendaLoading } =
    useShiftAgendaData();

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
        <ShiftAgendaModal
          onClose={setOnClose}
          agendaData={agendaData}
          onCreate={addAgenda}
          onUpdate={editAgenda}
          onDelete={removeAgenda}
          isLoading={isAgendaLoading}
        />
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
