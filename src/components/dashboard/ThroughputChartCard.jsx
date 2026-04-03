import { LineChart } from "@mui/x-charts/LineChart";

const ThroughputChartCard = ({ period, throughput }) => {
  const points = Array.isArray(throughput) ? throughput : [];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-7 sm:gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            {period} Job Output
          </h3>
        </div>
      </div>

      <div className="h-52 rounded-2xl bg-linear-to-b from-slate-50 to-white p-2 sm:h-64 sm:p-3">
        <LineChart
          series={[
            {
              data: points.map((item) => item.jobs),
              color: "#22c55e",
              label: "Jobs Done",
              curve: "monotoneX",
              area: true,
            },
          ]}
          xAxis={[{ data: points.map((item) => item.day), scaleType: "point" }]}
          yAxis={[{ min: 0 }]}
          grid={{ horizontal: true }}
          margin={{ left: 0, right: 12, top: 16, bottom: 20 }}
          slotProps={{ legend: { hidden: false } }}
          height={200}
        />
      </div>
    </div>
  );
};

export default ThroughputChartCard;
