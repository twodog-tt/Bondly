import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying ContentNFTV2...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // 已知的合约地址
  const registryAddress = "0x2B17c8e42a1B81e5f57e564225634123f9F34E97"; // BondlyRegistry
  const feeReceiver = deployer.address; // 费用接收地址，暂时设置为部署者地址

  console.log("\n📋 Deployment Parameters:");
  console.log("Registry Address:", registryAddress);
  console.log("Fee Receiver:", feeReceiver);
  console.log("Initial Mint Fee: 0.01 ETH");

  try {
    // 部署 ContentNFTV2 合约
    console.log("\n⏳ Deploying ContentNFTV2 contract...");
    const ContentNFTV2 = await ethers.getContractFactory("ContentNFTV2");
    const contentNFTV2 = await ContentNFTV2.deploy(
      "Bondly Content NFT", // name
      "BCNFT",              // symbol
      deployer.address,     // initialOwner
      registryAddress,      // registryAddress
      feeReceiver          // feeReceiver
    );

    await contentNFTV2.waitForDeployment();
    const contentNFTV2Address = await contentNFTV2.getAddress();

    console.log("✅ ContentNFTV2 deployed successfully!");
    console.log("Contract Address:", contentNFTV2Address);
    console.log("Transaction Hash:", contentNFTV2.deploymentTransaction()?.hash);

    // 验证合约部署
    console.log("\n🔍 Verifying contract deployment...");
    const name = await contentNFTV2.name();
    const symbol = await contentNFTV2.symbol();
    const hasAdminRole = await contentNFTV2.hasRole(await contentNFTV2.DEFAULT_ADMIN_ROLE(), deployer.address);
    const mintFee = await contentNFTV2.mintFee();
    const feeReceiverAddress = await contentNFTV2.feeReceiver();

    console.log("Contract Name:", name);
    console.log("Contract Symbol:", symbol);
    console.log("Deployer has Admin Role:", hasAdminRole);
    console.log("Mint Fee:", ethers.formatEther(mintFee), "ETH");
    console.log("Fee Receiver:", feeReceiverAddress);

    // 注册到 Registry（如果 Registry 合约支持）
    console.log("\n📝 Registering to BondlyRegistry...");
    try {
      const registry = await ethers.getContractAt("BondlyRegistry", registryAddress);
      
      // 检查是否已经注册
      const isRegistered = await registry.isContractRegistered("ContentNFTV2", "2.0.0");
      
      if (!isRegistered) {
        const registerTx = await registry.registerContract(
          "ContentNFTV2",
          "2.0.0",
          contentNFTV2Address,
          "Content NFT with fee-based minting"
        );
        await registerTx.wait();
        console.log("✅ ContentNFTV2 registered to Registry");
      } else {
        console.log("ℹ️ ContentNFTV2 already registered in Registry");
      }
    } catch (error) {
      console.log("⚠️ Failed to register to Registry:", error);
    }

    // 测试铸造功能
    console.log("\n🧪 Testing minting functionality...");
    
    // 测试管理员免费铸造
    console.log("Testing admin mint (free)...");
    const adminMintTx = await contentNFTV2.mint(
      deployer.address,
      "Test Article",
      "This is a test article for ContentNFTV2",
      "https://example.com/cover.jpg",
      "https://ipfs.io/ipfs/QmTestHash",
      "https://ipfs.io/ipfs/QmTestMetadata"
    );
    await adminMintTx.wait();
    console.log("✅ Admin mint successful");

    // 测试付费铸造
    console.log("Testing fee-based mint...");
    const mintFeeWei = await contentNFTV2.mintFee();
    const feeMintTx = await contentNFTV2.mintWithFee(
      deployer.address,
      "Paid Test Article",
      "This is a paid test article",
      "https://example.com/paid-cover.jpg",
      "https://ipfs.io/ipfs/QmPaidTestHash",
      "https://ipfs.io/ipfs/QmPaidTestMetadata",
      { value: mintFeeWei }
    );
    await feeMintTx.wait();
    console.log("✅ Fee-based mint successful");

    // 验证铸造结果
    const totalSupply = await contentNFTV2.totalSupply();
    const userMintCount = await contentNFTV2.getUserMintCount(deployer.address);
    
    console.log("\n📊 Minting Results:");
    console.log("Total Supply:", totalSupply.toString());
    console.log("User Mint Count:", userMintCount.toString());

    // 获取NFT元数据
    const tokenId1 = 1;
    const tokenId2 = 2;
    
    const meta1 = await contentNFTV2.getContentMeta(tokenId1);
    const meta2 = await contentNFTV2.getContentMeta(tokenId2);
    
    console.log("\n📋 NFT Metadata:");
    console.log("Token #1:", {
      title: meta1.title,
      creator: meta1.creator,
      mintedAt: new Date(Number(meta1.mintedAt) * 1000).toISOString()
    });
    console.log("Token #2:", {
      title: meta2.title,
      creator: meta2.creator,
      mintedAt: new Date(Number(meta2.mintedAt) * 1000).toISOString()
    });

    console.log("\n🎉 ContentNFTV2 deployment and testing completed!");
    console.log("==================================");
    console.log("Contract Address:", contentNFTV2Address);
    console.log("Registry Address:", registryAddress);
    console.log("Fee Receiver:", feeReceiverAddress);
    console.log("Mint Fee:", ethers.formatEther(mintFee), "ETH");
    console.log("==================================");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 