import { run } from "hardhat";

export async function verify(contractAddress: string, args: any[]) {
  console.log("验证合约地址:", contractAddress);
  console.log("构造函数参数:", args);

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("合约已经验证过了");
    } else {
      console.log("验证失败:", error);
    }
  }
} 