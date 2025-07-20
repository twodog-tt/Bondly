import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// 加载环境变量
dotenv.config();

async function main() {
  console.log("🚀 Deploying ContentNFTV2 to Sepolia...");

  // 检查环境变量
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  if (!process.env.SEPOLIA_RPC_URL) {
    throw new Error("SEPOLIA_RPC_URL not found in environment variables");
  }

  // 获取部署者账户
  const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, ethers.provider);
  console.log("Deployer address:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("Insufficient balance for deployment. Need at least 0.01 ETH");
  }

  // Sepolia 上的已知合约地址
  const registryAddress = "0x2B17c8e42a1B81e5f57e564225634123f9F34E97"; // BondlyRegistry on Sepolia
  const feeReceiver = deployer.address; // 费用接收地址

  console.log("\n📋 Deployment Parameters:");
  console.log("Network: Sepolia Testnet");
  console.log("Registry Address:", registryAddress);
  console.log("Fee Receiver:", feeReceiver);
  console.log("Initial Mint Fee: 0.01 ETH");

  try {
    // 部署 ContentNFTV2 合约
    console.log("\n⏳ Deploying ContentNFTV2 contract...");
    const ContentNFTV2 = await ethers.getContractFactory("ContentNFTV2");
    const contentNFTV2 = await ContentNFTV2.connect(deployer).deploy(
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
        const registerTx = await registry.connect(deployer).registerContract(
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
    const adminMintTx = await contentNFTV2.connect(deployer).mint(
      deployer.address,
      "Sepolia Test Article",
      "This is a test article for ContentNFTV2 on Sepolia",
      "https://example.com/cover.jpg",
      "https://ipfs.io/ipfs/QmTestHash",
      "https://ipfs.io/ipfs/QmTestMetadata"
    );
    await adminMintTx.wait();
    console.log("✅ Admin mint successful");

    // 测试付费铸造
    console.log("Testing fee-based mint...");
    const mintFeeWei = await contentNFTV2.mintFee();
    const feeMintTx = await contentNFTV2.connect(deployer).mintWithFee(
      deployer.address,
      "Sepolia Paid Test Article",
      "This is a paid test article on Sepolia",
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
    console.log("Network: Sepolia Testnet");
    console.log("Contract Address:", contentNFTV2Address);
    console.log("Registry Address:", registryAddress);
    console.log("Fee Receiver:", feeReceiverAddress);
    console.log("Mint Fee:", ethers.formatEther(mintFee), "ETH");
    console.log("==================================");

    // 保存部署信息到文件
    const deploymentInfo = {
      network: "sepolia",
      contractAddress: contentNFTV2Address,
      deployer: deployer.address,
      transactionHash: contentNFTV2.deploymentTransaction()?.hash,
      deploymentTime: new Date().toISOString(),
      mintFee: ethers.formatEther(mintFee),
      feeReceiver: feeReceiverAddress
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployment-info-sepolia.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n📄 Deployment info saved to deployment-info-sepolia.json");

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