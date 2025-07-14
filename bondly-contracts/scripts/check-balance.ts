import { ethers } from "hardhat";

async function main() {
  console.log("检查 BOND 代币余额...\n");

  // 新的合约地址（从环境变量获取）
  const contractAddress = process.env.SEPOLIA_BOND_TOKEN_ADDRESS || "0x2D82FbF7d0a7e94FcdA6E24f7351f1BbFCb55CdC";
  console.log("合约地址:", contractAddress);

  // 要检查的账户地址
  const accountAddress = "0xb1DB1B4aaa31dbE294A628d3A4B1Fc424Df0fa16";
  console.log("检查账户:", accountAddress);

  // 获取合约实例
  const BondlyToken = await ethers.getContractFactory("BondlyTokenUpgradeable");
  const bondToken = BondlyToken.attach(contractAddress);

  try {
    // 读取基本信息
    const name = await bondToken.name();
    const symbol = await bondToken.symbol();
    const decimals = await bondToken.decimals();
    const totalSupply = await bondToken.totalSupply();
    
    console.log("\n=== 合约信息 ===");
    console.log("合约名称:", name);
    console.log("合约符号:", symbol);
    console.log("小数位数:", decimals);
    console.log("当前总供应量:", ethers.formatEther(totalSupply));

    // 检查账户余额
    const balance = await bondToken.balanceOf(accountAddress);
    console.log("\n=== 账户余额 ===");
    console.log("账户地址:", accountAddress);
    console.log("BOND 余额:", ethers.formatEther(balance));
    console.log("BOND 余额 (原始值):", balance.toString());

    // 检查 ETH 余额
    const provider = ethers.provider;
    const ethBalance = await provider.getBalance(accountAddress);
    console.log("ETH 余额:", ethers.formatEther(ethBalance), "ETH");

    console.log("\n=== 如何添加 BOND 代币到钱包 ===");
    console.log("1. 在钱包中添加自定义代币");
    console.log("2. 输入合约地址:", contractAddress);
    console.log("3. 代币符号: BOND");
    console.log("4. 小数位数: 18");
    console.log("5. 代币名称: Bondly Token");

    console.log("\n=== Etherscan 链接 ===");
    console.log("合约页面: https://sepolia.etherscan.io/token/" + contractAddress);
    console.log("交易哈希: https://sepolia.etherscan.io/tx/0xd327a8751088de17b9fdd44fd4905b5db8baf916454fd610c923afd3ef0ca22c");

  } catch (error) {
    console.error("❌ 检查余额失败:", error);
  }
}

main()
  .then(() => {
    console.log("\n✅ BOND 代币余额检查完成！");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 脚本执行失败:", error);
    process.exit(1);
  }); 