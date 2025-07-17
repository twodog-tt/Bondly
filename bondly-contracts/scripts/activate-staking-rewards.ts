import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🎁 Activating Staking Contract Rewards...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";
  const rewardTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // 连接质押合约
  const stakingContract = GeneralStaking__factory.connect(stakingAddress, deployer);
  console.log("✅ Connected to GeneralStaking at:", stakingAddress);

  // 检查当前奖励状态
  const rewardRate = await stakingContract.rewardRate();
  const rewardEndTime = await stakingContract.rewardEndTime();
  const totalStaked = await stakingContract.totalStaked();

  console.log("\n📋 Current Reward Info:");
  console.log("- Reward Token:", await stakingContract.rewardToken());
  console.log("- Reward Rate:", ethers.formatEther(rewardRate), "tokens per second");
  console.log("- Reward End Time:", new Date(Number(rewardEndTime) * 1000).toLocaleString());
  console.log("- Total Staked:", ethers.formatEther(totalStaked), "BOND");

  // 设置奖励参数
  const rewardAmount = ethers.parseEther("1000000"); // 1000000个BOND代币作为奖励
  const rewardDuration = 30 * 24 * 60 * 60; // 30天

  console.log("\n🎯 Setting Reward Parameters:");
  console.log("- Reward Amount:", ethers.formatEther(rewardAmount), "BOND");
  console.log("- Reward Duration:", rewardDuration / (24 * 60 * 60), "days");

  // 检查代币余额
  const tokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", rewardTokenAddress);
  const deployerBalance = await tokenContract.balanceOf(deployer.address);
  const stakingBalance = await tokenContract.balanceOf(stakingAddress);

  console.log("\n💰 Token Balances:");
  console.log("- Deployer BOND Balance:", ethers.formatEther(deployerBalance), "BOND");
  console.log("- Staking Contract BOND Balance:", ethers.formatEther(stakingBalance), "BOND");

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
  console.log("✅ Rewards activated successfully!");

  // 验证设置
  const newRewardRate = await stakingContract.rewardRate();
  const newRewardEndTime = await stakingContract.rewardEndTime();
  const newTotalStaked = await stakingContract.totalStaked();

  console.log("\n📋 Updated Reward Info:");
  console.log("- Reward Token:", await stakingContract.rewardToken());
  console.log("- Reward Rate:", ethers.formatEther(newRewardRate), "tokens per second");
  console.log("- Reward End Time:", new Date(Number(newRewardEndTime) * 1000).toLocaleString());
  console.log("- Total Staked:", ethers.formatEther(newTotalStaked), "BOND");

  const finalStakingBalance = await tokenContract.balanceOf(stakingAddress);
  console.log("- Final Staking Contract Balance:", ethers.formatEther(finalStakingBalance), "BOND");

  console.log("\n🎉 Staking rewards are now active!");
  console.log("💡 Users can now stake BOND tokens and earn rewards");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 