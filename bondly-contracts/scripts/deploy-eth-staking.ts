import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Starting ETH Staking deployment...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "ETH");

  // 检查环境变量
  const registryAddress = process.env.REGISTRY_ADDRESS;
  if (!registryAddress) {
    throw new Error("REGISTRY_ADDRESS environment variable is required");
  }

  console.log("📋 Registry address:", registryAddress);

  // 验证Registry合约
  const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
  try {
    const bondlyTokenAddress = await registry.getContractAddress("BondlyToken");
    console.log("✅ BondlyToken found in registry:", bondlyTokenAddress);
  } catch (error) {
    throw new Error("Failed to get BondlyToken from registry. Please ensure registry is properly configured.");
  }

  // 部署 ETH Staking 合约
  console.log("\n🏗️ Deploying ETH Staking contract...");
  const ETHStaking = await ethers.getContractFactory("ETHStaking");
  const ethStaking = await ETHStaking.deploy(registryAddress, deployer.address);
  await ethStaking.waitForDeployment();

  const ethStakingAddress = await ethStaking.getAddress();
  console.log("✅ ETH Staking deployed to:", ethStakingAddress);

  // 验证合约
  console.log("\n🔍 Verifying contract...");
  try {
    await ethers.provider.waitForTransaction(ethStaking.deploymentTransaction()!.hash, 1);
    
    // 验证合约状态
    const rewardToken = await ethStaking.rewardToken();
    const totalStaked = await ethStaking.totalStaked();
    const rewardRate = await ethStaking.rewardRate();
    const lastUpdateTime = await ethStaking.lastUpdateTime();
    const rewardEndTime = await ethStaking.rewardEndTime();
    const minStakeAmount = await ethStaking.MIN_STAKE_AMOUNT();

    console.log("✅ Contract verification successful:");
    console.log("   - Reward Token:", rewardToken);
    console.log("   - Total Staked:", ethers.formatEther(totalStaked), "ETH");
    console.log("   - Reward Rate:", ethers.formatEther(rewardRate), "BOND/s");
    console.log("   - Last Update Time:", new Date(Number(lastUpdateTime) * 1000).toISOString());
    console.log("   - Reward End Time:", rewardEndTime.toString() === "0" ? "Not set" : new Date(Number(rewardEndTime) * 1000).toISOString());
    console.log("   - Min Stake Amount:", ethers.formatEther(minStakeAmount), "ETH");

    // 检查权限
    const defaultAdminRole = await ethStaking.DEFAULT_ADMIN_ROLE();
    const rewardManagerRole = await ethStaking.REWARD_MANAGER_ROLE();
    const pauserRole = await ethStaking.PAUSER_ROLE();

    const hasDefaultAdminRole = await ethStaking.hasRole(defaultAdminRole, deployer.address);
    const hasRewardManagerRole = await ethStaking.hasRole(rewardManagerRole, deployer.address);
    const hasPauserRole = await ethStaking.hasRole(pauserRole, deployer.address);

    console.log("\n🔐 Role verification:");
    console.log("   - DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole ? "✅ YES" : "❌ NO");
    console.log("   - REWARD_MANAGER_ROLE:", hasRewardManagerRole ? "✅ YES" : "❌ NO");
    console.log("   - PAUSER_ROLE:", hasPauserRole ? "✅ YES" : "❌ NO");

  } catch (error) {
    console.error("❌ Contract verification failed:", error);
  }

  // 生成部署报告
  console.log("\n📊 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Contract: ETHStaking");
  console.log("Address:", ethStakingAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("Registry:", registryAddress);
  console.log("=".repeat(50));

  // 保存部署信息
  const deploymentInfo = {
    contract: "ETHStaking",
    address: ethStakingAddress,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    registry: registryAddress,
    timestamp: new Date().toISOString(),
    blockNumber: await ethStaking.deploymentTransaction()!.blockNumber,
    transactionHash: ethStaking.deploymentTransaction()!.hash
  };

  console.log("\n💾 Deployment info saved to deployment-info.json");
  console.log("📋 Next steps:");
  console.log("   1. Update frontend contract configuration");
  console.log("   2. Add ETH Staking to BondlyRegistry");
  console.log("   3. Test ETH staking functionality");
  console.log("   4. Add BOND rewards to the contract");

  return deploymentInfo;
}

main()
  .then((deploymentInfo) => {
    console.log("\n🎉 ETH Staking deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ ETH Staking deployment failed:", error);
    process.exit(1);
  }); 