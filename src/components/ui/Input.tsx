import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Element rendered to the right inside the input (e.g. a token selector) */
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, rightSlot, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-surface-800"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-xl border bg-surface-50 px-3 py-2.5 text-sm",
              "placeholder:text-surface-200 focus:outline-none focus:ring-2",
              error
                ? "border-red-400 focus:ring-red-300"
                : "border-surface-200 focus:ring-arc-300",
              rightSlot ? "pr-28" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {rightSlot && (
            <div className="absolute right-2">{rightSlot}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-200">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
