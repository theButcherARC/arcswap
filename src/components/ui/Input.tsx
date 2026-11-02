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
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--fg)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-[var(--radius)] border bg-[var(--bg-raised)] px-4 py-3 text-base text-[var(--fg)] transition-colors",
              "placeholder:text-[var(--fg-faint)] focus:outline-none focus:ring-2",
              error
                ? "border-rose-300 focus:ring-rose-200"
                : "border-[var(--line)] focus:border-[var(--accent)] focus:ring-[var(--accent-soft)]",
              rightSlot ? "pr-28" : "",
              className,
            ].join(" ")}
            {...props}
          />
          {rightSlot && <div className="absolute right-2">{rightSlot}</div>}
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--fg-faint)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";