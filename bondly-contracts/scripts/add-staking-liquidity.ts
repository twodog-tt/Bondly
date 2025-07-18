import { ethers } from "hardhat";
import { GeneralStaking__factory } from "../typechain-types";

async function main() {
  console.log("🚀 开始为质押合约添加流动性...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("使用账户:", deployer.address);

  // 合约地址
  const bondTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";

  console.log("BOND代币地址:", bondTokenAddress);
  console.log("质押合约地址:", stakingAddress);

  // 获取合约实例
  const bondToken = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20", bondTokenAddress);
  const staking = GeneralStaking__factory.connect(stakingAddress, deployer);

  // 检查BOND代币余额
  const balance = await bondToken.balanceOf(deployer.address);
  console.log("当前BOND余额:", ethers.formatEther(balance));

  // 设置要添加的奖励金额和持续时间
  const rewardAmount = ethers.parseEther("10000"); // 10,000 BOND
  const durationInDays = 30; // 30天
  const durationInSeconds = durationInDays * 24 * 60 * 60;

  console.log(`准备添加 ${ethers.formatEther(rewardAmount)} BOND 作为奖励`);
  console.log(`奖励持续时间: ${durationInDays} 天`);

  // 检查余额是否足够
  if (balance < rewardAmount) {
    console.error("❌ BOND余额不足！");
    console.log(`需要: ${ethers.formatEther(rewardAmount)} BOND`);
    console.log(`当前: ${ethers.formatEther(balance)} BOND`);
    return;
  }

  try {
    // 首先授权质押合约使用BOND代币
    console.log("📝 授权质押合约使用BOND代币...");
    const approveTx = await bondToken.approve(stakingAddress, rewardAmount);
    await approveTx.wait();
    console.log("✅ 授权成功");

    // 添加奖励到质押合约
    console.log("💰 添加奖励到质押合约...");
    const addRewardTx = await staking.addReward(rewardAmount, durationInSeconds);
    await addRewardTx.wait();
    console.log("✅ 奖励添加成功");

    // 验证结果
    const rewardRate = await staking.rewardRate();
    const rewardEndTime = await staking.rewardEndTime();
    
    console.log("📊 奖励池信息:");
    console.log(`- 奖励率: ${ethers.formatEther(rewardRate)} BOND/秒`);
    console.log(`- 结束时间: ${new Date(Number(rewardEndTime) * 1000).toLocaleString()}`);
    
    // 计算APY
    const totalStaked = await staking.totalStaked();
    if (totalStaked > 0) {
      const secondsPerYear = 365 * 24 * 60 * 60;
      const annualReward = rewardRate * BigInt(secondsPerYear);
      const apy = (Number(annualReward) / Number(totalStaked)) * 100;
      console.log(`- 预计APY: ${apy.toFixed(2)}%`);
    }

    console.log("🎉 流动性添加完成！");

  } catch (error) {
    console.error("❌ 添加流动性失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 