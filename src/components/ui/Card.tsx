interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={[
        "rounded-3xl border border-surface-100 bg-white p-6 shadow-premium-lg",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={["mb-5 flex items-center justify-between", className].join(" ")}>
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-arc-900">{children}</h2>;
}