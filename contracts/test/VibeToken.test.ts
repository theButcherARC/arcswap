import { expect } from "chai";
import { ethers } from "hardhat";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { VibeToken } from "../artifacts/src/VibeToken.sol/VibeToken";

describe("VibeToken", () => {
  let vibe: VibeToken;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const MINT_CAP = ethers.parseEther("10000");

  beforeEach(async () => {
    [owner, alice] = await ethers.getSigners();
    const VibeFactory = await ethers.getContractFactory("VibeToken");
    vibe = (await VibeFactory.deploy(owner.address)) as unknown as VibeToken;
    await vibe.waitForDeployment();
  });

  describe("Deployment", () => {
    it("sets the correct name and symbol", async () => {
      expect(await vibe.name()).to.equal("Vibe Token");
      expect(await vibe.symbol()).to.equal("VIBE");
    });

    it("mints initial supply to the deployer", async () => {
      expect(await vibe.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("sets the owner correctly", async () => {
      expect(await vibe.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", () => {
    it("allows owner to mint within cap", async () => {
      await vibe.mint(alice.address, MINT_CAP);
      expect(await vibe.balanceOf(alice.address)).to.equal(MINT_CAP);
    });

    it("reverts when mint amount exceeds cap", async () => {
      const overCap = MINT_CAP + 1n;
      await expect(vibe.mint(alice.address, overCap)).to.be.revertedWith(
        "VibeToken: exceeds mint cap"
      );
    });

    it("reverts when non-owner tries to mint", async () => {
      await expect(
        vibe.connect(alice).mint(alice.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(vibe, "OwnableUnauthorizedAccount");
    });
  });

  describe("Transfers", () => {
    it("allows standard ERC20 transfer", async () => {
      const amount = ethers.parseEther("100");
      await vibe.transfer(alice.address, amount);
      expect(await vibe.balanceOf(alice.address)).to.equal(amount);
    });

    it("allows approve and transferFrom", async () => {
      const amount = ethers.parseEther("50");
      await vibe.approve(alice.address, amount);
      await vibe.connect(alice).transferFrom(owner.address, alice.address, amount);
      expect(await vibe.balanceOf(alice.address)).to.equal(amount);
    });
  });
});
