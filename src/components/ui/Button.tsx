import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-arc-500 to-arc-600 text-white hover:from-arc-600 hover:to-arc-700 disabled:from-arc-200 disabled:to-arc-200 shadow-premium focus-visible:ring-arc-300",
  secondary:
    "bg-surface-50 text-arc-900 border border-surface-100 hover:bg-surface-100 disabled:opacity-50",
  ghost:
    "text-surface-300 hover:bg-surface-50 hover:text-arc-700 disabled:opacity-40",
  danger:
    "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          "inline-flex items-center justify-center gap-2 font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";