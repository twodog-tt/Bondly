import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Staking Contract Rewards...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";
  const bondTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";

  try {
    // 连接到质押合约
    const staking = await ethers.getContractAt("GeneralStaking", stakingAddress);
    console.log("✅ Connected to GeneralStaking at:", stakingAddress);

    // 检查质押合约的基本信息
    console.log("\n📋 Staking Contract Info:");
    
    const rewardToken = await staking.rewardToken();
    console.log("Reward Token:", rewardToken);
    
    const totalStaked = await staking.totalStaked();
    console.log("Total Staked:", ethers.formatEther(totalStaked), "BOND");
    
    const lastUpdateTime = await staking.lastUpdateTime();
    console.log("Last Update Time:", new Date(Number(lastUpdateTime) * 1000).toLocaleString());
    
    const rewardEndTime = await staking.rewardEndTime();
    console.log("Reward End Time:", new Date(Number(rewardEndTime) * 1000).toLocaleString());
    
    const rewardRate = await staking.rewardRate();
    console.log("Reward Rate:", rewardRate.toString(), "tokens per second");
    
    const accRewardPerShare = await staking.accRewardPerShare();
    console.log("Accumulated Reward Per Share:", accRewardPerShare.toString());

    // 检查质押合约的代币余额
    console.log("\n💰 Contract Token Balance:");
    const token = await ethers.getContractAt("BondlyTokenV2", bondTokenAddress);
    const contractBalance = await token.balanceOf(stakingAddress);
    console.log("Staking Contract BOND Balance:", ethers.formatEther(contractBalance), "BOND");

    // 检查是否有质押者
    console.log("\n👥 Checking for stakers...");
    
    // 这里我们需要检查一些已知地址的质押情况
    // 你可以替换为你的钱包地址
    const testAddress = "0xBC6B35213374A3D64E25ef1bAeFd5A8eb9031E4A"; // 你的地址
    
    try {
      const userInfo = await staking.getUserInfo(testAddress);
      console.log("Your staking info:");
      console.log("- Staked Amount:", ethers.formatEther(userInfo[0]), "BOND");
      console.log("- Pending Reward:", ethers.formatEther(userInfo[1]), "BOND");
      console.log("- Last Update Time:", new Date(Number(userInfo[2]) * 1000).toLocaleString());
    } catch (error: any) {
      console.log("❌ Error getting user info:", error.message);
    }

    // 检查奖励是否已设置
    console.log("\n🎁 Reward Status:");
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = Number(rewardEndTime) - currentTime;
    
    if (timeRemaining > 0) {
      console.log("✅ Rewards are active");
      console.log("Time remaining:", Math.floor(timeRemaining / 3600), "hours");
      console.log("Reward rate:", ethers.formatEther(rewardRate), "BOND per second");
    } else {
      console.log("❌ Rewards have ended or not set");
    }

    // 计算总奖励金额
    if (rewardRate > 0 && rewardEndTime > 0) {
      const totalRewardDuration = Number(rewardEndTime) - Number(lastUpdateTime);
      const totalRewardAmount = rewardRate * BigInt(totalRewardDuration);
      console.log("Total reward amount set:", ethers.formatEther(totalRewardAmount), "BOND");
    }

  } catch (error) {
    console.error("❌ Check failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 