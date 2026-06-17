// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VibeToken
 * @notice Standard ERC20 token for ArcSwap on Arc Testnet.
 *
 * Features:
 *   - Fixed 18 decimals (ERC20 default)
 *   - Owner-controlled minting (testnet faucet pattern)
 *   - Initial supply minted to deployer on construction
 *
 * This contract is intentionally minimal. Do not add AMM logic,
 * fee-on-transfer, or rebasing here — swap routing uses external liquidity.
 *
 * @dev Deploy via: pnpm deploy:testnet in /contracts
 */
contract VibeToken is ERC20, Ownable {
    /// @notice Initial supply minted to the deployer: 1,000,000 VIBE
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    /// @notice Maximum amount that can be minted per mint() call (testnet safety cap)
    uint256 public constant MINT_CAP = 10_000 * 10 ** 18;

    constructor(address initialOwner)
        ERC20("Vibe Token", "VIBE")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @notice Mint VIBE tokens to any address.
     * @dev Owner only. Capped per call to prevent accidental over-minting.
     * @param to    Recipient address
     * @param amount Amount in wei (18 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(amount <= MINT_CAP, "VibeToken: exceeds mint cap");
        _mint(to, amount);
    }
}
