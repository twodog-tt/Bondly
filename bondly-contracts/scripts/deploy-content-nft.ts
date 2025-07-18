import { ethers } from "hardhat";
import { verify } from "./utils/verify";

async function main() {
  console.log("🚀 开始部署 ContentNFT 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "ETH");

  // 获取 BondlyRegistry 合约地址
  const registryAddress = process.env.REGISTRY_ADDRESS;
  if (!registryAddress) {
    throw new Error("❌ 请设置 REGISTRY_ADDRESS 环境变量");
  }

  console.log("📋 BondlyRegistry 地址:", registryAddress);

  // 部署 ContentNFT 合约
  console.log("\n📋 部署 ContentNFT 合约...");
  const ContentNFTFactory = await ethers.getContractFactory("ContentNFT");
  const contentNFT = await ContentNFTFactory.deploy(
    "Bondly Content NFT",  // name
    "BCNFT",               // symbol
    deployer.address,      // initialOwner
    registryAddress        // registry address
  );
  
  await contentNFT.waitForDeployment();
  const contentNFTAddress = await contentNFT.getAddress();
  console.log("✅ ContentNFT 已部署:", contentNFTAddress);

  // 等待几个区块确认
  console.log("\n⏳ 等待区块确认...");
  await contentNFT.deploymentTransaction()?.wait(5);

  // 验证合约信息
  console.log("\n🔍 验证合约信息...");
  const name = await contentNFT.name();
  const symbol = await contentNFT.symbol();
  const registry = await contentNFT.registry();
  
  console.log("📊 ContentNFT 合约信息:");
  console.log("  - 名称:", name);
  console.log("  - 符号:", symbol);
  console.log("  - Registry 地址:", registry);

  // 注册到 BondlyRegistry
  console.log("\n📋 注册到 BondlyRegistry...");
  const registryContract = await ethers.getContractAt("BondlyRegistry", registryAddress);
  
  const registerTx = await registryContract.setContractAddress("CONTENT_NFT", "v1", contentNFTAddress);
  await registerTx.wait();
  console.log("✅ ContentNFT 已注册到 Registry");

  // 验证注册
  const registeredAddress = await registryContract.getContractAddress("CONTENT_NFT");
  console.log("🔍 验证注册地址:", registeredAddress);
  
  if (registeredAddress === contentNFTAddress) {
    console.log("✅ 注册验证成功！");
  } else {
    console.log("❌ 注册验证失败！");
  }

  // 测试铸造一个NFT
  console.log("\n🧪 测试铸造NFT...");
  const testContentMeta = {
    title: "测试文章",
    summary: "这是一个测试NFT的摘要",
    coverImage: "https://example.com/cover.jpg",
    ipfsLink: "https://ipfs.io/ipfs/QmTestHash123456789",
    tokenUri: "https://ipfs.io/ipfs/QmTestMetadata123456789"
  };

  const mintTx = await contentNFT.mint(
    deployer.address,
    testContentMeta.title,
    testContentMeta.summary,
    testContentMeta.coverImage,
    testContentMeta.ipfsLink,
    testContentMeta.tokenUri
  );
  
  await mintTx.wait();
  console.log("✅ 测试NFT铸造成功");

  // 验证NFT信息
  const tokenId = 1; // 第一个NFT的ID
  const tokenOwner = await contentNFT.ownerOf(tokenId);
  const contentMeta = await contentNFT.getContentMeta(tokenId);
  
  console.log("📊 测试NFT信息:");
  console.log("  - Token ID:", tokenId);
  console.log("  - 所有者:", tokenOwner);
  console.log("  - 标题:", contentMeta.title);
  console.log("  - 作者:", contentMeta.author);
  console.log("  - IPFS Hash:", contentMeta.ipfsHash);

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("\n🌐 网络信息:", {
    name: network.name,
    chainId: network.chainId,
  });

  // 验证合约（如果支持）
  if (Number(network.chainId) !== 31337) { // 不是本地网络
    console.log("\n🔍 开始验证合约...");
    try {
      await verify(contentNFTAddress, [
        "Bondly Content NFT",
        "BCNFT", 
        registryAddress
      ]);
      console.log("✅ 合约验证成功！");
    } catch (error) {
      console.log("❌ 合约验证失败:", error);
    }
  }

  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contract: "ContentNFT",
    address: contentNFTAddress,
    deployer: deployer.address,
    registry: registryAddress,
    timestamp: new Date().toISOString(),
    transactionHash: contentNFT.deploymentTransaction()?.hash,
  };

  console.log("\n📋 部署信息:", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 ContentNFT 合约部署完成!");
  console.log("\n📋 部署摘要:");
  console.log("  ContentNFT:", contentNFTAddress);
  console.log("  BondlyRegistry:", registryAddress);
  console.log("  Token Name:", name);
  console.log("  Token Symbol:", symbol);

  return contentNFTAddress;
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