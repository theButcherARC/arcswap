import { ERC20_ABI } from "./erc20.abi";

/**
 * VIBE token ABI.
 * Extends the standard ERC20 ABI with VIBE-specific functions.
 *
 * TODO: Regenerate this from the compiled Hardhat artifact after deployment:
 *   cp contracts/artifacts/src/VibeToken.sol/VibeToken.json src/contracts/abis/
 * Then export the `abi` field from that JSON here for accuracy.
 */
export const VIBE_TOKEN_ABI = [
  ...ERC20_ABI,
  // VIBE-specific: mint (owner only)
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  // VIBE-specific: owner
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;
