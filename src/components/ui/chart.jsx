import { forwardRef } from "react";
import { Legend, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "../../lib/utils";

export const ChartContainer = forwardRef(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("h-full w-full", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  ),
);

ChartContainer.displayName = "ChartContainer";

export const ChartTooltip = Tooltip;
export const ChartLegend = Legend;

const formatTooltipValue = (value) => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return value;
  }

  return numericValue.toLocaleString("en-PH");
};

export const ChartTooltipContent = ({
  active,
  payload,
  label,
  labelFormatter,
  formatter,
  hideLabel = false,
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const resolvedLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div className="min-w-40 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-[0_16px_32px_-24px_rgba(15,23,42,0.65)] backdrop-blur">
      {!hideLabel && resolvedLabel != null ? (
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {resolvedLabel}
        </p>
      ) : null}

      <div className="space-y-1">
        {payload.map((item) => {
          const color = item?.color || item?.payload?.fill || "#64748b";
          const key = `${item?.dataKey || item?.name || "value"}`;

          let valueContent = formatTooltipValue(item?.value);
          if (formatter) {
            const next = formatter(
              item?.value,
              item?.name,
              item,
              item?.payload,
            );
            valueContent = Array.isArray(next) ? next[0] : next;
          }

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 font-semibold text-slate-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {item?.name || item?.dataKey}
              </p>
              <p className="font-black text-slate-900">{valueContent}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ChartLegendContent = ({ payload }) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-600">
      {payload.map((item) => (
        <span
          key={`${item.value}`}
          className="inline-flex items-center gap-1.5"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item?.color || "#64748b" }}
          />
          {item?.value}
        </span>
      ))}
    </div>
  );
};
