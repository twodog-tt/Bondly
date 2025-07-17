import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🔍 Checking Test User Staking Status...");

  // 合约地址
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";
  const rewardTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";
  const testUserAddress = "0x4D4993D81ab908eBEe4E809a60d2842CFA7B687f";

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 Using account:", deployer.address);

  // 连接合约
  const stakingContract = GeneralStaking__factory.connect(stakingAddress, deployer);
  const tokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", rewardTokenAddress);
  
  console.log("✅ Connected to contracts");

  // 检查测试用户状态
  console.log("\n📋 Test User Status:");
  console.log("- User Address:", testUserAddress);

  // 检查用户BOND余额
  const userBalance = await tokenContract.balanceOf(testUserAddress);
  console.log("- BOND Balance:", ethers.formatEther(userBalance), "BOND");

  // 检查用户质押信息
  const userInfo = await stakingContract.getUserInfo(testUserAddress);
  console.log("- Staked Amount:", ethers.formatEther(userInfo[0]), "BOND");
  console.log("- Pending Reward:", ethers.formatEther(userInfo[1]), "BOND");
  console.log("- Last Update Time:", new Date(Number(userInfo[2]) * 1000).toLocaleString());

  // 检查授权额度
  const allowance = await tokenContract.allowance(testUserAddress, stakingAddress);
  console.log("- Allowance:", ethers.formatEther(allowance), "BOND");

  // 检查合约总状态
  const totalStaked = await stakingContract.totalStaked();
  const rewardRate = await stakingContract.rewardRate();
  const rewardEndTime = await stakingContract.rewardEndTime();
  const stakingBalance = await tokenContract.balanceOf(stakingAddress);

  console.log("\n📋 Contract Status:");
  console.log("- Total Staked:", ethers.formatEther(totalStaked), "BOND");
  console.log("- Reward Rate:", ethers.formatEther(rewardRate), "tokens per second");
  console.log("- Reward End Time:", new Date(Number(rewardEndTime) * 1000).toLocaleString());
  console.log("- Staking Contract Balance:", ethers.formatEther(stakingBalance), "BOND");

  // 分析问题
  console.log("\n🔍 Analysis:");
  
  if (userInfo[0] === 0n) {
    console.log("❌ User has not staked any tokens");
    console.log("💡 The user needs to stake tokens first");
  } else {
    console.log("✅ User has staked tokens");
  }

  if (userBalance === 0n) {
    console.log("❌ User has no BOND tokens");
    console.log("💡 The user needs BOND tokens to stake");
  } else {
    console.log("✅ User has BOND tokens");
  }

  if (allowance === 0n) {
    console.log("❌ User has not approved staking contract");
    console.log("💡 The user needs to approve the staking contract");
  } else {
    console.log("✅ User has approved staking contract");
  }

  // 计算APY
  if (rewardRate > 0n && totalStaked > 0n) {
    const secondsPerYear = 365 * 24 * 60 * 60;
    const annualReward = rewardRate * BigInt(secondsPerYear);
    const apy = (Number(annualReward) / Number(totalStaked)) * 100;
    console.log("\n📊 APY Calculation:");
    console.log("- Annual Reward:", ethers.formatEther(annualReward), "BOND");
    console.log("- Total Staked:", ethers.formatEther(totalStaked), "BOND");
    console.log("- APY:", apy.toFixed(2), "%");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 