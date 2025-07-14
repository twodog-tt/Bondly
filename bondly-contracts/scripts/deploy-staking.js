const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Bondly Staking System Deployment...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // 1. 部署 BondlyRegistry
  console.log("\n📋 Deploying BondlyRegistry...");
  const BondlyRegistry = await ethers.getContractFactory("BondlyRegistry");
  const registry = await BondlyRegistry.deploy(deployer.address);
  await registry.deployed();
  console.log("✅ BondlyRegistry deployed to:", registry.address);

  // 2. 部署 BondlyToken
  console.log("\n🪙 Deploying BondlyToken...");
  const BondlyToken = await ethers.getContractFactory("BondlyTokenUpgradeable");
  const token = await upgrades.deployProxy(
    BondlyToken,
    [deployer.address, deployer.address], // initialOwner, daoAddress
    { initializer: "initialize" }
  );
  await token.deployed();
  console.log("✅ BondlyToken deployed to:", token.address);

  // 3. 部署 GeneralStaking
  console.log("\n💰 Deploying GeneralStaking...");
  const GeneralStaking = await ethers.getContractFactory("GeneralStaking");
  const staking = await GeneralStaking.deploy(
    registry.address,
    deployer.address
  );
  await staking.deployed();
  console.log("✅ GeneralStaking deployed to:", staking.address);

  // 4. 注册合约到 Registry
  console.log("\n📝 Registering contracts...");
  await registry.setContractAddress("BondlyToken", token.address);
  await registry.setContractAddress("GeneralStaking", staking.address);
  console.log("✅ Contracts registered to registry");

  // 5. 设置初始奖励（可选）
  console.log("\n🎁 Setting up initial rewards...");
  const initialRewardAmount = ethers.utils.parseEther("10000"); // 10,000 BOND
  const rewardDuration = 30 * 24 * 60 * 60; // 30 days

  // 给质押合约一些代币作为奖励
  await token.mint(deployer.address, initialRewardAmount, "Initial staking rewards");
  await token.approve(staking.address, initialRewardAmount);
  await staking.addReward(initialRewardAmount, rewardDuration);
  console.log("✅ Initial rewards set up");

  // 6. 输出部署信息
  console.log("\n🎉 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("BondlyRegistry:", registry.address);
  console.log("BondlyToken:", token.address);
  console.log("GeneralStaking:", staking.address);
  console.log("=".repeat(50));

  // 7. 保存部署信息到文件
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      BondlyRegistry: registry.address,
      BondlyToken: token.address,
      GeneralStaking: staking.address,
    },
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments");
  
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentPath, `${network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment info saved to deployments/${network.name}.json`);

  // 8. 验证合约（如果是测试网或主网）
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts...");
    
    try {
      await hre.run("verify:verify", {
        address: registry.address,
        constructorArguments: [deployer.address],
      });
      console.log("✅ BondlyRegistry verified");
    } catch (error) {
      console.log("❌ BondlyRegistry verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: staking.address,
        constructorArguments: [registry.address, deployer.address],
      });
      console.log("✅ GeneralStaking verified");
    } catch (error) {
      console.log("❌ GeneralStaking verification failed:", error.message);
    }
  }

  console.log("\n🎊 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 