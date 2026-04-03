import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const CategoryIncomeChartCard = ({ mixData }) => {
  const points = Array.isArray(mixData) ? mixData : [];
  const chartData = points.map((item) => ({
    label: item.label || "Uncategorized",
    revenue: Number(item.value ?? 0),
    netIncome: Number(item.netValue ?? 0),
  }));

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
          <ChartContainer className="h-full w-full">
            <BarChart
              data={chartData}
              margin={{ left: 4, right: 10, top: 14, bottom: 22 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                minTickGap={16}
                tickMargin={10}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                width={30}
                allowDecimals={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              />

              <ChartTooltip content={<ChartTooltipContent />} />

              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#2563eb"
                radius={[8, 8, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                dataKey="netIncome"
                name="Net Income"
                fill="#16a34a"
                radius={[8, 8, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default CategoryIncomeChartCard;
