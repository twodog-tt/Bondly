import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { upgrades } from "hardhat";

describe("MixedTokenReputationStrategy", function () {
  let strategy: any;
  let registry: any;
  let token: any;
  let reputationVault: any;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let user3: Signer;
  let ownerAddress: string;
  let user1Address: string;
  let user2Address: string;
  let user3Address: string;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    user1Address = await user1.getAddress();
    user2Address = await user2.getAddress();
    user3Address = await user3.getAddress();

    // Deploy BondlyRegistry
    const BondlyRegistry = await ethers.getContractFactory("BondlyRegistry");
    registry = await BondlyRegistry.deploy(ownerAddress);

    // Deploy BondlyToken
    const BondlyToken = await ethers.getContractFactory("BondlyTokenV2");
    token = await upgrades.deployProxy(BondlyToken, [ownerAddress, ownerAddress], { initializer: "initialize" });

    // Deploy ReputationVault
    const ReputationVault = await ethers.getContractFactory("ReputationVault");
    reputationVault = await ReputationVault.deploy(await registry.getAddress(), ownerAddress);

    // Register contracts in registry
    await registry.setContractAddress("BondlyToken", "v1", await token.getAddress());
    await registry.setContractAddress("ReputationVault", "v1", await reputationVault.getAddress());

    // Deploy MixedTokenReputationStrategy
    const MixedTokenReputationStrategy = await ethers.getContractFactory("MixedTokenReputationStrategy");
    strategy = await MixedTokenReputationStrategy.deploy(await registry.getAddress());
  });

  describe("部署和初始化", function () {
    it("应该正确部署合约", async function () {
      expect(await strategy.owner()).to.equal(ownerAddress);
      expect(await strategy.registry()).to.equal(await registry.getAddress());
      expect(await strategy.tokenWeightRatio()).to.equal(50);
    });

    it("应该拒绝零地址的registry", async function () {
      const MixedTokenReputationStrategy = await ethers.getContractFactory("MixedTokenReputationStrategy");
      await expect(
        MixedTokenReputationStrategy.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("No registry");
    });
  });

  describe("Token权重比例管理", function () {
    it("owner应该能够设置token权重比例", async function () {
      await strategy.setTokenWeightRatio(30);
      expect(await strategy.tokenWeightRatio()).to.equal(30);
    });

    it("owner应该能够设置token权重比例为0", async function () {
      await strategy.setTokenWeightRatio(0);
      expect(await strategy.tokenWeightRatio()).to.equal(0);
    });

    it("owner应该能够设置token权重比例为100", async function () {
      await strategy.setTokenWeightRatio(100);
      expect(await strategy.tokenWeightRatio()).to.equal(100);
    });

    it("非owner不能设置token权重比例", async function () {
      await expect(
        strategy.connect(user1).setTokenWeightRatio(30)
      ).to.be.revertedWith("Not owner");
    });

    it("不能设置超过100的权重比例", async function () {
      await expect(
        strategy.setTokenWeightRatio(101)
      ).to.be.revertedWith("Ratio 0~100");
    });
  });

  describe("Token余额查询", function () {
    it("应该正确获取用户的token余额", async function () {
      const balance = await strategy.getTokenAt(user1Address, 0);
      expect(balance).to.equal(0); // 初始余额为0
    });

    it("应该处理快照区块参数（当前实现忽略快照）", async function () {
      const balance1 = await strategy.getTokenAt(user1Address, 0);
      const balance2 = await strategy.getTokenAt(user1Address, 1000);
      expect(balance1).to.equal(balance2);
    });

    it("应该处理零地址用户", async function () {
      const balance = await strategy.getTokenAt(ethers.ZeroAddress, 0);
      expect(balance).to.equal(0);
    });
  });

  describe("声誉分数查询", function () {
    it("应该正确获取用户的声誉分数", async function () {
      const reputation = await strategy.getReputationAt(user1Address, 0);
      expect(reputation).to.equal(0); // 初始声誉为0
    });

    it("应该处理快照区块参数（当前实现忽略快照）", async function () {
      const rep1 = await strategy.getReputationAt(user1Address, 0);
      const rep2 = await strategy.getReputationAt(user1Address, 1000);
      expect(rep1).to.equal(rep2);
    });

    it("应该处理零地址用户", async function () {
      const reputation = await strategy.getReputationAt(ethers.ZeroAddress, 0);
      expect(reputation).to.equal(0);
    });
  });

  describe("投票权重计算", function () {
    it("应该使用默认权重比例(50:50)计算权重", async function () {
      const weight = await strategy.getVotingWeightAt(user1Address, 1, 0);
      // (0 * 50 + 0 * 50) / 100 = 0
      expect(weight).to.equal(0);
    });

    it("应该使用自定义权重比例计算权重", async function () {
      await strategy.setTokenWeightRatio(70);
      const weight = await strategy.getVotingWeightAt(user1Address, 1, 0);
      // (0 * 70 + 0 * 30) / 100 = 0
      expect(weight).to.equal(0);
    });

    it("应该处理纯token权重(100:0)", async function () {
      await strategy.setTokenWeightRatio(100);
      const weight = await strategy.getVotingWeightAt(user1Address, 1, 0);
      // (0 * 100 + 0 * 0) / 100 = 0
      expect(weight).to.equal(0);
    });

    it("应该处理纯声誉权重(0:100)", async function () {
      await strategy.setTokenWeightRatio(0);
      const weight = await strategy.getVotingWeightAt(user1Address, 1, 0);
      // (0 * 0 + 0 * 100) / 100 = 0
      expect(weight).to.equal(0);
    });

    it("应该忽略proposalId参数", async function () {
      const weight1 = await strategy.getVotingWeightAt(user1Address, 1, 0);
      const weight2 = await strategy.getVotingWeightAt(user1Address, 999, 0);
      expect(weight1).to.equal(weight2);
    });

    it("应该处理快照区块参数（当前实现忽略快照）", async function () {
      const weight1 = await strategy.getVotingWeightAt(user1Address, 1, 0);
      const weight2 = await strategy.getVotingWeightAt(user1Address, 1, 1000);
      expect(weight1).to.equal(weight2);
    });
  });

  describe("边界情况和错误处理", function () {
    it("应该处理权重比例变更后的重新计算", async function () {
      // 测试权重比例变更逻辑
      await strategy.setTokenWeightRatio(30);
      expect(await strategy.tokenWeightRatio()).to.equal(30);
      
      await strategy.setTokenWeightRatio(80);
      expect(await strategy.tokenWeightRatio()).to.equal(80);
      
      const weight = await strategy.getVotingWeightAt(user1Address, 1, 0);
      expect(weight).to.equal(0); // 仍然为0，因为没有token和声誉
    });
  });

  describe("权限控制", function () {
    it("只有owner可以设置token权重比例", async function () {
      await expect(
        strategy.connect(user1).setTokenWeightRatio(30)
      ).to.be.revertedWith("Not owner");
      
      await expect(
        strategy.connect(user2).setTokenWeightRatio(70)
      ).to.be.revertedWith("Not owner");
    });

    it("owner可以多次设置权重比例", async function () {
      await strategy.setTokenWeightRatio(30);
      expect(await strategy.tokenWeightRatio()).to.equal(30);
      
      await strategy.setTokenWeightRatio(70);
      expect(await strategy.tokenWeightRatio()).to.equal(70);
      
      await strategy.setTokenWeightRatio(0);
      expect(await strategy.tokenWeightRatio()).to.equal(0);
    });
  });

  describe("事件和状态查询", function () {
    it("应该正确返回合约状态", async function () {
      expect(await strategy.owner()).to.equal(ownerAddress);
      expect(await strategy.registry()).to.equal(await registry.getAddress());
      expect(await strategy.tokenWeightRatio()).to.equal(50);
    });

    it("应该支持IVotingWeightStrategy接口", async function () {
      // 测试接口方法存在
      expect(typeof strategy.getVotingWeightAt).to.equal("function");
      expect(typeof strategy.getTokenAt).to.equal("function");
      expect(typeof strategy.getReputationAt).to.equal("function");
    });
  });
}); 