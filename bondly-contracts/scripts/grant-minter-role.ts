import { ethers } from "hardhat";

async function main() {
  console.log("🔐 Granting MINTER_ROLE to user...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // 用户地址（需要替换为实际的用户地址）
  const userAddress = "0xf0fc1808738b1829a0b3cbb26fa0411b4aaf5a11"; // 替换为实际用户地址
  console.log("User address:", userAddress);

  // ContentNFT合约地址（需要替换为实际部署的地址）
  const contentNFTAddress = "0x..."; // 替换为实际部署的ContentNFT地址
  console.log("ContentNFT address:", contentNFTAddress);

  // 获取ContentNFT合约
  const contentNFT = await ethers.getContractAt("ContentNFT", contentNFTAddress);

  // 检查用户是否已经有MINTER_ROLE
  const MINTER_ROLE = await contentNFT.MINTER_ROLE();
  const hasRole = await contentNFT.hasRole(MINTER_ROLE, userAddress);
  
  if (hasRole) {
    console.log("✅ User already has MINTER_ROLE");
    return;
  }

  // 授予MINTER_ROLE
  console.log("⏳ Granting MINTER_ROLE to user...");
  const tx = await contentNFT.grantRole(MINTER_ROLE, userAddress);
  await tx.wait();
  
  console.log("✅ MINTER_ROLE granted successfully!");
  console.log("Transaction hash:", tx.hash);

  // 验证权限
  const hasRoleAfter = await contentNFT.hasRole(MINTER_ROLE, userAddress);
  console.log("Verification - User has MINTER_ROLE:", hasRoleAfter);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  }); 