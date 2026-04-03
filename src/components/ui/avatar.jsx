import { cn } from "../../lib/utils";

export const Avatar = ({ className, ...props }) => (
  <div
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
);

export const AvatarImage = ({ className, ...props }) => (
  <img className={cn("aspect-square h-full w-full", className)} {...props} />
);

export const AvatarFallback = ({ className, ...props }) => (
  <div
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-slate-100",
      className,
    )}
    {...props}
  />
);
