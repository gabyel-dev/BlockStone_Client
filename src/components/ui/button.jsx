import { Children, cloneElement } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  default:
    "bg-slate-900 text-white hover:bg-slate-700 border border-transparent",
  outline:
    "bg-white text-slate-700 border border-slate-300 hover:border-slate-900 hover:text-slate-900",
  ghost:
    "bg-transparent text-slate-700 border border-transparent hover:bg-slate-100",
};

const buttonSizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-9 px-3.5 py-2 text-sm",
  lg: "h-11 px-5 py-2.5 text-base",
};

export const Button = ({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  children,
  ...props
}) => {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:pointer-events-none disabled:opacity-50",
    buttonVariants[variant] || buttonVariants.default,
    buttonSizes[size] || buttonSizes.default,
    className,
  );

  if (asChild) {
    const child = Children.only(children);
    return cloneElement(child, {
      ...props,
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
