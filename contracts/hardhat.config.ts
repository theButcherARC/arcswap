import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

/**
 * Hardhat configuration for ArcSwap contracts.
 *
 * Network: Arc Mainnet
 *   Chain ID: 5042
 *   RPC:      https://rpc.mainnet.arc.io
 *   Explorer: https://explorer.arc.io
 *
 * Network: Arc Testnet
 *   Chain ID: 5042002
 *   RPC:      https://rpc.testnet.arc.io
 *   Explorer: https://explorer.testnet.arc.io
 *
 * Set PRIVATE_KEY in your shell or a .env file inside /contracts before deploying.
 * The deployer account needs a small amount of mainnet USDC to pay gas on Arc Mainnet.
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
    arc: {
      url: "https://rpc.mainnet.arc.io",
      chainId: 5042,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    arcTestnet: {
      url: "https://rpc.testnet.arc.io",
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
