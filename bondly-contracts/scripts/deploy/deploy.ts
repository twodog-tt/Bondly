import { ethers, upgrades } from "hardhat";
import { verify } from "../../scripts/utils/verify";

async function main() {
  console.log("开始部署 BondlyToken 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "ETH");

  // 部署 BondlyToken 合约
  console.log("\n部署 BondlyToken...");
  const BondlyToken = await ethers.getContractFactory("BondlyToken");
  
  // 使用代理模式部署（支持升级）
  const bondlyToken = await upgrades.deployProxy(BondlyToken, [deployer.address], {
    initializer: "constructor",
    kind: "transparent",
  });

  await bondlyToken.waitForDeployment();
  const bondlyTokenAddress = await bondlyToken.getAddress();

  console.log("BondlyToken 已部署到:", bondlyTokenAddress);

  // 获取合约信息
  const name = await bondlyToken.name();
  const symbol = await bondlyToken.symbol();
  const decimals = await bondlyToken.decimals();
  const totalSupply = await bondlyToken.totalSupply();
  const maxSupply = await bondlyToken.MAX_SUPPLY();

  console.log("\n合约信息:");
  console.log("- 名称:", name);
  console.log("- 符号:", symbol);
  console.log("- 小数位:", decimals);
  console.log("- 当前供应量:", ethers.formatEther(totalSupply));
  console.log("- 最大供应量:", ethers.formatEther(maxSupply));

  // 等待几个区块确认
  console.log("\n等待区块确认...");
  await bondlyToken.deploymentTransaction()?.wait(5);

  // 验证合约（如果支持）
  const network = await ethers.provider.getNetwork();
  console.log("\n网络信息:", {
    name: network.name,
    chainId: network.chainId,
  });

  // 根据网络决定是否验证
  if (Number(network.chainId) !== 31337) { // 不是本地网络
    console.log("\n开始验证合约...");
    try {
      await verify(bondlyTokenAddress, []);
      console.log("合约验证成功！");
    } catch (error) {
      console.log("合约验证失败:", error);
    }
  }

  console.log("\n部署完成！");
  console.log("合约地址:", bondlyTokenAddress);
  
  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    contract: "BondlyToken",
    address: bondlyTokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: bondlyToken.deploymentTransaction()?.hash,
  };

  console.log("\n部署信息:", JSON.stringify(deploymentInfo, null, 2));

  return bondlyTokenAddress;
}

// 错误处理
main()
  .then((address) => {
    console.log("\n✅ 部署成功！合约地址:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  }); 