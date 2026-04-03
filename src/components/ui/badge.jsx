import { cn } from "../../lib/utils";

const badgeVariants = {
  default: "bg-slate-900 text-white",
  secondary: "bg-slate-100 text-slate-700",
  outline: "border border-slate-300 bg-white text-slate-700",
  indigo: "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
};

export const Badge = ({ className, variant = "default", ...props }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]",
      badgeVariants[variant] || badgeVariants.default,
      className,
    )}
    {...props}
  />
);
