export function Footer() {
  return (
    <footer className="border-t border-surface-100 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 text-center text-xs text-surface-300">
        <span>VibeFlow — Arc Testnet · For testing purposes only</span>
        <span>
          Built on Arc by{" "}
          <a href="https://x.com/The_Last_Dip" target="_blank" rel="noopener noreferrer" className="font-medium text-arc-600 hover:text-arc-700 hover:underline transition-colors">
            Butcher
          </a>
        </span>
      </div>
    </footer>
  );
}