import { PieChart } from "@mui/x-charts/PieChart";
import { FiLayers } from "react-icons/fi";

const palette = ["#0f172a", "#2563eb", "#22c55e", "#f59e0b", "#ef4444"];

const RevenueMixCard = ({ mixData }) => {
  const normalizedMix = (Array.isArray(mixData) ? mixData : []).map(
    (item, index) => ({
      id: index,
      value: Number(item.value ?? 0),
      label: item.label,
      color: palette[index % palette.length],
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
        <PieChart
          height={180}
          series={[
            {
              data: normalizedMix,
              innerRadius: 45,
              outerRadius: 70,
              paddingAngle: 2,
              cornerRadius: 5,
            },
          ]}
          slotProps={{ legend: { hidden: true } }}
        />
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
