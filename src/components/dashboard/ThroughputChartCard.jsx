import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";

const DAILY_24H_TIME = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/;

// Ensures daily chart labels always show in PHT 12-hour format.
const toDailyPhtLabel = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "-";
  }

  const hasMeridiem = /\b(AM|PM)\b/i.test(raw);
  const hasPht = /\bPHT\b/i.test(raw);

  if (hasMeridiem && hasPht) {
    return raw;
  }

  const asDate = new Date(raw);
  if (!Number.isNaN(asDate.getTime())) {
    const valueInPht = new Intl.DateTimeFormat("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      hourCycle: "h12",
    }).format(asDate);

    return `${valueInPht} PHT`;
  }

  const match = raw.match(DAILY_24H_TIME);
  if (match) {
    const [, hourText, minute] = match;
    const hour = Number(hourText);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${String(hour12).padStart(2, "0")}:${minute} ${suffix} PHT`;
  }

  if (hasMeridiem && !hasPht) {
    return `${raw} PHT`;
  }

  return raw;
};

const getXAxisLabel = (item, period) => {
  const rawLabel =
    item?.day ??
    item?.bucket_label ??
    item?.label ??
    item?.time ??
    item?.bucket_date;

  if (period === "daily") {
    return toDailyPhtLabel(rawLabel);
  }

  return String(rawLabel ?? "-");
};

const ThroughputChartCard = ({ period, throughput }) => {
  const points = Array.isArray(throughput) ? throughput : [];
  const chartData = points.map((item) => ({
    label: getXAxisLabel(item, period),
    jobs: Number(item.jobs ?? 0),
  }));

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:rounded-[30px] sm:p-6 xl:col-span-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-7 sm:gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 sm:text-xl">
            {period} Job Output
          </h3>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-500">
          No throughput data for this period.
        </div>
      ) : (
        <div className="h-52 rounded-2xl bg-linear-to-b from-slate-50 to-white p-2 sm:h-64 sm:p-3">
          <ChartContainer className="h-full w-full">
            <AreaChart
              data={chartData}
              margin={{ left: 8, right: 10, top: 10, bottom: 8 }}
            >
              <defs>
                <linearGradient
                  id="throughput-jobs-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>

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

              <Area
                type="monotone"
                dataKey="jobs"
                name="Jobs Done"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#throughput-jobs-fill)"
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      )}
    </div>
  );
};

export default ThroughputChartCard;
