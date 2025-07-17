import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging Registry and Token Registration...");

  // 已有的BondlyTokenV2地址
  const bondTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";
  
  // 刚才部署的Registry地址
  const registryAddress = "0x2B17c8e42a1B81e5f57e564225634123f9F34E97";

  try {
    // 连接到已部署的Registry
    const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
    console.log("✅ Connected to Registry at:", registryAddress);

    // 检查Token注册情况
    console.log("\n📋 Checking Token Registration...");
    
    // 1. 检查特定版本（明确指定双参数版本）
    try {
      const specificVersionAddress = await registry.getContractAddress("BondlyToken", "1.0.0");
      console.log("Specific version (1.0.0) address:", specificVersionAddress);
    } catch (error: any) {
      console.log("❌ Specific version check failed:", error.message);
    }
    
    // 2. 检查默认版本（使用any类型避免重载问题）
    try {
      const registryAny = registry as any;
      const defaultVersionAddress = await registryAny.getContractAddress("BondlyToken");
      console.log("Default version address:", defaultVersionAddress);
    } catch (error: any) {
      console.log("❌ Default version check failed:", error.message);
    }
    
    // 3. 检查是否注册
    try {
      const isRegistered = await registry.isContractRegistered("BondlyToken", "1.0.0");
      console.log("Is registered (1.0.0):", isRegistered);
    } catch (error: any) {
      console.log("❌ Registration check failed:", error.message);
    }
    
    // 4. 获取所有注册的合约
    try {
      const allContracts = await registry.getAllContractNameVersions();
      console.log("\n📝 All registered contracts:");
      for (let i = 0; i < allContracts.length; i++) {
        const contract = allContracts[i];
        const address = await registry.getContractAddress(contract.name, contract.version);
        console.log(`- ${contract.name} (${contract.version}): ${address}`);
      }
    } catch (error: any) {
      console.log("❌ Get all contracts failed:", error.message);
    }

    // 5. 尝试重新注册Token
    console.log("\n🔄 Attempting to re-register token...");
    try {
      await registry.setContractAddress("BondlyToken", "1.0.0", bondTokenAddress);
      console.log("✅ Token re-registered successfully");
      
      // 再次检查
      const newAddress = await registry.getContractAddress("BondlyToken", "1.0.0");
      console.log("New registration check:", newAddress);
    } catch (error: any) {
      console.log("❌ Re-registration failed:", error.message);
    }

  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 