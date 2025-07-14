import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("开始部署 BondlyTokenV2 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "ETH");

  // 部署 BondlyTokenV2 合约（使用代理模式）
  console.log("\n部署 BondlyTokenV2...");
  const BondlyTokenV2 = await ethers.getContractFactory("BondlyTokenV2");
  
  // 使用代理模式部署
  const daoAddress = deployer.address; // 暂时使用部署者地址作为DAO地址
  const bondlyTokenV2 = await upgrades.deployProxy(
    BondlyTokenV2,
    [deployer.address, daoAddress], // initialize 函数的参数
    {
      initializer: "initialize",
      kind: "uups"
    }
  );
  await bondlyTokenV2.waitForDeployment();
  
  const bondlyTokenV2Address = await bondlyTokenV2.getAddress();
  console.log("BondlyTokenV2 已部署到:", bondlyTokenV2Address);

  // 获取合约信息
  const name = await bondlyTokenV2.name();
  const symbol = await bondlyTokenV2.symbol();
  const decimals = await bondlyTokenV2.decimals();
  const totalSupply = await bondlyTokenV2.totalSupply();
  const maxSupply = await bondlyTokenV2.maxSupply();

  console.log("\n合约信息:");
  console.log("- 名称:", name);
  console.log("- 符号:", symbol);
  console.log("- 小数位:", decimals);
  console.log("- 当前供应量:", ethers.formatEther(totalSupply));
  console.log("- 最大供应量:", ethers.formatEther(maxSupply));

  // 检查部署者的铸币权限
  const minterRole = await bondlyTokenV2.MINTER_ROLE();
  const hasMinterRole = await bondlyTokenV2.hasRole(minterRole, deployer.address);
  console.log("- 部署者是否有铸币权限:", hasMinterRole);

  // 等待几个区块确认
  console.log("\n等待区块确认...");
  await bondlyTokenV2.deploymentTransaction()?.wait(5);

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("\n网络信息:", {
    name: network.name,
    chainId: Number(network.chainId),
  });

  console.log("\n部署完成！");
  console.log("合约地址:", bondlyTokenV2Address);
  
  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contract: "BondlyTokenV2",
    address: bondlyTokenV2Address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: bondlyTokenV2.deploymentTransaction()?.hash,
  };

  console.log("\n部署信息:", JSON.stringify(deploymentInfo, null, 2));

  return bondlyTokenV2Address;
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