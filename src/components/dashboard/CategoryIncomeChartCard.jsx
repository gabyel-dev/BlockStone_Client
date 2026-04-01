import { BarChart } from "@mui/x-charts/BarChart";

const CategoryIncomeChartCard = ({ mixData }) => {
  const points = Array.isArray(mixData) ? mixData : [];
  const labels = points.map((item) => item.label || "Uncategorized");
  const revenueData = points.map((item) => Number(item.value ?? 0));
  const netData = points.map((item) => Number(item.netValue ?? 0));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6 sm:gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Category Income
          </p>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            Revenue vs Net Income by Category
          </h3>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500">
          No category income data for the selected period.
        </div>
      ) : (
        <div className="h-60 rounded-2xl bg-linear-to-b from-slate-50 to-white p-2 sm:h-72 sm:p-3">
          <BarChart
            xAxis={[{ data: labels, scaleType: "band" }]}
            yAxis={[{ min: 0 }]}
            series={[
              {
                data: revenueData,
                label: "Revenue",
                color: "#2563eb",
              },
              {
                data: netData,
                label: "Net Income",
                color: "#16a34a",
              },
            ]}
            height={220}
            margin={{ left: 0, right: 12, top: 18, bottom: 48 }}
            grid={{ horizontal: true }}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryIncomeChartCard;
