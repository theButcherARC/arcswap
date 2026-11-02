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
    "bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-40 focus-visible:ring-[var(--accent)]",
  secondary:
    "border border-[var(--line)] bg-[var(--glass)] text-[var(--fg)] hover:bg-[var(--glass-strong)] disabled:opacity-50 focus-visible:ring-[var(--accent)]",
  ghost:
    "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--glass)] disabled:opacity-40 focus-visible:ring-[var(--accent)]",
  danger:
    "border border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 focus-visible:ring-rose-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-xs",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-12 px-6 py-3 text-sm",
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
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98]",
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
