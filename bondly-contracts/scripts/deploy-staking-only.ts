import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying GeneralStaking Contract...");

  // 已有的BondlyTokenV2地址
  const bondTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));

  try {
    // 1. 部署 BondlyRegistry
    console.log("\n📋 Deploying BondlyRegistry...");
    const BondlyRegistry = await ethers.getContractFactory("BondlyRegistry");
    const registry = await BondlyRegistry.deploy(deployer.address);
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();
    console.log("✅ BondlyRegistry deployed to:", registryAddress);

    // 2. 注册已有的BondlyTokenV2到Registry
    console.log("\n📝 Registering existing BondlyTokenV2 to registry...");
    await registry.setContractAddress("BondlyToken", "1.0.0", bondTokenAddress);
    console.log("✅ BondlyTokenV2 registered to registry");

    // 3. 部署 GeneralStaking
    console.log("\n💰 Deploying GeneralStaking...");
    const GeneralStaking = await ethers.getContractFactory("GeneralStaking");
    const staking = await GeneralStaking.deploy(registryAddress, deployer.address);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✅ GeneralStaking deployed to:", stakingAddress);

    // 4. 注册GeneralStaking到Registry
    console.log("\n📝 Registering GeneralStaking to registry...");
    await registry.setContractAddress("GeneralStaking", "1.0.0", stakingAddress);
    console.log("✅ GeneralStaking registered to registry");

    // 5. 设置初始奖励
    console.log("\n🎁 Setting up initial rewards...");
    const initialRewardAmount = ethers.parseEther("1000000"); // 1,000,000 BOND
    const rewardDuration = 30 * 24 * 60 * 60; // 30 days

    try {
      // 给质押合约铸造一些代币作为奖励
      const token = await ethers.getContractAt("BondlyTokenV2", bondTokenAddress);
      await token.mint(stakingAddress, initialRewardAmount, "Initial staking rewards");
      console.log("✅ Minted initial rewards to staking contract");

      // 添加奖励到质押合约
      await staking.addReward(initialRewardAmount, rewardDuration);
      console.log("✅ Added rewards to staking contract");
    } catch (error: any) {
      console.log("⚠️ Warning: Could not set up initial rewards:", error.message);
      console.log("You may need to manually add rewards to the staking contract");
    }

    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("BondlyRegistry:", registryAddress);
    console.log("BondlyTokenV2 (existing):", bondTokenAddress);
    console.log("GeneralStaking:", stakingAddress);

    console.log("\n🔧 Next steps:");
    console.log("1. Update GENERAL_STAKING address in bondly-fe/src/config/contracts.ts:");
    console.log(`   address: '${stakingAddress}'`);
    console.log("2. Test the staking functionality in the frontend");
    console.log("3. Add more rewards to the staking contract as needed");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 