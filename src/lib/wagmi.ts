import { createConfig, http } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { SUPPORTED_CHAINS } from "@/constants/chains";

/**
 * Wagmi configuration.
 *
 * Chains:     Arc Testnet, Base Sepolia (testnet), Base Mainnet
 * Connectors: MetaMask
 *
 * WalletConnect can be added post-MVP by importing `walletConnect`
 * from wagmi/connectors and adding it to the connectors array.
 */
export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS as any,
  connectors: [
    metaMask(),
  ],
  transports: SUPPORTED_CHAINS.reduce((acc, chain) => {
    acc[chain.id] = http();
    return acc;
  }, {} as Record<number, any>),
  ssr: true, // Required for Next.js App Router
});
