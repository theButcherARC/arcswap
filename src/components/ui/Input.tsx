import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, rightSlot, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-arc-900">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-2xl border bg-surface-25 px-4 py-3 text-sm transition-colors",
              "placeholder:text-surface-300 focus:outline-none focus:ring-2 focus:bg-white",
              error
                ? "border-rose-300 focus:ring-rose-200"
                : "border-surface-100 focus:border-arc-300 focus:ring-arc-100",
              rightSlot ? "pr-28" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {rightSlot && <div className="absolute right-2">{rightSlot}</div>}
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-300">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";