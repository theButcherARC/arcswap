import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

/**
 * Hardhat configuration for ArcSwap contracts.
 *
 * Network: Arc Testnet
 *   Chain ID: 5042002
 *   RPC:      https://rpc.testnet.arc.network
 *   Explorer: https://explorer.testnet.arc.network
 *
 * Set PRIVATE_KEY in your shell or a .env file inside /contracts before deploying.
 * Never commit a .env file with a real private key.
 */
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: {
    sources: "./src",
    tests: "./test",
    artifacts: "./artifacts",
  },
};

export default config;
