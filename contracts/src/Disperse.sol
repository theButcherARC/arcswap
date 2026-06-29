// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Disperse
 * @notice Disperses ERC20 tokens to multiple recipients in one transaction.
 *
 * Flow:
 *   1. User approves this contract for totalAmount
 *   2. User calls disperseToken() with recipients + amounts
 *   3. Contract pulls tokens from user and sends to each recipient
 *
 * No owner, no fees, no upgradability — pure utility contract.
 */
contract Disperse {
    using SafeERC20 for IERC20;

    /// @notice Maximum recipients per call (matches UI limit)
    uint256 public constant MAX_RECIPIENTS = 10;

    event Dispersed(
        address indexed token,
        address indexed sender,
        uint256 totalAmount,
        uint256 recipientCount
    );

    /**
     * @notice Disperse ERC20 tokens to multiple recipients.
     * @param token     ERC20 token address
     * @param recipients Array of recipient addresses
     * @param amounts    Array of amounts (same index as recipients)
     */
    function disperseToken(
        IERC20 token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length > 0, "Disperse: no recipients");
        require(recipients.length <= MAX_RECIPIENTS, "Disperse: too many recipients");
        require(recipients.length == amounts.length, "Disperse: length mismatch");

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Disperse: zero amount");
            require(recipients[i] != address(0), "Disperse: zero address");
            total += amounts[i];
        }

        token.safeTransferFrom(msg.sender, address(this), total);

        for (uint256 i = 0; i < recipients.length; i++) {
            token.safeTransfer(recipients[i], amounts[i]);
        }

        emit Dispersed(address(token), msg.sender, total, recipients.length);
    }
}