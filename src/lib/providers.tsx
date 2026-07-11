"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { wagmiConfig } from "./wagmi";

/**
 * Providers tree for the entire application.
 *
 * Keeps app/layout.tsx clean — only one import needed there.
 * Order matters: WagmiProvider must wrap QueryClientProvider.
 *
 * The QueryClient is instantiated once per module load (singleton pattern
 * safe for client components). Do NOT move this inside the component body
 * or it will be recreated on every render.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable automatic background refetching for on-chain data —
      // wagmi manages its own staleness for contract reads.
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
          expand
        />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
