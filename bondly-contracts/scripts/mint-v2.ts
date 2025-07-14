import { ethers } from "hardhat";

async function main() {
  console.log("🪙 开始 BOND V2 代币铸币操作...\n");

  // 从环境变量获取配置
  const CONTRACT_ADDRESS = process.env.BOND_TOKEN_ADDRESS;
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS || process.env.WALLET_ADDRESS;
  const MINT_AMOUNT = process.env.MINT_AMOUNT || "1000"; // 默认1000 BOND

  if (!CONTRACT_ADDRESS) {
    console.error("❌ 请设置 BOND_TOKEN_ADDRESS 环境变量");
    process.exit(1);
  }

  if (!RECIPIENT_ADDRESS) {
    console.error("❌ 请设置 RECIPIENT_ADDRESS 或 WALLET_ADDRESS 环境变量");
    process.exit(1);
  }

  // 获取签名者（部署者账户）
  const [deployer] = await ethers.getSigners();
  console.log("📝 操作账户:", deployer.address);
  console.log("🎯 接收地址:", RECIPIENT_ADDRESS);
  console.log("💰 铸币数量:", MINT_AMOUNT, "BOND");

  // 连接到V2合约
  const BondlyTokenV2 = await ethers.getContractFactory("BondlyTokenV2");
  const bondToken = BondlyTokenV2.attach(CONTRACT_ADDRESS);

  try {
    // 检查是否为V2版本
    console.log("\n🔍 检查合约版本...");
    try {
      const isV2 = await bondToken.versionV2();
      console.log("V2版本检测:", isV2 ? "✅ 确认为V2版本" : "❌ 非V2版本");
    } catch (error) {
      console.log("⚠️  无法检测V2版本，可能为V1版本");
    }

    // 检查合约信息
    console.log("\n📊 检查合约状态...");
    const name = await bondToken.name();
    const symbol = await bondToken.symbol();
    const totalSupply = await bondToken.totalSupply();
    const maxSupply = await bondToken.maxSupply();
    
    console.log("合约名称:", name);
    console.log("合约符号:", symbol);
    console.log("当前总供应量:", ethers.formatEther(totalSupply), "BOND");
    console.log("最大供应量:", ethers.formatEther(maxSupply), "BOND");

    // 检查铸币权限
    console.log("\n🔐 检查铸币权限...");
    const isMinter = await bondToken.isMinter(deployer.address);
    const dao = await bondToken.dao();
    
    console.log("当前账户是否有MINTER_ROLE:", isMinter ? "✅ 是" : "❌ 否");
    console.log("DAO 地址:", dao);
    console.log("当前账户是否为DAO:", dao.toLowerCase() === deployer.address.toLowerCase() ? "✅ 是" : "❌ 否");

    // 检查权限
    if (!isMinter && dao.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("\n❌ 权限不足！");
      console.log("当前账户既没有MINTER_ROLE，也不是DAO地址");
      console.log("\n解决方案:");
      console.log("1. 使用有MINTER_ROLE的账户");
      console.log("2. 使用DAO账户");
      console.log("3. 请管理员为当前账户添加MINTER_ROLE");
      return;
    }

    // 检查接收地址余额（铸币前）
    const balanceBefore = await bondToken.balanceOf(RECIPIENT_ADDRESS);
    console.log("\n📋 铸币前余额:", ethers.formatEther(balanceBefore), "BOND");

    // 转换铸币数量为wei
    const mintAmountWei = ethers.parseEther(MINT_AMOUNT);
    console.log("💰 铸币数量 (wei):", mintAmountWei.toString());

    // 检查是否会超过最大供应量
    if (totalSupply + mintAmountWei > maxSupply) {
      console.error("❌ 铸币数量超过最大供应量限制");
      console.log("当前总供应量:", ethers.formatEther(totalSupply));
      console.log("尝试铸币数量:", MINT_AMOUNT);
      console.log("最大供应量:", ethers.formatEther(maxSupply));
      return;
    }

    // 执行铸币操作
    console.log("\n🚀 执行铸币操作...");
    const reason = `V2铸币奖励 - ${new Date().toISOString()}`;
    
    const mintTx = await bondToken.mint(
      RECIPIENT_ADDRESS,
      mintAmountWei,
      reason
    );

    console.log("⏳ 交易已提交，等待确认...");
    console.log("交易哈希:", mintTx.hash);

    const receipt = await mintTx.wait();
    console.log("✅ 铸币成功!");
    console.log("区块号:", receipt.blockNumber);
    console.log("Gas 使用量:", receipt.gasUsed.toString());

    // 检查铸币后状态
    console.log("\n📊 铸币后状态:");
    const balanceAfter = await bondToken.balanceOf(RECIPIENT_ADDRESS);
    const newTotalSupply = await bondToken.totalSupply();
    
    console.log("接收地址余额:", ethers.formatEther(balanceAfter), "BOND");
    console.log("新增余额:", ethers.formatEther(balanceAfter - balanceBefore), "BOND");
    console.log("新总供应量:", ethers.formatEther(newTotalSupply), "BOND");

    console.log("\n🎉 V2铸币操作完成!");

  } catch (error: any) {
    console.error("\n❌ 铸币操作失败:");
    
    if (error.message.includes("Caller must have MINTER_ROLE or be DAO")) {
      console.error("错误原因: 调用者必须有MINTER_ROLE权限或者是DAO地址");
      console.log("\n解决方案:");
      console.log("1. 确保当前账户有MINTER_ROLE权限");
      console.log("2. 或者使用DAO账户进行操作");
      console.log("3. 请管理员添加MINTER_ROLE权限");
    } else if (error.message.includes("Exceeds max supply")) {
      console.error("错误原因: 超过最大供应量限制");
    } else if (error.message.includes("Pausable: paused")) {
      console.error("错误原因: 合约已暂停");
    } else {
      console.error("具体错误:", error.message);
    }
  }
}

main()
  .then(() => {
    console.log("\n✅ 脚本执行完成");
    process.exit(0);
  })
  .catch((error: any) => {
    console.error("\n❌ 脚本执行失败:", error);
    process.exit(1);
  }); 