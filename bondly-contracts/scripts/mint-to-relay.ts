import { ethers } from "hardhat";

async function main() {
  console.log("🪙 开始给中转账户铸币...\n");

  // 从环境变量获取配置
  const CONTRACT_ADDRESS = process.env.BOND_TOKEN_ADDRESS;
  const RELAY_ADDRESS = process.env.RELAY_ADDRESS; // 中转账户地址
  const MINT_AMOUNT = process.env.MINT_AMOUNT || "10000"; // 默认10000 BOND

  if (!CONTRACT_ADDRESS) {
    console.error("❌ 请设置 BOND_TOKEN_ADDRESS 环境变量");
    process.exit(1);
  }

  if (!RELAY_ADDRESS) {
    console.error("❌ 请设置 RELAY_ADDRESS 环境变量（中转账户地址）");
    process.exit(1);
  }

  // 获取部署者账户（有铸币权限）
  const [deployer] = await ethers.getSigners();
  console.log("📝 铸币账户（部署者）:", deployer.address);
  console.log("🏦 中转账户地址:", RELAY_ADDRESS);
  console.log("💰 铸币数量:", MINT_AMOUNT, "BOND");

  // 连接到V2合约
  const BondlyTokenV2 = await ethers.getContractFactory("BondlyTokenV2");
  const bondToken = BondlyTokenV2.attach(CONTRACT_ADDRESS);

  try {
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
    const minterRole = await bondToken.MINTER_ROLE();
    const hasMinterRole = await bondToken.hasRole(minterRole, deployer.address);
    const dao = await bondToken.dao();
    
    console.log("部署者是否有MINTER_ROLE:", hasMinterRole ? "✅ 是" : "❌ 否");
    console.log("DAO 地址:", dao);
    console.log("部署者是否为DAO:", dao.toLowerCase() === deployer.address.toLowerCase() ? "✅ 是" : "❌ 否");

    // 检查权限
    if (!hasMinterRole && dao.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("\n❌ 权限不足！");
      console.log("部署者既没有MINTER_ROLE，也不是DAO地址");
      return;
    }

    // 检查中转账户余额（铸币前）
    const relayBalanceBefore = await bondToken.balanceOf(RELAY_ADDRESS);
    console.log("\n📋 中转账户余额（铸币前）:", ethers.formatEther(relayBalanceBefore), "BOND");

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
    const reason = `中转账户铸币 - ${new Date().toISOString()}`;
    
    const mintTx = await bondToken.mint(
      RELAY_ADDRESS,
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
    const relayBalanceAfter = await bondToken.balanceOf(RELAY_ADDRESS);
    const newTotalSupply = await bondToken.totalSupply();
    
    console.log("中转账户余额:", ethers.formatEther(relayBalanceAfter), "BOND");
    console.log("中转账户余额变化:", ethers.formatEther(relayBalanceAfter - relayBalanceBefore), "BOND");
    console.log("新总供应量:", ethers.formatEther(newTotalSupply), "BOND");

    console.log("\n🎉 中转账户铸币完成!");
    console.log("💡 现在可以使用 transfer-from-relay.ts 脚本给用户发币了");

  } catch (error: any) {
    console.error("\n❌ 铸币操作失败:");
    
    if (error.message.includes("Caller must have MINTER_ROLE or be DAO")) {
      console.error("错误原因: 调用者必须有MINTER_ROLE权限或者是DAO地址");
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