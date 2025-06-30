import { expect } from "chai";
import { ethers } from "hardhat";

describe("Bondly Governance System", function () {
  let bondlyRegistry: any;
  let bondlyToken: any;
  let reputationVault: any;
  let bondlyDAO: any;
  let bondlyVoting: any;
  let bondlyTreasury: any;
  
  let owner: any;
  let user1: any;
  let user2: any;
  let user3: any;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // 部署 BondlyRegistry
    const BondlyRegistry = await ethers.getContractFactory("BondlyRegistry");
    bondlyRegistry = await BondlyRegistry.deploy(owner.address);

    // 部署 BondlyToken
    const BondlyToken = await ethers.getContractFactory("BondlyToken");
    bondlyToken = await BondlyToken.deploy(owner.address);

    // 部署 ReputationVault
    const ReputationVault = await ethers.getContractFactory("ReputationVault");
    reputationVault = await ReputationVault.deploy(owner.address, await bondlyRegistry.getAddress());

    // 注册合约到 Registry
    await bondlyRegistry.setContractAddress("BondlyToken", await bondlyToken.getAddress());
    await bondlyRegistry.setContractAddress("ReputationVault", await reputationVault.getAddress());

    // 部署治理合约
    const BondlyDAO = await ethers.getContractFactory("BondlyDAO");
    bondlyDAO = await BondlyDAO.deploy(owner.address, await bondlyRegistry.getAddress());

    const BondlyVoting = await ethers.getContractFactory("BondlyVoting");
    bondlyVoting = await BondlyVoting.deploy(
      owner.address,
      await bondlyRegistry.getAddress(),
      0 // WeightType.Token
    );

    const BondlyTreasury = await ethers.getContractFactory("BondlyTreasury");
    bondlyTreasury = await BondlyTreasury.deploy(owner.address, await bondlyRegistry.getAddress());

    // 配置合约关系
    await bondlyDAO.updateVotingContract(await bondlyVoting.getAddress());
    await bondlyDAO.updateTreasuryContract(await bondlyTreasury.getAddress());
    await bondlyVoting.updateDAOContract(await bondlyDAO.getAddress());
    await bondlyTreasury.updateDAOContract(await bondlyDAO.getAddress());

    // 设置授权执行者
    await bondlyDAO.setAuthorizedExecutor(owner.address, true);

    // 注册治理合约到 Registry
    await bondlyRegistry.setContractAddress("BondlyDAO", await bondlyDAO.getAddress());
    await bondlyRegistry.setContractAddress("BondlyVoting", await bondlyVoting.getAddress());
    await bondlyRegistry.setContractAddress("BondlyTreasury", await bondlyTreasury.getAddress());

    // 给用户分配代币
    await bondlyToken.transfer(user1.address, ethers.parseEther("1000"));
    await bondlyToken.transfer(user2.address, ethers.parseEther("500"));
    await bondlyToken.transfer(user3.address, ethers.parseEther("200"));

    // 给用户分配声誉分数
    await reputationVault.addReputation(user1.address, 100);
    await reputationVault.addReputation(user2.address, 50);
    await reputationVault.addReputation(user3.address, 20);
  });

  describe("部署验证", function () {
    it("应该正确部署所有合约", async function () {
      expect(await bondlyDAO.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await bondlyVoting.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await bondlyTreasury.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("应该正确配置合约关系", async function () {
      const daoInfo = await bondlyDAO.getContractInfo();
      expect(daoInfo.votingContract).to.equal(await bondlyVoting.getAddress());
      expect(daoInfo.treasuryContract).to.equal(await bondlyTreasury.getAddress());

      const votingInfo = await bondlyVoting.getContractInfo();
      expect(votingInfo.daoAddress).to.equal(await bondlyDAO.getAddress());

      const treasuryInfo = await bondlyTreasury.getContractInfo();
      expect(treasuryInfo.daoAddress).to.equal(await bondlyDAO.getAddress());
    });
  });

  describe("提案生命周期", function () {
    it("应该能够创建提案", async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600, // 3天
        { value: ethers.parseEther("100") }
      );

      expect(await bondlyDAO.proposalCount()).to.equal(1);
      
      const proposal = await bondlyDAO.getProposal(1);
      expect(proposal.proposer).to.equal(user1.address);
      expect(proposal.title).to.equal("测试提案");
      expect(proposal.state).to.equal(0); // Pending
    });

    it("应该能够激活提案", async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      await bondlyDAO.activateProposal(1, 3 * 24 * 3600);

      const proposal = await bondlyDAO.getProposal(1);
      expect(proposal.state).to.equal(1); // Active
      expect(proposal.snapshotBlock).to.be.gt(0);
      expect(proposal.votingDeadline).to.be.gt(0);
    });

    it("应该能够执行通过的提案", async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      await bondlyDAO.activateProposal(1, 3 * 24 * 3600);

      // 投票赞成
      await bondlyVoting.connect(user1).vote(1, true);
      await bondlyVoting.connect(user2).vote(1, true);

      // 等待投票期结束
      await ethers.provider.send("evm_increaseTime", [3 * 24 * 3600 + 1]);
      await ethers.provider.send("evm_mine", []);

      await bondlyDAO.executeProposal(1);

      const proposal = await bondlyDAO.getProposal(1);
      expect(proposal.state).to.equal(2); // Executed
    });
  });

  describe("投票机制", function () {
    beforeEach(async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      await bondlyDAO.activateProposal(1, 3 * 24 * 3600);
    });

    it("应该能够投票", async function () {
      await bondlyVoting.connect(user1).vote(1, true);
      await bondlyVoting.connect(user2).vote(1, false);

      const user1Vote = await bondlyVoting.getUserVote(user1.address, 1);
      const user2Vote = await bondlyVoting.getUserVote(user2.address, 1);

      expect(user1Vote.hasVoted_).to.be.true;
      expect(user2Vote.hasVoted_).to.be.true;
      expect(user1Vote.weight).to.be.gt(0);
      expect(user2Vote.weight).to.be.gt(0);
    });

    it("应该防止重复投票", async function () {
      await bondlyVoting.connect(user1).vote(1, true);
      
      await expect(
        bondlyVoting.connect(user1).vote(1, false)
      ).to.be.revertedWith("Voting: Already voted");
    });

    it("应该正确计算投票权重", async function () {
      await bondlyVoting.connect(user1).vote(1, true);
      await bondlyVoting.connect(user2).vote(1, true);

      const stats = await bondlyVoting.getVoteStats(1);
      expect(stats.yesVotes).to.be.gt(0);
      expect(stats.noVotes).to.equal(0);
    });
  });

  describe("声誉投票", function () {
    beforeEach(async function () {
      // 切换到声誉投票模式
      await bondlyVoting.updateWeightType(1); // WeightType.Reputation

      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      await bondlyDAO.activateProposal(1, 3 * 24 * 3600);
    });

    it("应该基于声誉分数计算投票权重", async function () {
      await bondlyVoting.connect(user1).vote(1, true);
      await bondlyVoting.connect(user2).vote(1, true);

      const user1Weight = await bondlyVoting.getSnapshotWeight(user1.address, 1);
      const user2Weight = await bondlyVoting.getSnapshotWeight(user2.address, 1);

      expect(user1Weight).to.equal(100); // user1 的声誉分数
      expect(user2Weight).to.equal(50);  // user2 的声誉分数
    });
  });

  describe("资金库功能", function () {
    beforeEach(async function () {
      // 向资金库发送一些 ETH
      await owner.sendTransaction({
        to: await bondlyTreasury.getAddress(),
        value: ethers.parseEther("10")
      });
    });

    it("应该能够接收 ETH", async function () {
      const fundsStatus = await bondlyTreasury.getFundsStatus();
      expect(fundsStatus.total).to.equal(ethers.parseEther("10"));
      expect(fundsStatus.available).to.equal(ethers.parseEther("10"));
    });

    it("应该能够执行资金提案", async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("1")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "资金提案",
        "提取资金给用户1",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      await bondlyDAO.activateProposal(1, 3 * 24 * 3600);
      await bondlyVoting.connect(user1).vote(1, true);
      await bondlyVoting.connect(user2).vote(1, true);

      await ethers.provider.send("evm_increaseTime", [3 * 24 * 3600 + 1]);
      await ethers.provider.send("evm_mine", []);

      await bondlyDAO.executeProposal(1);

      const fundsStatus = await bondlyTreasury.getFundsStatus();
      expect(fundsStatus.available).to.equal(ethers.parseEther("9")); // 10 - 1
    });
  });

  describe("权限控制", function () {
    it("只有授权执行者能够激活提案", async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      await expect(
        bondlyDAO.connect(user1).activateProposal(1, 3 * 24 * 3600)
      ).to.be.revertedWith("DAO: Not authorized");
    });

    it("只有 DAO 合约能够调用投票回调", async function () {
      await expect(
        bondlyVoting.connect(user1).startVoting(1, 100, 1000)
      ).to.be.revertedWith("Voting: Only DAO contract");
    });
  });

  describe("提案完整性验证", function () {
    it("应该验证提案数据完整性", async function () {
      const proposalData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [user1.address, ethers.parseEther("10")]
      );

      await bondlyDAO.connect(user1).createProposal(
        "测试提案",
        "这是一个测试提案",
        await bondlyTreasury.getAddress(),
        proposalData,
        3 * 24 * 3600,
        { value: ethers.parseEther("100") }
      );

      const isValid = await bondlyDAO.verifyProposalIntegrity(1);
      expect(isValid).to.be.true;
    });
  });
}); 