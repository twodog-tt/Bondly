import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🎁 Setting up Staking with Rewards...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";
  const rewardTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // 连接合约
  const stakingContract = GeneralStaking__factory.connect(stakingAddress, deployer);
  const tokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", rewardTokenAddress);
  
  console.log("✅ Connected to contracts");

  // 检查当前状态
  const totalStaked = await stakingContract.totalStaked();
  const rewardRate = await stakingContract.rewardRate();
  const deployerBalance = await tokenContract.balanceOf(deployer.address);

  console.log("\n📋 Current State:");
  console.log("- Total Staked:", ethers.formatEther(totalStaked), "BOND");
  console.log("- Reward Rate:", ethers.formatEther(rewardRate), "tokens per second");
  console.log("- Deployer Balance:", ethers.formatEther(deployerBalance), "BOND");

  // 第一步：质押一些代币
  const stakeAmount = ethers.parseEther("100"); // 质押100个BOND
  console.log(`\n🔄 Step 1: Staking ${ethers.formatEther(stakeAmount)} BOND...`);

  // 授权质押合约使用代币
  console.log("🔐 Approving tokens for staking...");
  const approveTx = await tokenContract.approve(stakingAddress, stakeAmount);
  await approveTx.wait();
  console.log("✅ Approved tokens for staking");

  // 质押代币
  console.log("📥 Staking tokens...");
  const stakeTx = await stakingContract.stake(stakeAmount);
  await stakeTx.wait();
  console.log("✅ Tokens staked successfully");

  // 检查质押后的状态
  const newTotalStaked = await stakingContract.totalStaked();
  const userInfo = await stakingContract.getUserInfo(deployer.address);
  
  console.log("\n📋 After Staking:");
  console.log("- Total Staked:", ethers.formatEther(newTotalStaked), "BOND");
  console.log("- User Staked:", ethers.formatEther(userInfo[0]), "BOND");
  console.log("- Pending Reward:", ethers.formatEther(userInfo[1]), "BOND");

  // 第二步：添加奖励
  const rewardAmount = ethers.parseEther("1000"); // 1000个BOND作为奖励
  const rewardDuration = 30 * 24 * 60 * 60; // 30天
  
  console.log(`\n🎁 Step 2: Adding ${ethers.formatEther(rewardAmount)} BOND rewards...`);

  // 授权质押合约使用奖励代币
  console.log("🔐 Approving reward tokens...");
  const approveRewardTx = await tokenContract.approve(stakingAddress, rewardAmount);
  await approveRewardTx.wait();
  console.log("✅ Approved reward tokens");

  // 添加奖励
  console.log("🎁 Adding rewards...");
  const addRewardTx = await stakingContract.addReward(rewardAmount, rewardDuration);
  await addRewardTx.wait();
  console.log("✅ Rewards added successfully");

  // 检查最终状态
  const finalRewardRate = await stakingContract.rewardRate();
  const finalRewardEndTime = await stakingContract.rewardEndTime();
  const finalTotalStaked = await stakingContract.totalStaked();
  const finalUserInfo = await stakingContract.getUserInfo(deployer.address);
  const stakingBalance = await tokenContract.balanceOf(stakingAddress);

  console.log("\n📋 Final State:");
  console.log("- Reward Rate:", ethers.formatEther(finalRewardRate), "tokens per second");
  console.log("- Reward End Time:", new Date(Number(finalRewardEndTime) * 1000).toLocaleString());
  console.log("- Total Staked:", ethers.formatEther(finalTotalStaked), "BOND");
  console.log("- User Staked:", ethers.formatEther(finalUserInfo[0]), "BOND");
  console.log("- Pending Reward:", ethers.formatEther(finalUserInfo[1]), "BOND");
  console.log("- Staking Contract Balance:", ethers.formatEther(stakingBalance), "BOND");

  console.log("\n🎉 Staking with rewards is now fully set up!");
  console.log("💡 Users can now stake BOND tokens and earn rewards");
  console.log("💡 The reward rate is:", ethers.formatEther(finalRewardRate), "BOND per second");
  console.log("💡 Rewards will end on:", new Date(Number(finalRewardEndTime) * 1000).toLocaleString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 