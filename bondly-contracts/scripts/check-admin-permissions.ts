import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🔐 Checking Admin Permissions for Staking Contract...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";

  // 获取签名者
  const [signer] = await ethers.getSigners();
  console.log("👤 Current account:", signer.address);

  // 连接质押合约
  const stakingContract = GeneralStaking__factory.connect(stakingAddress, signer);
  console.log("✅ Connected to GeneralStaking at:", stakingAddress);

  // 检查角色权限
  const defaultAdminRole = await stakingContract.DEFAULT_ADMIN_ROLE();
  const rewardManagerRole = await stakingContract.REWARD_MANAGER_ROLE();
  const pauserRole = await stakingContract.PAUSER_ROLE();

  const hasDefaultAdminRole = await stakingContract.hasRole(defaultAdminRole, signer.address);
  const hasRewardManagerRole = await stakingContract.hasRole(rewardManagerRole, signer.address);
  const hasPauserRole = await stakingContract.hasRole(pauserRole, signer.address);

  console.log("\n📋 Permission Check Results:");
  console.log("=".repeat(50));
  console.log("DEFAULT_ADMIN_ROLE:", hasDefaultAdminRole ? "✅ YES" : "❌ NO");
  console.log("REWARD_MANAGER_ROLE:", hasRewardManagerRole ? "✅ YES" : "❌ NO");
  console.log("PAUSER_ROLE:", hasPauserRole ? "✅ YES" : "❌ NO");
  console.log("=".repeat(50));

  // 检查当前奖励状态
  const rewardRate = await stakingContract.rewardRate();
  const rewardEndTime = await stakingContract.rewardEndTime();
  const totalStaked = await stakingContract.totalStaked();

  console.log("\n📊 Current Staking Status:");
  console.log("- Reward Rate:", ethers.formatEther(rewardRate), "tokens per second");
  console.log("- Reward End Time:", new Date(Number(rewardEndTime) * 1000).toLocaleString());
  console.log("- Total Staked:", ethers.formatEther(totalStaked), "BOND");

  // 提供建议
  console.log("\n💡 Recommendations:");
  
  if (hasRewardManagerRole) {
    console.log("✅ You can add rewards to the staking pool!");
    console.log("   Use the addReward() function to inject BOND tokens as rewards");
  } else {
    console.log("❌ You cannot add rewards to the staking pool");
    console.log("   Only accounts with REWARD_MANAGER_ROLE can add rewards");
  }

  if (hasDefaultAdminRole) {
    console.log("✅ You have full admin control over the staking contract");
    console.log("   You can grant/revoke roles and perform emergency operations");
  } else {
    console.log("❌ You don't have admin control over the staking contract");
  }

  // 检查代币余额
  const rewardToken = await stakingContract.rewardToken();
  const tokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", rewardToken);
  const balance = await tokenContract.balanceOf(signer.address);

  console.log("\n💰 Your BOND Token Balance:");
  console.log("- Balance:", ethers.formatEther(balance), "BOND");

  if (hasRewardManagerRole && balance > 0n) {
    console.log("\n🚀 To add rewards to the pool:");
    console.log("1. Approve BOND tokens to the staking contract");
    console.log("2. Call addReward(amount, duration)");
    console.log("3. The rewards will be distributed to stakers");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 