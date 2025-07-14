import { ethers } from "hardhat";

async function main() {
  console.log("🔄 开始中转账户给用户转账操作...\n");

  // 从环境变量获取配置
  const CONTRACT_ADDRESS = process.env.BOND_TOKEN_ADDRESS;
  const RELAY_PRIVATE_KEY = process.env.RELAY_PRIVATE_KEY; // 中转账户私钥
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;
  const TRANSFER_AMOUNT = process.env.TRANSFER_AMOUNT || "100"; // 默认100 BOND

  if (!CONTRACT_ADDRESS) {
    console.error("❌ 请设置 BOND_TOKEN_ADDRESS 环境变量");
    process.exit(1);
  }

  if (!RELAY_PRIVATE_KEY) {
    console.error("❌ 请设置 RELAY_PRIVATE_KEY 环境变量（中转账户私钥）");
    process.exit(1);
  }

  if (!RECIPIENT_ADDRESS) {
    console.error("❌ 请设置 RECIPIENT_ADDRESS 环境变量");
    process.exit(1);
  }

  // 创建中转账户签名者
  const relaySigner = new ethers.Wallet(RELAY_PRIVATE_KEY, ethers.provider);
  const relayAddress = relaySigner.address;
  
  console.log("🏦 中转账户地址:", relayAddress);
  console.log("📥 接收地址:", RECIPIENT_ADDRESS);
  console.log("💰 转账数量:", TRANSFER_AMOUNT, "BOND");

  // 连接到V2合约
  const BondlyTokenV2 = await ethers.getContractFactory("BondlyTokenV2");
  const bondToken = BondlyTokenV2.attach(CONTRACT_ADDRESS);
  const bondTokenWithRelay = bondToken.connect(relaySigner) as any;

  try {
    // 检查合约信息
    console.log("\n📊 检查合约状态...");
    const name = await bondToken.name();
    const symbol = await bondToken.symbol();
    const decimals = await bondToken.decimals();
    
    console.log("合约名称:", name);
    console.log("合约符号:", symbol);
    console.log("小数位数:", decimals);

    // 检查中转账户余额
    console.log("\n💰 检查中转账户余额...");
    const relayBalance = await bondToken.balanceOf(relayAddress);
    console.log("中转账户余额:", ethers.formatEther(relayBalance), "BOND");

    // 检查接收者余额（转账前）
    const recipientBalanceBefore = await bondToken.balanceOf(RECIPIENT_ADDRESS);
    console.log("接收者余额（转账前）:", ethers.formatEther(recipientBalanceBefore), "BOND");

    // 转换转账数量为wei
    const transferAmountWei = ethers.parseEther(TRANSFER_AMOUNT);
    console.log("转账数量 (wei):", transferAmountWei.toString());

    // 检查余额是否足够
    if (relayBalance < transferAmountWei) {
      console.error("❌ 中转账户余额不足！");
      console.log("当前余额:", ethers.formatEther(relayBalance), "BOND");
      console.log("需要转账:", TRANSFER_AMOUNT, "BOND");
      console.log("\n💡 解决方案:");
      console.log("1. 先给中转账户铸币");
      console.log("2. 或者从其他账户转入代币到中转账户");
      return;
    }

    // 检查合约是否暂停
    console.log("\n🔍 检查合约状态...");
    const isPaused = await bondToken.paused();
    if (isPaused) {
      console.error("❌ 合约已暂停，无法转账");
      return;
    }
    console.log("合约状态: 正常运行");

    // 检查中转账户ETH余额（支付gas费用）
    const ethBalance = await ethers.provider.getBalance(relayAddress);
    console.log("中转账户ETH余额:", ethers.formatEther(ethBalance), "ETH");

    if (ethBalance < ethers.parseEther("0.01")) {
      console.error("❌ 中转账户ETH余额不足支付gas费用！");
      console.log("当前ETH余额:", ethers.formatEther(ethBalance), "ETH");
      console.log("建议至少保持0.01 ETH用于gas费用");
      return;
    }

    // 执行转账操作
    console.log("\n🚀 执行转账操作...");
    
    const transferTx = await bondTokenWithRelay.transfer(
      RECIPIENT_ADDRESS,
      transferAmountWei
    );

    console.log("⏳ 交易已提交，等待确认...");
    console.log("交易哈希:", transferTx.hash);

    const receipt = await transferTx.wait();
    console.log("✅ 转账成功!");
    console.log("区块号:", receipt.blockNumber);
    console.log("Gas 使用量:", receipt.gasUsed.toString());

    // 检查转账后状态
    console.log("\n📊 转账后状态:");
    const relayBalanceAfter = await bondToken.balanceOf(relayAddress);
    const recipientBalanceAfter = await bondToken.balanceOf(RECIPIENT_ADDRESS);
    const ethBalanceAfter = await ethers.provider.getBalance(relayAddress);
    
    console.log("中转账户BOND余额:", ethers.formatEther(relayBalanceAfter), "BOND");
    console.log("中转账户BOND余额变化:", ethers.formatEther(relayBalance - relayBalanceAfter), "BOND");
    console.log("接收者BOND余额:", ethers.formatEther(recipientBalanceAfter), "BOND");
    console.log("接收者BOND余额变化:", ethers.formatEther(recipientBalanceAfter - recipientBalanceBefore), "BOND");
    console.log("中转账户ETH余额:", ethers.formatEther(ethBalanceAfter), "ETH");
    console.log("中转账户ETH余额变化:", ethers.formatEther(ethBalance - ethBalanceAfter), "ETH");

    // 验证转账结果
    const expectedRecipientBalance = recipientBalanceBefore + transferAmountWei;
    if (recipientBalanceAfter === expectedRecipientBalance) {
      console.log("✅ 转账金额验证成功");
    } else {
      console.error("❌ 转账金额验证失败");
    }

    console.log("\n🎉 中转账户转账操作完成!");

  } catch (error: any) {
    console.error("\n❌ 转账操作失败:");
    
    if (error.message.includes("ERC20: transfer amount exceeds balance")) {
      console.error("错误原因: 中转账户BOND余额不足");
      console.log("💡 解决方案: 先给中转账户铸币或转入代币");
    } else if (error.message.includes("ERC20: transfer to the zero address")) {
      console.error("错误原因: 不能转账到零地址");
    } else if (error.message.includes("Pausable: paused")) {
      console.error("错误原因: 合约已暂停");
    } else if (error.message.includes("insufficient funds")) {
      console.error("错误原因: 中转账户ETH余额不足支付gas费用");
      console.log("💡 解决方案: 向中转账户转入一些ETH用于支付gas费用");
    } else if (error.message.includes("invalid private key")) {
      console.error("错误原因: 中转账户私钥格式错误");
      console.log("💡 解决方案: 检查RELAY_PRIVATE_KEY环境变量格式");
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