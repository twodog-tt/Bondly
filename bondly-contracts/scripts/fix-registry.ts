import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Fixing Registry Token Registration...");

  // 已有的BondlyTokenV2地址
  const bondTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";
  
  // Registry地址
  const registryAddress = "0x2B17c8e42a1B81e5f57e564225634123f9F34E97";

  try {
    // 连接到Registry
    const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
    console.log("✅ Connected to Registry at:", registryAddress);

    // 检查当前注册状态
    console.log("\n📋 Current registration status:");
    const isRegistered = await registry.isContractRegistered("BondlyToken", "1.0.0");
    console.log("Is BondlyToken (1.0.0) registered:", isRegistered);

    if (!isRegistered) {
      console.log("\n🔄 Registering BondlyToken...");
      
      // 重新注册Token
      const tx = await registry.setContractAddress("BondlyToken", "1.0.0", bondTokenAddress);
      await tx.wait();
      console.log("✅ BondlyToken registered successfully");
      
      // 验证注册
      const registeredAddress = await registry.getContractAddress("BondlyToken", "1.0.0");
      console.log("Registered address:", registeredAddress);
      
      if (registeredAddress.toLowerCase() === bondTokenAddress.toLowerCase()) {
        console.log("✅ Registration verified successfully");
      } else {
        console.log("❌ Registration verification failed");
      }
    } else {
      console.log("✅ Token already registered");
    }

    // 现在尝试部署GeneralStaking
    console.log("\n💰 Deploying GeneralStaking...");
    const GeneralStaking = await ethers.getContractFactory("GeneralStaking");
    const staking = await GeneralStaking.deploy(registryAddress, await registry.owner());
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✅ GeneralStaking deployed to:", stakingAddress);

    // 注册GeneralStaking
    console.log("\n📝 Registering GeneralStaking...");
    await registry.setContractAddress("GeneralStaking", "1.0.0", stakingAddress);
    console.log("✅ GeneralStaking registered");

    console.log("\n🎉 Fix completed successfully!");
    console.log("GeneralStaking address:", stakingAddress);

  } catch (error) {
    console.error("❌ Fix failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 