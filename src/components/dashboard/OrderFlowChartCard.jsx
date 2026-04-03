import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { FiMoreVertical } from "react-icons/fi";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const OrderFlowChartCard = ({ orderFlow }) => {
  const points = Array.isArray(orderFlow) ? orderFlow : [];
  const chartData = points.map((item) => ({
    day: item.day,
    order: Number(item.order ?? 0),
  }));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-8">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Order Flow
          </p>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            Live Production Board
          </h3>
        </div>
        <button className="text-slate-500 transition hover:text-slate-800">
          <FiMoreVertical size={18} />
        </button>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500">
          No order flow data for this period.
        </div>
      ) : (
        <div className="h-52 rounded-2xl bg-linear-to-b from-slate-50 to-white p-2 sm:h-64 sm:p-3">
          <ChartContainer className="h-full w-full">
            <LineChart
              data={chartData}
              margin={{ left: 8, right: 10, top: 10, bottom: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="day"
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

              <Line
                type="monotone"
                dataKey="order"
                name="Order"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default OrderFlowChartCard;
