import { createConfig, http } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { arcTestnet } from "@/constants/chains";

/**
 * Wagmi configuration.
 *
 * Chain:      Arc Testnet (5042002)
 * RPC:        https://rpc.testnet.arc.network (public, no key needed)
 * Connector:  MetaMask only (MVP scope)
 *
 * WalletConnect can be added post-MVP by importing `walletConnect`
 * from wagmi/connectors and adding it to the connectors array.
 */
export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [
    metaMask(),
  ],
  transports: {
    // RPC is already hardcoded in arcTestnet chain definition.
    // Pass undefined here so wagmi uses the chain's default transport.
    [arcTestnet.id]: http(),
  },
  ssr: true, // Required for Next.js App Router
});
