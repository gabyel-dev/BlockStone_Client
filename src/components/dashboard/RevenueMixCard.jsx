import { Cell, Pie, PieChart } from "recharts";
import { FiLayers } from "react-icons/fi";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const palette = ["#0f172a", "#2563eb", "#22c55e", "#f59e0b", "#ef4444"];

const mixColorMap = {
  photocopy: "#2563eb", // blue
  finishing: "#ef4444", // red
  print: "#22c55e", // green
  scanning: "#9ca3af", // gray
};

const getMixColor = (label, fallbackIndex) => {
  const key = String(label || "")
    .trim()
    .toLowerCase();

  return mixColorMap[key] || palette[fallbackIndex % palette.length];
};

const RevenueMixCard = ({ mixData }) => {
  const normalizedMix = (Array.isArray(mixData) ? mixData : []).map(
    (item, index) => ({
      id: index,
      value: Number(item.value ?? 0),
      label: item.label,
      color: getMixColor(item.label, index),
    }),
  );

  const total = normalizedMix.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 sm:rounded-[30px] sm:p-6 xl:col-span-5">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <h3 className="text-lg font-black text-slate-900 sm:text-xl">
          Revenue Mix
        </h3>
        <FiLayers className="text-slate-400" size={18} />
      </div>

      <div className="my-2 flex items-center justify-center sm:my-4">
        {normalizedMix.length === 0 ? (
          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            No revenue mix data for this period.
          </div>
        ) : (
          <div className="h-52 w-full">
            <ChartContainer className="h-full w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => {
                        const numericValue = Number(value ?? 0);
                        const percent =
                          total > 0
                            ? `${((numericValue / total) * 100).toFixed(1)}%`
                            : "0.0%";
                        return percent;
                      }}
                    />
                  }
                />

                <Pie
                  data={normalizedMix}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="46%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={2}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {normalizedMix.map((item) => (
                    <Cell key={`mix-${item.id}`} fill={item.color} />
                  ))}
                </Pie>

                <ChartLegend
                  verticalAlign="bottom"
                  align="center"
                  content={<ChartLegendContent />}
                />
              </PieChart>
            </ChartContainer>
          </div>
        )}
      </div>

      <div className="space-y-1.5 text-sm sm:space-y-2">
        {normalizedMix.map((item) => {
          const share =
            total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-lg bg-white p-2.5 sm:p-3"
            >
              <p className="flex items-center gap-2 font-semibold text-slate-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </p>
              <p className="font-black text-slate-900">{share}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueMixCard;
