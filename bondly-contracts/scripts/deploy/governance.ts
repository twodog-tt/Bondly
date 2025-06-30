import { ethers } from "hardhat";

async function main() {
  console.log("🚀 开始部署 Bondly 治理系统...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);

  // 获取 BondlyRegistry 合约地址
  const registryAddress = process.env.BONDLY_REGISTRY_ADDRESS;
  if (!registryAddress) {
    throw new Error("❌ 请设置 BONDLY_REGISTRY_ADDRESS 环境变量");
  }

  console.log("📋 BondlyRegistry 地址:", registryAddress);

  // 部署 BondlyDAO 合约
  console.log("\n📋 部署 BondlyDAO 合约...");
  const BondlyDAOFactory = await ethers.getContractFactory("BondlyDAO");
  const daoContract = await BondlyDAOFactory.deploy(deployer.address, registryAddress);
  await daoContract.waitForDeployment();
  const daoAddress = await daoContract.getAddress();
  console.log("✅ BondlyDAO 已部署:", daoAddress);

  // 部署 BondlyVoting 合约
  console.log("\n📋 部署 BondlyVoting 合约...");
  const BondlyVotingFactory = await ethers.getContractFactory("BondlyVoting");
  const votingContract = await BondlyVotingFactory.deploy(
    deployer.address,
    registryAddress,
    0 // WeightType.Token
  );
  await votingContract.waitForDeployment();
  const votingAddress = await votingContract.getAddress();
  console.log("✅ BondlyVoting 已部署:", votingAddress);

  // 部署 BondlyTreasury 合约
  console.log("\n📋 部署 BondlyTreasury 合约...");
  const BondlyTreasuryFactory = await ethers.getContractFactory("BondlyTreasury");
  const treasuryContract = await BondlyTreasuryFactory.deploy(deployer.address, registryAddress);
  await treasuryContract.waitForDeployment();
  const treasuryAddress = await treasuryContract.getAddress();
  console.log("✅ BondlyTreasury 已部署:", treasuryAddress);

  // 更新 BondlyRegistry
  console.log("\n📋 更新 BondlyRegistry...");
  const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
  
  // 注册治理合约
  const daoTx = await registry.setContractAddress("BondlyDAO", daoAddress);
  await daoTx.wait();
  console.log("✅ BondlyDAO 已注册到 Registry");

  const votingTx = await registry.setContractAddress("BondlyVoting", votingAddress);
  await votingTx.wait();
  console.log("✅ BondlyVoting 已注册到 Registry");

  const treasuryTx = await registry.setContractAddress("BondlyTreasury", treasuryAddress);
  await treasuryTx.wait();
  console.log("✅ BondlyTreasury 已注册到 Registry");

  // 配置合约间关系
  console.log("\n📋 配置合约间关系...");
  
  // 设置 DAO 合约的投票和资金库合约
  const daoSetVotingTx = await daoContract.updateVotingContract(votingAddress);
  await daoSetVotingTx.wait();
  console.log("✅ DAO 合约已设置 Voting 合约");

  const daoSetTreasuryTx = await daoContract.updateTreasuryContract(treasuryAddress);
  await daoSetTreasuryTx.wait();
  console.log("✅ DAO 合约已设置 Treasury 合约");

  // 设置 Voting 合约的 DAO 合约
  const votingSetDaoTx = await votingContract.updateDAOContract(daoAddress);
  await votingSetDaoTx.wait();
  console.log("✅ Voting 合约已设置 DAO 合约");

  // 设置 Treasury 合约的 DAO 合约
  const treasurySetDaoTx = await treasuryContract.updateDAOContract(daoAddress);
  await treasurySetDaoTx.wait();
  console.log("✅ Treasury 合约已设置 DAO 合约");

  // 设置授权执行者
  console.log("\n📋 设置授权执行者...");
  const setExecutorTx = await daoContract.setAuthorizedExecutor(deployer.address, true);
  await setExecutorTx.wait();
  console.log("✅ 部署者已设置为授权执行者");

  // 验证部署
  console.log("\n🔍 验证部署...");
  
  const daoInfo = await daoContract.getContractInfo();
  console.log("📊 DAO 合约信息:");
  console.log("  - 投票合约:", daoInfo.votingContract);
  console.log("  - 资金库合约:", daoInfo.treasuryContract);
  console.log("  - 最小提案押金:", ethers.formatEther(daoInfo.minProposalDeposit), "BOND");
  console.log("  - 最小投票期:", daoInfo.minVotingPeriod.toString(), "秒");
  console.log("  - 最大投票期:", daoInfo.maxVotingPeriod.toString(), "秒");

  const votingInfo = await votingContract.getContractInfo();
  console.log("📊 Voting 合约信息:");
  console.log("  - DAO 合约:", votingInfo.daoAddress);
  console.log("  - 权重类型:", votingInfo.currentWeightType === 0 ? "Token" : "Reputation");
  console.log("  - 代币地址:", votingInfo.tokenAddress);
  console.log("  - 声誉地址:", votingInfo.reputationAddress);

  const treasuryInfo = await treasuryContract.getContractInfo();
  console.log("📊 Treasury 合约信息:");
  console.log("  - DAO 合约:", treasuryInfo.daoAddress);
  console.log("  - 总资金:", ethers.formatEther(treasuryInfo.totalFunds_), "ETH");
  console.log("  - 可用资金:", ethers.formatEther(treasuryInfo.availableFunds_), "ETH");
  console.log("  - 最小提案金额:", ethers.formatEther(treasuryInfo.minAmount), "BOND");
  console.log("  - 最大提案金额:", ethers.formatEther(treasuryInfo.maxAmount), "BOND");

  console.log("\n🎉 Bondly 治理系统部署完成!");
  console.log("\n📋 部署摘要:");
  console.log("  BondlyDAO:", daoAddress);
  console.log("  BondlyVoting:", votingAddress);
  console.log("  BondlyTreasury:", treasuryAddress);
  console.log("  BondlyRegistry:", registryAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 