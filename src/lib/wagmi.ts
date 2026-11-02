import { createConfig, http } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { arc, arcTestnet } from "@/constants/chains";

/**
 * Wagmi configuration.
 *
 * Chains:     Arc Mainnet (5042, default), Arc Testnet (5042002)
 * RPC:        https://rpc.mainnet.arc.io / https://rpc.testnet.arc.io (public, no key needed)
 * Connectors: MetaMask first, generic injected wallet as fallback
 *
 * WalletConnect can be added post-MVP by importing `walletConnect`
 * from wagmi/connectors and adding it to the connectors array.
 */
export const wagmiConfig = createConfig({
  chains: [arc, arcTestnet],
  connectors: [
    metaMask(),
    // Fallback: any other injected wallet (OKX, Rabby, Trust, Coinbase
    // Wallet extension). Without this, a visitor whose wallet is not
    // MetaMask clicks Connect and silently nothing happens.
    injected(),
  ],
  transports: {
    // RPCs are already hardcoded in the chain definitions.
    // Pass undefined here so wagmi uses each chain's default transport.
    [arc.id]: http(),
    [arcTestnet.id]: http(),
  },
  ssr: true, // Required for Next.js App Router
});
