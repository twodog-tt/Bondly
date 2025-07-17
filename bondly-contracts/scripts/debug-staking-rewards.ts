import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🔍 Debugging Staking Contract Rewards...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";
  const rewardTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // 连接质押合约
  const stakingContract = GeneralStaking__factory.connect(stakingAddress, deployer);
  console.log("✅ Connected to GeneralStaking at:", stakingAddress);

  // 检查合约状态
  const rewardToken = await stakingContract.rewardToken();
  const rewardRate = await stakingContract.rewardRate();
  const rewardEndTime = await stakingContract.rewardEndTime();
  const totalStaked = await stakingContract.totalStaked();
  const lastUpdateTime = await stakingContract.lastUpdateTime();
  const accRewardPerShare = await stakingContract.accRewardPerShare();

  console.log("\n📋 Contract State:");
  console.log("- Reward Token:", rewardToken);
  console.log("- Reward Rate:", ethers.formatEther(rewardRate), "tokens per second");
  console.log("- Reward End Time:", new Date(Number(rewardEndTime) * 1000).toLocaleString());
  console.log("- Total Staked:", ethers.formatEther(totalStaked), "BOND");
  console.log("- Last Update Time:", new Date(Number(lastUpdateTime) * 1000).toLocaleString());
  console.log("- Acc Reward Per Share:", ethers.formatEther(accRewardPerShare));

  // 检查代币余额
  const tokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", rewardTokenAddress);
  const deployerBalance = await tokenContract.balanceOf(deployer.address);
  const stakingBalance = await tokenContract.balanceOf(stakingAddress);

  console.log("\n💰 Token Balances:");
  console.log("- Deployer BOND Balance:", ethers.formatEther(deployerBalance), "BOND");
  console.log("- Staking Contract BOND Balance:", ethers.formatEther(stakingBalance), "BOND");

  // 检查用户质押信息
  const userInfo = await stakingContract.getUserInfo(deployer.address);
  console.log("\n👤 User Staking Info:");
  console.log("- Staked Amount:", ethers.formatEther(userInfo[0]), "BOND");
  console.log("- Pending Reward:", ethers.formatEther(userInfo[1]), "BOND");
  console.log("- Last Update Time:", new Date(Number(userInfo[2]) * 1000).toLocaleString());

  // 检查角色权限
  const hasRewardManagerRole = await stakingContract.hasRole(await stakingContract.REWARD_MANAGER_ROLE(), deployer.address);
  const hasAdminRole = await stakingContract.hasRole(await stakingContract.DEFAULT_ADMIN_ROLE(), deployer.address);

  console.log("\n🔐 Role Permissions:");
  console.log("- Has REWARD_MANAGER_ROLE:", hasRewardManagerRole);
  console.log("- Has DEFAULT_ADMIN_ROLE:", hasAdminRole);

  // 分析问题
  console.log("\n🔍 Analysis:");
  if (totalStaked === 0n) {
    console.log("❌ No tokens are staked - rewards cannot be distributed");
    console.log("💡 Users need to stake tokens first before rewards can be activated");
  } else {
    console.log("✅ Tokens are staked - rewards should be working");
  }

  if (rewardRate === 0n) {
    console.log("❌ Reward rate is 0 - no rewards are being distributed");
  } else {
    console.log("✅ Reward rate is set - rewards are being distributed");
  }

  if (rewardEndTime === 0n) {
    console.log("❌ Reward end time is not set");
  } else {
    console.log("✅ Reward end time is set");
  }

  console.log("\n💡 Next Steps:");
  console.log("1. First, stake some BOND tokens to the contract");
  console.log("2. Then, add rewards again");
  console.log("3. The rewards will be distributed based on staked amounts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 