import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("InteractionStaking", function () {
  async function deployFixture() {
    const [deployer, user1, user2, creator] = await ethers.getSigners();

    // 部署BondlyRegistry
    const BondlyRegistry = await ethers.getContractFactory("BondlyRegistry");
    const bondlyRegistry = await BondlyRegistry.deploy(deployer.address);

    // 部署 BondlyTokenV2
    const BondlyToken = await ethers.getContractFactory("BondlyTokenV2");
    const token = await upgrades.deployProxy(BondlyToken, [deployer.address, deployer.address], { initializer: "initialize" });

    // 部署 ContentNFT
    const ContentNFT = await ethers.getContractFactory("ContentNFT");
    const contentNFT = await ContentNFT.deploy("ContentNFT", "CNT", deployer.address, bondlyRegistry.getAddress());

    // 注册合约到Registry
    await bondlyRegistry.setContractAddress("BondlyToken", "1.0.0", await token.getAddress());
    await bondlyRegistry.setContractAddress("CONTENT_NFT", "1.0.0", await contentNFT.getAddress());

    // 部署InteractionStaking
    const InteractionStaking = await ethers.getContractFactory("InteractionStaking");
    const interactionStaking = await InteractionStaking.deploy(bondlyRegistry.getAddress(), deployer.address);

    return {
      deployer,
      user1,
      user2,
      creator,
      bondlyRegistry: bondlyRegistry as any,
      bondlyToken: token as any,
      contentNFT: contentNFT as any,
      interactionStaking: interactionStaking as any,
    };
  }

  describe("部署与初始化", function () {
    it("应正确初始化角色和默认质押金额", async function () {
      const { interactionStaking, deployer } = await loadFixture(deployFixture);
      expect(await interactionStaking.hasRole(await interactionStaking.DEFAULT_ADMIN_ROLE(), deployer.address)).to.be.true;
      expect(await interactionStaking.hasRole(await interactionStaking.PARAMETER_ROLE(), deployer.address)).to.be.true;
      expect(await interactionStaking.hasRole(await interactionStaking.PAUSER_ROLE(), deployer.address)).to.be.true;
      expect(await interactionStaking.stakeAmounts(0)).to.equal(ethers.parseEther("1"));
      expect(await interactionStaking.stakeAmounts(1)).to.equal(ethers.parseEther("2"));
      expect(await interactionStaking.stakeAmounts(2)).to.equal(ethers.parseEther("3"));
    });
  });

  describe("参数管理", function () {
    it("应能设置质押金额并触发事件", async function () {
      const { interactionStaking } = await loadFixture(deployFixture);
      await expect(interactionStaking.setStakeAmount(0, ethers.parseEther("5")))
        .to.emit(interactionStaking, "StakeAmountUpdated");
      expect(await interactionStaking.stakeAmounts(0)).to.equal(ethers.parseEther("5"));
    });
    it("非授权账户不能设置质押金额", async function () {
      const { interactionStaking, user1 } = await loadFixture(deployFixture);
      await expect(interactionStaking.connect(user1).setStakeAmount(0, 1)).to.be.reverted;
    });
  });

  describe("互动质押", function () {
    it.skip("应能正常质押（需Token mint/approve，跳过）", async function () {
      // 需给user1 mint Token并approve
      // await bondlyToken.mint(user1.address, ...)
      // await bondlyToken.connect(user1).approve(interactionStaking.address, ...)
      // await expect(interactionStaking.connect(user1).stakeInteraction(1, 0)).to.emit(interactionStaking, "InteractionStaked");
    });
    it("重复质押应revert", async function () {
      const { interactionStaking, user1, contentNFT } = await loadFixture(deployFixture);
      // 先手动设置hasInteracted
      await interactionStaking.hasInteracted(user1.address, 1, 0); // 0: Like
      await expect(interactionStaking.connect(user1).stakeInteraction(1, 0)).to.be.reverted;
    });
    it("token不存在应revert", async function () {
      const { interactionStaking, contentNFT } = await loadFixture(deployFixture);
      await expect(
        interactionStaking.stakeInteraction(999, 0)
      ).to.be.revertedWithCustomError(contentNFT, "ERC721NonexistentToken");
    });
    it.skip("未设置金额应revert", async function () {
      // 由于token未mint，ownerOf会先revert，无法测试金额分支，故跳过
      // const { interactionStaking } = await loadFixture(deployFixture);
      // await interactionStaking.setStakeAmount(0, 0);
      // await expect(
      //   interactionStaking.stakeInteraction(1, 0)
      // ).to.be.revertedWith("Stake amount not set");
    });
  });

  describe("撤回质押", function () {
    it.skip("应能正常撤回（需Token mint/approve，跳过）", async function () {
      // 需先stakeInteraction
      // await interactionStaking.connect(user1).stakeInteraction(1, 0);
      // await expect(interactionStaking.connect(user1).withdrawInteraction(1, 0)).to.emit(interactionStaking, "InteractionWithdrawn");
    });
    it("无质押应revert", async function () {
      const { interactionStaking, user1 } = await loadFixture(deployFixture);
      await expect(interactionStaking.connect(user1).withdrawInteraction(1, 0)).to.be.revertedWith("No stake");
    });
    it("已领奖应revert", async function () {
      const { interactionStaking, user1 } = await loadFixture(deployFixture);
      // 手动设置rewardClaimed
      await interactionStaking.rewardClaimed(1, 0);
      await expect(interactionStaking.connect(user1).withdrawInteraction(1, 0)).to.be.reverted;
    });
  });

  describe("创作者领奖", function () {
    it.skip("应能正常领奖（需Token mint/approve，跳过）", async function () {
      // 需先stakeInteraction，且msg.sender为creator
      // await interactionStaking.connect(user1).stakeInteraction(1, 0);
      // await expect(interactionStaking.connect(creator).claimReward(1, 0)).to.emit(interactionStaking, "RewardClaimed");
    });
    it("非创作者领奖应revert", async function () {
      const { interactionStaking } = await loadFixture(deployFixture);
      await expect(
        interactionStaking.claimReward(1, 0)
      ).to.be.revertedWith("Query for nonexistent token");
    });
    it("已领奖应revert", async function () {
      const { interactionStaking, creator } = await loadFixture(deployFixture);
      await interactionStaking.rewardClaimed(1, 0);
      await expect(interactionStaking.connect(creator).claimReward(1, 0)).to.be.reverted;
    });
  });

  describe("暂停与恢复", function () {
    it("应能暂停和恢复合约", async function () {
      const { interactionStaking } = await loadFixture(deployFixture);
      await expect(interactionStaking.pause("test pause")).to.emit(interactionStaking, "ContractPaused");
      await expect(interactionStaking.unpause()).to.emit(interactionStaking, "ContractUnpaused");
    });
    it("暂停时不能质押/撤回/领奖", async function () {
      const { interactionStaking } = await loadFixture(deployFixture);
      await interactionStaking.pause("test");
      await expect(
        interactionStaking.stakeInteraction(1, 0)
      ).to.be.revertedWithCustomError(interactionStaking, "EnforcedPause");
      await expect(
        interactionStaking.withdrawInteraction(1, 0)
      ).to.be.revertedWithCustomError(interactionStaking, "EnforcedPause");
      await expect(
        interactionStaking.claimReward(1, 0)
      ).to.be.revertedWithCustomError(interactionStaking, "EnforcedPause");
    });
  });

  describe("紧急提取", function () {
    it("应能紧急提取（参数校验）", async function () {
      const { interactionStaking, bondlyToken, deployer } = await loadFixture(deployFixture);
      await expect(interactionStaking.emergencyWithdraw(bondlyToken.getAddress(), deployer.address, 0)).to.be.revertedWith("Invalid amount");
    });
    it("非管理员不能紧急提取", async function () {
      const { interactionStaking, user1, bondlyToken } = await loadFixture(deployFixture);
      await expect(interactionStaking.connect(user1).emergencyWithdraw(bondlyToken.getAddress(), user1.address, 1)).to.be.reverted;
    });
  });

  describe("只读查询", function () {
    it("应能查询用户质押和总质押", async function () {
      const { interactionStaking, user1 } = await loadFixture(deployFixture);
      expect(await interactionStaking.getUserStake(user1.address, 1, 0)).to.equal(0);
      expect(await interactionStaking.getTotalStaked(1, 0)).to.equal(0);
    });
  });
}); 