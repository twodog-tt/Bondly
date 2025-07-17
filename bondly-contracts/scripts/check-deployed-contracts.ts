import { ethers } from "hardhat";

async function main() {
  console.log("📋 Checking All Deployed Contracts...");

  // 已知的合约地址
  const bondTokenAddress = "0x8Cb00D43b5627528d97831b9025F33aE3dE7415E";
  const registryAddress = "0x2B17c8e42a1B81e5f57e564225634123f9F34E97";
  const stakingAddress = "0x305AF7c69F6187b0d359C8d143bCD3549AF37646";

  try {
    console.log("\n🎯 Deployed Contract Addresses:");
    console.log("==================================");
    console.log("BondlyTokenV2:", bondTokenAddress);
    console.log("BondlyRegistry:", registryAddress);
    console.log("GeneralStaking:", stakingAddress);
    console.log("==================================");

    // 验证合约是否可访问
    console.log("\n🔍 Verifying Contract Accessibility...");
    
    try {
      const token = await ethers.getContractAt("BondlyTokenV2", bondTokenAddress);
      const name = await token.name();
      const symbol = await token.symbol();
      console.log("✅ BondlyTokenV2 accessible - Name:", name, "Symbol:", symbol);
    } catch (error: any) {
      console.log("❌ BondlyTokenV2 not accessible:", error.message);
    }

    try {
      const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
      const owner = await registry.owner();
      console.log("✅ BondlyRegistry accessible - Owner:", owner);
    } catch (error: any) {
      console.log("❌ BondlyRegistry not accessible:", error.message);
    }

    try {
      const staking = await ethers.getContractAt("GeneralStaking", stakingAddress);
      const rewardToken = await staking.rewardToken();
      const totalStaked = await staking.totalStaked();
      console.log("✅ GeneralStaking accessible - Reward Token:", rewardToken);
      console.log("   Total Staked:", ethers.formatEther(totalStaked), "BOND");
    } catch (error: any) {
      console.log("❌ GeneralStaking not accessible:", error.message);
    }

    // 检查Registry中的注册情况
    console.log("\n📝 Registry Registration Status:");
    try {
      const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
      
      const tokenRegistered = await registry.isContractRegistered("BondlyToken", "1.0.0");
      console.log("BondlyToken (1.0.0) registered:", tokenRegistered);
      
      const stakingRegistered = await registry.isContractRegistered("GeneralStaking", "1.0.0");
      console.log("GeneralStaking (1.0.0) registered:", stakingRegistered);
      
      if (tokenRegistered) {
        const registeredTokenAddress = await registry.getContractAddress("BondlyToken", "1.0.0");
        console.log("Registered BondlyToken address:", registeredTokenAddress);
      }
      
      if (stakingRegistered) {
        const registeredStakingAddress = await registry.getContractAddress("GeneralStaking", "1.0.0");
        console.log("Registered GeneralStaking address:", registeredStakingAddress);
      }
    } catch (error: any) {
      console.log("❌ Registry check failed:", error.message);
    }

    console.log("\n🎉 Contract verification completed!");

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