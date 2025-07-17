import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🔄 Resetting Staking Rewards to Reasonable APY...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";
  const rewardTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // 连接质押合约
  const stakingContract = GeneralStaking__factory.connect(stakingAddress, deployer);
  console.log("✅ Connected to GeneralStaking at:", stakingAddress);

  // 检查当前状态
  const currentRewardRate = await stakingContract.rewardRate();
  const currentTotalStaked = await stakingContract.totalStaked();

  console.log("\n📋 Current Status:");
  console.log("- Current Reward Rate:", ethers.formatEther(currentRewardRate), "tokens per second");
  console.log("- Total Staked:", ethers.formatEther(currentTotalStaked), "BOND");

  // 设置合理的奖励参数 (10% APY)
  const rewardAmount = ethers.parseEther("1000"); // 1000个BOND代币
  const rewardDuration = 365 * 24 * 60 * 60; // 1年

  console.log("\n🎯 New Reward Parameters:");
  console.log("- Reward Amount:", ethers.formatEther(rewardAmount), "BOND");
  console.log("- Reward Duration:", rewardDuration / (24 * 60 * 60), "days");
  console.log("- Target APY: ~10% (depending on total staked)");

  // 检查代币余额
  const tokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", rewardTokenAddress);
  const deployerBalance = await tokenContract.balanceOf(deployer.address);

  console.log("\n💰 Token Balances:");
  console.log("- Deployer BOND Balance:", ethers.formatEther(deployerBalance), "BOND");

  if (deployerBalance < rewardAmount) {
    console.log("❌ Insufficient BOND balance for rewards");
    console.log("💡 Please mint more BOND tokens to deployer account");
    return;
  }

  // 授权质押合约使用代币
  console.log("\n🔐 Approving BOND tokens for staking contract...");
  const approveTx = await tokenContract.approve(stakingAddress, rewardAmount);
  await approveTx.wait();
  console.log("✅ Approved", ethers.formatEther(rewardAmount), "BOND for staking contract");

  // 添加奖励
  console.log("\n🎁 Adding rewards...");
  const addRewardTx = await stakingContract.addReward(rewardAmount, rewardDuration);
  await addRewardTx.wait();
  console.log("✅ Rewards reset successfully!");

  // 验证新设置
  const newRewardRate = await stakingContract.rewardRate();
  const newRewardEndTime = await stakingContract.rewardEndTime();
  const newTotalStaked = await stakingContract.totalStaked();

  console.log("\n📋 Updated Status:");
  console.log("- New Reward Rate:", ethers.formatEther(newRewardRate), "tokens per second");
  console.log("- New Reward End Time:", new Date(Number(newRewardEndTime) * 1000).toLocaleString());
  console.log("- Total Staked:", ethers.formatEther(newTotalStaked), "BOND");

  // 计算新APY
  const calculateAPY = (rewardRate: bigint, totalStaked: bigint): number => {
    if (rewardRate === 0n || totalStaked === 0n) return 0;
    const secondsPerYear = 365 * 24 * 60 * 60;
    const annualReward = rewardRate * BigInt(secondsPerYear);
    return (Number(annualReward) / Number(totalStaked)) * 100;
  };

  const newAPY = calculateAPY(newRewardRate, newTotalStaked);
  console.log("- New APY:", newAPY.toFixed(2), "%");

  console.log("\n🎉 Rewards have been reset to a reasonable APY!");
  console.log("💡 The APY will decrease as more users stake tokens");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 