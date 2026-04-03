import { cn } from "../../lib/utils";

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-3xl border border-slate-200 bg-white shadow-sm",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
    {...props}
  />
);

export const CardTitle = ({ className, ...props }) => (
  <h3
    className={cn("text-lg font-black leading-tight text-slate-900", className)}
    {...props}
  />
);

export const CardDescription = ({ className, ...props }) => (
  <p
    className={cn(
      "text-xs font-bold uppercase tracking-[0.16em] text-slate-400",
      className,
    )}
    {...props}
  />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn("px-6 pb-6", className)} {...props} />
);
