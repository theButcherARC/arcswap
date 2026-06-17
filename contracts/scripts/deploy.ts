import { ethers } from "hardhat";

/**
 * Deploy script for VibeToken on Arc Testnet.
 *
 * Usage:
 *   cd contracts
 *   pnpm deploy:testnet
 *
 * After deploying:
 *   1. Copy the printed contract address.
 *   2. Set NEXT_PUBLIC_VIBE_TOKEN_ADDRESS in .env.local (frontend root).
 *   3. Record the address in MASTER_CONTEXT.md contract table.
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying VibeToken with account:", deployer.address);
  console.log(
    "Account balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  const VibeFactory = await ethers.getContractFactory("VibeToken");
  const vibe = await VibeFactory.deploy(deployer.address);
  await vibe.waitForDeployment();

  const address = await vibe.getAddress();

  console.log("\n✅ VibeToken deployed successfully");
  console.log("   Address:  ", address);
  console.log("   Owner:    ", deployer.address);
  console.log("\nNext step: set NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
