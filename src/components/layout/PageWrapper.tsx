interface PageWrapperProps {
  children: React.ReactNode;
  /** Optional page title rendered as an h1 */
  title?: string;
  /** Optional subtitle rendered below the title */
  description?: string;
}

/**
 * Consistent centred page layout with optional title block.
 * Wrap all page content with this to ensure uniform max-width and padding.
 */
export function PageWrapper({ children, title, description }: PageWrapperProps) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-xl font-semibold text-surface-800">{title}</h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-surface-200">{description}</p>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
