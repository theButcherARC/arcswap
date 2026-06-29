import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Deploy Disperse contract to Arc Testnet.
 *
 * Usage:
 *   cd contracts
 *   pnpm deploy:disperse
 *
 * After deploying:
 *   1. Copy the printed address
 *   2. Set NEXT_PUBLIC_DISPERSE_ADDRESS in .env.local (frontend)
 *   3. Set NEXT_PUBLIC_DISPERSE_ADDRESS in Vercel environment variables
 *   4. Record in MASTER_CONTEXT.md
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying Disperse with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatUnits(
      await ethers.provider.getBalance(deployer.address),
      6 // Arc Testnet native USDC is 6 decimals
    ),
    "USDC"
  );

  const DisperseFactory = await ethers.getContractFactory("Disperse");
  const disperse = await DisperseFactory.deploy();
  await disperse.waitForDeployment();

  const address = await disperse.getAddress();

  console.log("\n Disperse deployed successfully");
  console.log("   Address:  ", address);
  console.log("   Network:  Arc Testnet (chainId 5042002)");
  console.log("\nNext step:");
  console.log("  NEXT_PUBLIC_DISPERSE_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});