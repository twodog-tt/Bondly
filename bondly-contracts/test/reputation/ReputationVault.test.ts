import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ReputationVault", function () {
  // 测试数据结构
  interface TestContext {
    reputationVault: any;
    mockRegistry: any;
    owner: Signer;
    user1: Signer;
    user2: Signer;
    authorizedSource: Signer;
    unauthorizedSource: Signer;
    ownerAddress: string;
    user1Address: string;
    user2Address: string;
    authorizedSourceAddress: string;
    unauthorizedSourceAddress: string;
  }

  // 测试夹具
  async function deployReputationVaultFixture(): Promise<TestContext> {
    const [owner, user1, user2, authorizedSource, unauthorizedSource] = await ethers.getSigners();

    // 部署真实BondlyRegistry
    const BondlyRegistry = await ethers.getContractFactory("BondlyRegistry");
    const registry = await BondlyRegistry.deploy(owner.address);
    // 注册合约到Registry（如有需要）
    // await registry.setContractAddress("SomeContract", "1.0.0", someAddress);
    // 部署ReputationVault
    const ReputationVault = await ethers.getContractFactory("ReputationVault");
    const reputationVault = await ReputationVault.deploy(await registry.getAddress(), owner.address);

    return {
      reputationVault,
      mockRegistry: registry,
      owner,
      user1,
      user2,
      authorizedSource,
      unauthorizedSource,
      ownerAddress: await owner.getAddress(),
      user1Address: await user1.getAddress(),
      user2Address: await user2.getAddress(),
      authorizedSourceAddress: await authorizedSource.getAddress(),
      unauthorizedSourceAddress: await unauthorizedSource.getAddress(),
    };
  }

  describe("构造函数和初始化", function () {
    it("应该正确设置registry地址和owner", async function () {
      const { reputationVault, mockRegistry, ownerAddress } = await loadFixture(deployReputationVaultFixture);

      expect(await reputationVault.registry()).to.equal(await mockRegistry.getAddress());
      expect(await reputationVault.owner()).to.equal(ownerAddress);
    });

    it("初始声誉分数应该为0", async function () {
      const { reputationVault, user1Address } = await loadFixture(deployReputationVaultFixture);

      expect(await reputationVault.getReputation(user1Address)).to.equal(0);
    });
  });

  describe("可信来源管理", function () {
    it("owner应该能够设置可信来源", async function () {
      const { reputationVault, owner, authorizedSourceAddress } = await loadFixture(deployReputationVaultFixture);

      await reputationVault.connect(owner).setReputationSource(authorizedSourceAddress, true);
      expect(await reputationVault.isReputationSource(authorizedSourceAddress)).to.be.true;
    });

    it("owner应该能够移除可信来源", async function () {
      const { reputationVault, owner, authorizedSourceAddress } = await loadFixture(deployReputationVaultFixture);

      // 先设置为可信来源
      await reputationVault.connect(owner).setReputationSource(authorizedSourceAddress, true);
      expect(await reputationVault.isReputationSource(authorizedSourceAddress)).to.be.true;

      // 再移除可信来源
      await reputationVault.connect(owner).setReputationSource(authorizedSourceAddress, false);
      expect(await reputationVault.isReputationSource(authorizedSourceAddress)).to.be.false;
    });

    it("非owner不能设置可信来源", async function () {
      const { reputationVault, user1, authorizedSourceAddress } = await loadFixture(deployReputationVaultFixture);

      await expect(
        reputationVault.connect(user1).setReputationSource(authorizedSourceAddress, true)
      ).to.be.revertedWithCustomError(reputationVault, "OwnableUnauthorizedAccount");
    });

    it("应该能够设置多个可信来源", async function () {
      const { reputationVault, owner, user1, user2 } = await loadFixture(deployReputationVaultFixture);

      const source1 = await user1.getAddress();
      const source2 = await user2.getAddress();

      await reputationVault.connect(owner).setReputationSource(source1, true);
      await reputationVault.connect(owner).setReputationSource(source2, true);

      expect(await reputationVault.isReputationSource(source1)).to.be.true;
      expect(await reputationVault.isReputationSource(source2)).to.be.true;
    });
  });

  describe("声誉分数增加", function () {
    it("可信来源应该能够增加用户声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 增加声誉
      const amount = 100;
      await reputationVault.connect(authorizedSource).addReputation(user1Address, amount);

      expect(await reputationVault.getReputation(user1Address)).to.equal(amount);
    });

    it("非可信来源不能增加用户声誉", async function () {
      const { reputationVault, unauthorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      await expect(
        reputationVault.connect(unauthorizedSource).addReputation(user1Address, 100)
      ).to.be.revertedWith("Not authorized source");
    });

    it("应该能够多次增加声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 多次增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 200);
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 300);

      expect(await reputationVault.getReputation(user1Address)).to.equal(600);
    });

    it("应该能够为多个用户增加声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address, user2Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 为多个用户增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);
      await reputationVault.connect(authorizedSource).addReputation(user2Address, 200);

      expect(await reputationVault.getReputation(user1Address)).to.equal(100);
      expect(await reputationVault.getReputation(user2Address)).to.equal(200);
    });

    it("增加0分声誉应该正常工作", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加一些声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);
      
      // 再增加0分
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 0);

      expect(await reputationVault.getReputation(user1Address)).to.equal(100);
    });
  });

  describe("声誉分数减少", function () {
    it("可信来源应该能够减少用户声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);

      // 再减少声誉
      const subtractAmount = 30;
      await reputationVault.connect(authorizedSource).subtractReputation(user1Address, subtractAmount);

      expect(await reputationVault.getReputation(user1Address)).to.equal(70);
    });

    it("非可信来源不能减少用户声誉", async function () {
      const { reputationVault, unauthorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      await expect(
        reputationVault.connect(unauthorizedSource).subtractReputation(user1Address, 100)
      ).to.be.revertedWith("Not authorized source");
    });

    it("减少超过当前声誉时应该设为0", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);

      // 减少超过当前声誉
      await reputationVault.connect(authorizedSource).subtractReputation(user1Address, 150);

      expect(await reputationVault.getReputation(user1Address)).to.equal(0);
    });

    it("减少0分声誉应该正常工作", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);

      // 减少0分
      await reputationVault.connect(authorizedSource).subtractReputation(user1Address, 0);

      expect(await reputationVault.getReputation(user1Address)).to.equal(100);
    });

    it("从0声誉减少应该保持为0", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 从0声誉减少
      await reputationVault.connect(authorizedSource).subtractReputation(user1Address, 50);

      expect(await reputationVault.getReputation(user1Address)).to.equal(0);
    });
  });

  describe("声誉分数查询", function () {
    it("应该能正确查询用户声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 增加声誉
      const amount = 250;
      await reputationVault.connect(authorizedSource).addReputation(user1Address, amount);

      // 查询声誉
      expect(await reputationVault.getReputation(user1Address)).to.equal(amount);
    });

    it("查询不存在的用户应该返回0", async function () {
      const { reputationVault, user1Address } = await loadFixture(deployReputationVaultFixture);

      expect(await reputationVault.getReputation(user1Address)).to.equal(0);
    });

    it("应该能查询多个用户的声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address, user2Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 为不同用户设置不同声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);
      await reputationVault.connect(authorizedSource).addReputation(user2Address, 200);

      // 查询多个用户声誉
      expect(await reputationVault.getReputation(user1Address)).to.equal(100);
      expect(await reputationVault.getReputation(user2Address)).to.equal(200);
    });
  });

  describe("事件触发", function () {
    it("增加声誉时应该触发ReputationAdded事件", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 增加声誉并检查事件
      const amount = 150;
      await expect(reputationVault.connect(authorizedSource).addReputation(user1Address, amount))
        .to.emit(reputationVault, "ReputationAdded")
        .withArgs(user1Address, amount);
    });

    it("减少声誉时应该触发ReputationSubtracted事件", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);

      // 减少声誉并检查事件
      const subtractAmount = 30;
      await expect(reputationVault.connect(authorizedSource).subtractReputation(user1Address, subtractAmount))
        .to.emit(reputationVault, "ReputationSubtracted")
        .withArgs(user1Address, subtractAmount);
    });

    it("减少超过当前声誉时应该触发正确的事件", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);

      // 减少超过当前声誉并检查事件
      const subtractAmount = 150;
      await expect(reputationVault.connect(authorizedSource).subtractReputation(user1Address, subtractAmount))
        .to.emit(reputationVault, "ReputationSubtracted")
        .withArgs(user1Address, subtractAmount);
    });
  });

  describe("边界情况", function () {
    it("应该能处理大数值的声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 使用大数值
      const largeAmount = ethers.parseEther("1000000"); // 100万
      await reputationVault.connect(authorizedSource).addReputation(user1Address, largeAmount);

      expect(await reputationVault.getReputation(user1Address)).to.equal(largeAmount);
    });

    it("应该能处理零地址用户", async function () {
      const { reputationVault, owner, authorizedSource } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      const zeroAddress = ethers.ZeroAddress;
      
      // 为零地址增加声誉
      await reputationVault.connect(authorizedSource).addReputation(zeroAddress, 100);
      expect(await reputationVault.getReputation(zeroAddress)).to.equal(100);

      // 为零地址减少声誉
      await reputationVault.connect(authorizedSource).subtractReputation(zeroAddress, 50);
      expect(await reputationVault.getReputation(zeroAddress)).to.equal(50);
    });

    it("移除可信来源后不能操作声誉", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 先增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);

      // 移除可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), false);

      // 不能再操作声誉
      await expect(
        reputationVault.connect(authorizedSource).addReputation(user1Address, 50)
      ).to.be.revertedWith("Not authorized source");

      await expect(
        reputationVault.connect(authorizedSource).subtractReputation(user1Address, 30)
      ).to.be.revertedWith("Not authorized source");
    });
  });

  describe("权限控制", function () {
    it("只有owner能设置可信来源", async function () {
      const { reputationVault, user1, user2 } = await loadFixture(deployReputationVaultFixture);

      const sourceAddress = await user1.getAddress();

      // 非owner不能设置
      await expect(
        reputationVault.connect(user1).setReputationSource(sourceAddress, true)
      ).to.be.revertedWithCustomError(reputationVault, "OwnableUnauthorizedAccount");

      await expect(
        reputationVault.connect(user2).setReputationSource(sourceAddress, true)
      ).to.be.revertedWithCustomError(reputationVault, "OwnableUnauthorizedAccount");
    });

    it("只有可信来源能操作声誉", async function () {
      const { reputationVault, user1, user2 } = await loadFixture(deployReputationVaultFixture);

      const userAddress = await user1.getAddress();

      // 非可信来源不能操作
      await expect(
        reputationVault.connect(user1).addReputation(userAddress, 100)
      ).to.be.revertedWith("Not authorized source");

      await expect(
        reputationVault.connect(user2).subtractReputation(userAddress, 50)
      ).to.be.revertedWith("Not authorized source");
    });
  });

  describe("集成测试", function () {
    it("完整的声誉管理流程", async function () {
      const { reputationVault, owner, authorizedSource, user1Address } = await loadFixture(deployReputationVaultFixture);

      // 1. 设置可信来源
      await reputationVault.connect(owner).setReputationSource(await authorizedSource.getAddress(), true);

      // 2. 增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 100);
      expect(await reputationVault.getReputation(user1Address)).to.equal(100);

      // 3. 再次增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 200);
      expect(await reputationVault.getReputation(user1Address)).to.equal(300);

      // 4. 减少声誉
      await reputationVault.connect(authorizedSource).subtractReputation(user1Address, 50);
      expect(await reputationVault.getReputation(user1Address)).to.equal(250);

      // 5. 减少到0
      await reputationVault.connect(authorizedSource).subtractReputation(user1Address, 250);
      expect(await reputationVault.getReputation(user1Address)).to.equal(0);

      // 6. 再次增加声誉
      await reputationVault.connect(authorizedSource).addReputation(user1Address, 500);
      expect(await reputationVault.getReputation(user1Address)).to.equal(500);
    });

    it("多用户多来源的复杂场景", async function () {
      const { reputationVault, owner, user1, user2, authorizedSource } = await loadFixture(deployReputationVaultFixture);

      const source1 = await user1.getAddress();
      const source2 = await user2.getAddress();
      const userAddress = await authorizedSource.getAddress();

      // 设置多个可信来源
      await reputationVault.connect(owner).setReputationSource(source1, true);
      await reputationVault.connect(owner).setReputationSource(source2, true);

      // 不同来源为同一用户增加声誉
      await reputationVault.connect(user1).addReputation(userAddress, 100);
      await reputationVault.connect(user2).addReputation(userAddress, 200);

      expect(await reputationVault.getReputation(userAddress)).to.equal(300);

      // 不同来源为同一用户减少声誉
      await reputationVault.connect(user1).subtractReputation(userAddress, 50);
      await reputationVault.connect(user2).subtractReputation(userAddress, 100);

      expect(await reputationVault.getReputation(userAddress)).to.equal(150);
    });
  });
}); 