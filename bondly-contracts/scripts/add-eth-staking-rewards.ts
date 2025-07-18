import { ethers } from "hardhat";

async function main() {
  console.log("💰 Adding rewards to ETH Staking contract...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using account:", deployer.address);

  // 检查环境变量
  const registryAddress = process.env.REGISTRY_ADDRESS;
  const ethStakingAddress = process.env.ETH_STAKING_ADDRESS || "0xcC7A9e9c8E60ecc12D5A6cd9BEFEFFCD253104E9";
  
  if (!registryAddress) {
    throw new Error("REGISTRY_ADDRESS environment variable is required");
  }

  console.log("📋 Registry address:", registryAddress);
  console.log("📋 ETH Staking address:", ethStakingAddress);

  // 获取已部署的合约
  const ethStaking = await ethers.getContractAt("ETHStaking", ethStakingAddress);
  console.log("✅ Connected to ETH Staking contract");

  // 获取 BOND 代币地址
  const bondlyTokenAddress = await ethStaking.rewardToken();
  console.log("✅ BOND Token address:", bondlyTokenAddress);

  // 获取 BOND 代币合约
  const bondlyToken = await ethers.getContractAt("BondlyTokenV2", bondlyTokenAddress);

  // 检查当前状态
  console.log("\n🔍 Checking current state...");
  const currentRewardRate = await ethStaking.rewardRate();
  const currentTotalStaked = await ethStaking.totalStaked();
  const currentAPY = await ethStaking.calculateAPY();
  const deployerBondBalance = await bondlyToken.balanceOf(deployer.address);

  console.log("   - Current reward rate:", ethers.formatEther(currentRewardRate), "BOND/s");
  console.log("   - Current total staked:", ethers.formatEther(currentTotalStaked), "ETH");
  console.log("   - Current APY:", currentAPY.toString(), "%");
  console.log("   - Deployer BOND balance:", ethers.formatEther(deployerBondBalance), "BOND");

  // 设置奖励参数
  const rewardAmount = ethers.parseEther("1000"); // 1000 BOND
  const duration = 30 * 24 * 60 * 60; // 30 days

  console.log("\n💰 Adding rewards...");
  console.log("   - Reward amount:", ethers.formatEther(rewardAmount), "BOND");
  console.log("   - Duration:", duration / (24 * 60 * 60), "days");

  // 检查余额是否足够
  if (deployerBondBalance < rewardAmount) {
    console.log("❌ Insufficient BOND balance. Need:", ethers.formatEther(rewardAmount), "BOND");
    console.log("   Current balance:", ethers.formatEther(deployerBondBalance), "BOND");
    return;
  }

  // 授权 ETH Staking 合约使用 BOND 代币
  console.log("   - Approving BOND tokens...");
  const approveTx = await bondlyToken.approve(ethStakingAddress, rewardAmount);
  await approveTx.wait();
  console.log("   ✅ BOND tokens approved");

  // 添加奖励
  console.log("   - Adding rewards to contract...");
  const addRewardTx = await ethStaking.addReward(rewardAmount, duration);
  await addRewardTx.wait();
  console.log("   ✅ Rewards added successfully");

  // 检查更新后的状态
  console.log("\n📊 Updated state:");
  const newRewardRate = await ethStaking.rewardRate();
  const rewardEndTime = await ethStaking.rewardEndTime();
  const newAPY = await ethStaking.calculateAPY();
  const contractBondBalance = await bondlyToken.balanceOf(ethStakingAddress);

  console.log("   - New reward rate:", ethers.formatEther(newRewardRate), "BOND/s");
  console.log("   - Reward end time:", new Date(Number(rewardEndTime) * 1000).toISOString());
  console.log("   - New APY:", newAPY.toString(), "%");
  console.log("   - Contract BOND balance:", ethers.formatEther(contractBondBalance), "BOND");

  // 计算预期奖励
  if (currentTotalStaked > 0) {
    const expectedDailyReward = (newRewardRate * BigInt(24 * 60 * 60) * currentTotalStaked) / ethers.parseEther("1");
    console.log("   - Expected daily reward for current stakers:", ethers.formatEther(expectedDailyReward), "BOND");
  }

  console.log("\n🎉 Rewards added successfully!");
  console.log("📋 Summary:");
  console.log("   ✅ BOND tokens approved");
  console.log("   ✅ Rewards added to contract");
  console.log("   ✅ Reward rate updated");
  console.log("   ✅ APY calculated");
  console.log("   ✅ Contract ready for staking rewards");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Adding rewards failed:", error);
    process.exit(1);
  }); 