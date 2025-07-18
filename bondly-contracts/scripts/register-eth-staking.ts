import { ethers } from "hardhat";

async function main() {
  console.log("📋 Registering ETH Staking to BondlyRegistry...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📋 Using account:", deployer.address);

  // 检查环境变量
  const registryAddress = process.env.REGISTRY_ADDRESS;
  const ethStakingAddress = process.env.ETH_STAKING_ADDRESS || "0xcC7A9e9c8E60ecc12D5A6cd9BEFEFFCD253104E9";
  
  if (!registryAddress) {
    throw new Error("REGISTRY_ADDRESS environment variable is required");
  }

  console.log("📋 Registry address:", registryAddress);
  console.log("📋 ETH Staking address:", ethStakingAddress);

  // 获取 Registry 合约
  const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);

  // 注册 ETH Staking 合约
  console.log("\n📋 Registering ETH Staking contract...");
  const registerTx = await registry.setContractAddress("ETHStaking", "1.0", ethStakingAddress);
  await registerTx.wait();
  console.log("✅ ETH Staking registered successfully");

  // 验证注册
  console.log("\n🔍 Verifying registration...");
  const registeredAddress = await registry.getContractAddress("ETHStaking");
  console.log("📋 Registered address:", registeredAddress);
  
  if (registeredAddress.toLowerCase() === ethStakingAddress.toLowerCase()) {
    console.log("✅ Registration verified successfully");
  } else {
    console.log("❌ Registration verification failed");
  }

  // 显示所有已注册的合约
  console.log("\n📋 All registered contracts:");
  const contracts = ["BondlyToken", "ETHStaking"];
  for (const contractName of contracts) {
    try {
      const address = await registry.getContractAddress(contractName);
      console.log(`   ${contractName}: ${address}`);
    } catch (error) {
      console.log(`   ${contractName}: Not registered`);
    }
  }

  console.log("\n🎉 ETH Staking registration completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Registration failed:", error);
    process.exit(1);
  }); 