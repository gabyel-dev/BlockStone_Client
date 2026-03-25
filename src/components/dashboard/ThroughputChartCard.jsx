import { LineChart } from "@mui/x-charts/LineChart";

const ThroughputChartCard = ({ period, throughput }) => {
  const points = Array.isArray(throughput) ? throughput : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-7 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Throughput
          </p>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            {period} Job Output
          </h3>
        </div>
        <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          +8% this week
        </p>
      </div>

      <div className="h-52 rounded-2xl bg-linear-to-b from-slate-50 to-white p-2 sm:h-64 sm:p-3">
        <LineChart
          series={[
            {
              data: points.map((item) => item.jobs),
              color: "#0f172a",
              label: "Jobs",
              curve: "monotoneX",
            },
          ]}
          xAxis={[{ data: points.map((item) => item.day), scaleType: "point" }]}
          yAxis={[{ min: 0 }]}
          grid={{ horizontal: true }}
          margin={{ left: 30, right: 12, top: 16, bottom: 20 }}
          slotProps={{ legend: { hidden: true } }}
          height={180}
        />
      </div>
    </div>
  );
};

export default ThroughputChartCard;
