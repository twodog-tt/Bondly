import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { BondlyTokenUpgradeable } from "../../typechain-types";
import { Signer } from "ethers";

describe("BondlyTokenUpgradeable - Basic", function () {
  let token: BondlyTokenUpgradeable;
  let owner: Signer, dao: Signer, user: Signer, other: Signer;
  let 
  ownerAddr: string, daoAddr: string, userAddr: string;

  beforeEach(async function () {
    [owner, dao, user, other] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    daoAddr = await dao.getAddress();
    userAddr = await user.getAddress();

    console.log("拥有者:", ownerAddr);
    console.log("DAO:", daoAddr);
    console.log("用户:", userAddr);

    // 部署可升级合约
    const Token = await ethers.getContractFactory("BondlyTokenUpgradeable");
    token = (await upgrades.deployProxy(Token, [ownerAddr, daoAddr], { initializer: "initialize" })) as any;
    await token.connect(owner).setDAO(daoAddr);
  });

  it("should mint tokens to user by DAO", async function () {
    const amount = ethers.parseEther("100");
    const balanceBefore = await token.balanceOf(userAddr);
    console.log("[铸造] 用户余额（前）:", balanceBefore.toString());
    const tx = await token.connect(dao).mint(userAddr, amount, "test-mint");
    const receipt = await tx.wait();
    if (receipt) {
      // 输出事件参数
      const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === "TokensMinted");
      if (event && "args" in event) {
        console.log("[铸造] TokensMinted 事件参数:", (event as any).args);
      }
    }
    const balanceAfter = await token.balanceOf(userAddr);
    console.log("[铸造] 用户余额（后）:", balanceAfter.toString());
    expect(balanceAfter).to.equal(amount);
  });

  it("should burn tokens from user by DAO", async function () {
    const amount = ethers.parseEther("50");
    await token.connect(dao).mint(userAddr, amount, "mint-for-burn");
    const balanceBefore = await token.balanceOf(userAddr);
    console.log("[销毁] 用户余额（前）:", balanceBefore.toString());
    const tx = await token.connect(dao).burn(userAddr, amount, "test-burn");
    const receipt = await tx.wait();
    if (receipt) {
      // 输出事件参数
      const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === "TokensBurned");
      if (event && "args" in event) {
        console.log("[销毁] TokensBurned 事件参数:", (event as any).args);
      }
    }
    const balanceAfter = await token.balanceOf(userAddr);
    console.log("[销毁] 用户余额（后）:", balanceAfter.toString());
    expect(balanceAfter).to.equal(0);
  });

  it("should not allow non-DAO to mint or burn", async function () {
    const amount = ethers.parseEther("10");
    console.log("[权限校验] 用用户账户尝试铸造和销毁（应失败）");
    await expect(token.connect(user).mint(userAddr, amount, "fail-mint")).to.be.revertedWith("Only DAO can call");
    await expect(token.connect(user).burn(userAddr, amount, "fail-burn")).to.be.revertedWith("Only DAO can call");
  });

  it("should batch mint tokens to multiple users by DAO", async function () {
    const users = [userAddr, await other.getAddress()];
    const amounts = [ethers.parseEther("10"), ethers.parseEther("20")];
    const balanceBefore1 = await token.balanceOf(users[0]);
    const balanceBefore2 = await token.balanceOf(users[1]);
    console.log("[批量铸造] 用户1余额（前）:", balanceBefore1.toString());
    console.log("[批量铸造] 用户2余额（前）:", balanceBefore2.toString());
    const tx = await token.connect(dao).batchMint(users, amounts, "batch-mint");
    const receipt = await tx.wait();
    if (receipt) {
      // 检查事件
      const mintedEvents = receipt.logs.filter((log: any) => log.fragment && log.fragment.name === "TokensMinted");
      mintedEvents.forEach((event: any, idx: number) => {
        if (event && "args" in event) {
          console.log(`[批量铸造] TokensMinted 事件参数[${idx}]:`, (event as any).args);
        }
      });
    }
    const balanceAfter1 = await token.balanceOf(users[0]);
    const balanceAfter2 = await token.balanceOf(users[1]);
    console.log("[批量铸造] 用户1余额（后）:", balanceAfter1.toString());
    console.log("[批量铸造] 用户2余额（后）:", balanceAfter2.toString());
    expect(balanceAfter1).to.equal(amounts[0]);
    expect(balanceAfter2).to.equal(amounts[1]);
  });

  it("should revert if batchMint arrays length mismatch", async function () {
    const users = [userAddr];
    const amounts = [ethers.parseEther("10"), ethers.parseEther("20")];
    await expect(token.connect(dao).batchMint(users, amounts, "fail-batch")).to.be.revertedWith("Arrays length mismatch");
  });

  it("PAUSER_ROLE 可以暂停和恢复合约，暂停后禁止转账和授权，恢复后恢复正常", async function () {
    // owner 默认有 PAUSER_ROLE
    const amount = ethers.parseEther("10");
    await token.connect(dao).mint(userAddr, amount, "for-pause");
    await token.connect(user).approve(ownerAddr, amount);
    // 暂停前转账和授权正常
    await token.connect(user).transfer(ownerAddr, amount);
    await token.connect(owner).pause("测试暂停");
    console.log("[暂停] 合约已暂停");
    // 暂停后转账、授权应被拒绝
    await expect(token.connect(user).transfer(ownerAddr, amount)).to.be.revertedWith("Pausable: paused");
    await expect(token.connect(user).approve(ownerAddr, amount)).to.be.revertedWithCustomError(token, "PausedOnlyRevokeAllowed");
    // 恢复合约
    await token.connect(owner).unpause();
    console.log("[恢复] 合约已恢复");
    // 恢复后转账、授权恢复正常
    await token.connect(dao).mint(userAddr, amount, "for-unpause");
    await expect(token.connect(user).transfer(ownerAddr, amount)).to.not.be.reverted;
    await expect(token.connect(user).approve(ownerAddr, amount)).to.not.be.reverted;
  });

  it("非 PAUSER_ROLE 账户不能暂停或恢复合约", async function () {
    await expect(token.connect(user).pause("fail-pause")).to.be.revertedWith(/AccessControl/);
    await expect(token.connect(user).unpause()).to.be.revertedWith(/AccessControl/);
  });

  it("transfer/transferFrom/approve 正常授权和转账流程", async function () {
    const amount = ethers.parseEther("10");
    // DAO mint 给 user
    await token.connect(dao).mint(userAddr, amount, "for-transfer");
    // user 授权 owner
    await token.connect(user).approve(ownerAddr, amount);
    let allowance = await token.allowance(userAddr, ownerAddr);
    console.log("[授权] 用户授权拥有者额度:", allowance.toString());
    expect(allowance).to.equal(amount);
    // owner 用 transferFrom 转账
    await token.connect(owner).transferFrom(userAddr, ownerAddr, amount);
    const balanceUser = await token.balanceOf(userAddr);
    const balanceOwner = await token.balanceOf(ownerAddr);
    console.log("[转账] 用户余额:", balanceUser.toString());
    console.log("[转账] 拥有者余额:", balanceOwner.toString());
    expect(balanceUser).to.equal(0);
    expect(balanceOwner).to.be.gte(amount); // 拥有者余额增加
    // 授权额度归零
    allowance = await token.allowance(userAddr, ownerAddr);
    expect(allowance).to.equal(0);
  });

  it("permit (EIP-2612) 授权流程", async function () {
    const amount = ethers.parseEther("5");
    await token.connect(dao).mint(userAddr, amount, "for-permit");
    const nonce = await token.nonces(userAddr);
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const name = await token.name();
    const version = "1";
    const chainId = (await ethers.provider.getNetwork()).chainId;
    const ownerWallet = await ethers.getImpersonatedSigner(userAddr);
    // 生成 permit 签名
    const domain = {
      name,
      version,
      chainId,
      verifyingContract: token.target.toString(),
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const values = {
      owner: userAddr,
      spender: ownerAddr,
      value: amount,
      nonce,
      deadline,
    };
    // 用 user 的私钥签名 permit
    const signature = await user.signTypedData(domain, types, values);
    const { v, r, s } = ethers.Signature.from(signature);
    // 用 permit 授权
    await token.permit(userAddr, ownerAddr, amount, deadline, v, r, s);
    const allowance = await token.allowance(userAddr, ownerAddr);
    console.log("[permit] 授权额度:", allowance.toString());
    expect(allowance).to.equal(amount);
    // owner 用 transferFrom 转账
    await token.connect(owner).transferFrom(userAddr, ownerAddr, amount);
    const balanceUser = await token.balanceOf(userAddr);
    const balanceOwner = await token.balanceOf(ownerAddr);
    console.log("[permit转账] 用户余额:", balanceUser.toString());
    console.log("[permit转账] 拥有者余额:", balanceOwner.toString());
    expect(balanceUser).to.equal(0);
    expect(balanceOwner).to.be.gte(amount);
  });

  it("DAO 可以 selfMint 给自己，用户可以 selfBurn 自己的代币", async function () {
    const amount = ethers.parseEther("7");
    // DAO selfMint
    const balanceBefore = await token.balanceOf(daoAddr);
    console.log("[selfMint] DAO 余额（前）:", balanceBefore.toString());
    const tx1 = await token.connect(dao).selfMint(amount, "dao-self-mint");
    const receipt1 = await tx1.wait();
    if (receipt1) {
      const event = receipt1.logs.find((log: any) => log.fragment && log.fragment.name === "TokensMinted");
      if (event && "args" in event) {
        console.log("[selfMint] TokensMinted 事件参数:", (event as any).args);
      }
    }
    const balanceAfter = await token.balanceOf(daoAddr);
    console.log("[selfMint] DAO 余额（后）:", balanceAfter.toString());
    expect(balanceAfter - balanceBefore).to.equal(amount);
    // DAO 转给 user
    await token.connect(dao).transfer(userAddr, amount);
    // 用户 selfBurn
    const userBalanceBefore = await token.balanceOf(userAddr);
    console.log("[selfBurn] 用户余额（前）:", userBalanceBefore.toString());
    const tx2 = await token.connect(user).selfBurn(amount, "user-self-burn");
    const receipt2 = await tx2.wait();
    if (receipt2) {
      const event = receipt2.logs.find((log: any) => log.fragment && log.fragment.name === "TokensBurned");
      if (event && "args" in event) {
        console.log("[selfBurn] TokensBurned 事件参数:", (event as any).args);
      }
    }
    const userBalanceAfter = await token.balanceOf(userAddr);
    console.log("[selfBurn] 用户余额（后）:", userBalanceAfter.toString());
    expect(userBalanceAfter).to.equal(0);
  });

  it("非 DAO 账户不能 selfMint，selfBurn 金额大于余额应被拒绝", async function () {
    const amount = ethers.parseEther("3");
    await expect(token.connect(user).selfMint(amount, "fail-self-mint")).to.be.revertedWith("Only DAO can call");
    // 先给 user 一点余额
    await token.connect(dao).mint(userAddr, amount, "for-self-burn");
    // 超额 selfBurn
    await expect(token.connect(user).selfBurn(amount * 2n, "fail-self-burn")).to.be.revertedWith("Insufficient balance");
  });

  it("只有 owner 可以 setDAO，只有 DAO 可以 setMaxSupply，且不能小于当前总供应量", async function () {
    // 1. 只有 owner 可以 setDAO
    const newDaoAddr = await other.getAddress();
    await expect(token.connect(user).setDAO(newDaoAddr)).to.be.revertedWith(/Ownable/);
    await expect(token.connect(owner).setDAO(newDaoAddr)).to.not.be.reverted;
    expect(await token.dao()).to.equal(newDaoAddr);
    // 恢复 dao 地址
    await token.connect(owner).setDAO(daoAddr);
    expect(await token.dao()).to.equal(daoAddr);
    // 2. 只有 DAO 可以 setMaxSupply
    const currentSupply = await token.totalSupply();
    const newMaxSupply = currentSupply + ethers.parseEther("100");
    await expect(token.connect(user).setMaxSupply(newMaxSupply)).to.be.revertedWith("Only DAO can call");
    await expect(token.connect(dao).setMaxSupply(newMaxSupply)).to.not.be.reverted;
    expect(await token.maxSupply()).to.equal(newMaxSupply);
    // 3. setMaxSupply 不能小于当前总供应量
    await expect(token.connect(dao).setMaxSupply(currentSupply - 1n)).to.be.revertedWith("Cannot be less than current supply");
    // 4. setMaxSupply 后 mint 不可超过新 maxSupply
    const left = newMaxSupply - currentSupply;
    await expect(token.connect(dao).mint(userAddr, left + 1n, "exceed-max")).to.be.revertedWith("Exceeds max supply");
    await expect(token.connect(dao).mint(userAddr, left, "max-ok")).to.not.be.reverted;
    expect(await token.totalSupply()).to.equal(newMaxSupply);
  });

  it("getTokenInfo 和 mintableSupply 返回信息正确，随 mint 变化", async function () {
    const info = await token.getTokenInfo();
    console.log("[getTokenInfo] 代币信息:", info);
    expect(info.tokenName).to.equal("Bondly Token");
    expect(info.tokenSymbol).to.equal("BOND");
    expect(info.tokenDecimals).to.equal(18);
    expect(info.currentSupply).to.equal(await token.totalSupply());
    expect(info.maxSupplyValue).to.equal(await token.maxSupply());
    // mintableSupply 初始正确
    const mintable1 = await token.mintableSupply();
    expect(mintable1).to.equal(info.maxSupplyValue - info.currentSupply);
    // mint 一些
    const amount = ethers.parseEther("1");
    await token.connect(dao).mint(userAddr, amount, "for-mintable");
    const mintable2 = await token.mintableSupply();
    expect(mintable2).to.equal(mintable1 - amount);
    console.log("[mintableSupply] 剩余可铸数量:", mintable2.toString());
  });

  it("UUPS 升级授权：非 DAO 账户不能升级，DAO 可升级到 V2", async function () {
    const TokenV2 = await ethers.getContractFactory("BondlyTokenV2");
    // 非 DAO 升级应被拒绝
    await expect(
      upgrades.upgradeProxy(token.target, TokenV2.connect(user))
    ).to.be.revertedWith("Token: Only DAO can upgrade");
    // DAO 升级
    const upgraded = await upgrades.upgradeProxy(token.target, TokenV2.connect(dao));
    expect(await upgraded.versionV2()).to.equal("2.0.0");
    console.log("[UUPS升级] 升级到 V2 成功，versionV2:", await upgraded.versionV2());
  });

  it("核心操作应触发正确事件，参数与操作一致", async function () {
    const amount = ethers.parseEther("2");
    // mint
    await expect(token.connect(dao).mint(userAddr, amount, "event-mint"))
      .to.emit(token, "TokensMinted").withArgs(userAddr, amount, "event-mint");
    // burn
    await expect(token.connect(dao).burn(userAddr, amount, "event-burn"))
      .to.emit(token, "TokensBurned").withArgs(userAddr, amount, "event-burn");
    // batchMint
    const users = [userAddr, await other.getAddress()];
    const amounts = [ethers.parseEther("1"), ethers.parseEther("3")];
    await expect(token.connect(dao).batchMint(users, amounts, "event-batch"))
      .to.emit(token, "TokensMinted").withArgs(userAddr, amounts[0], "event-batch")
      .and.to.emit(token, "TokensMinted").withArgs(users[1], amounts[1], "event-batch");
    // pause
    await expect(token.connect(owner).pause("event-pause"))
      .to.emit(token, "ContractPaused").withArgs(ownerAddr, "event-pause");
    // unpause
    await expect(token.connect(owner).unpause())
      .to.emit(token, "ContractUnpaused").withArgs(ownerAddr);
    // selfMint
    await token.connect(owner).setDAO(daoAddr); // 恢复 dao
    await expect(token.connect(dao).selfMint(amount, "event-self-mint"))
      .to.emit(token, "TokensMinted").withArgs(daoAddr, amount, "event-self-mint");
    // selfBurn
    await token.connect(dao).transfer(userAddr, amount);
    await expect(token.connect(user).selfBurn(amount, "event-self-burn"))
      .to.emit(token, "TokensBurned").withArgs(userAddr, amount, "event-self-burn");
  });

  // ========== 分支与异常边界测试 ========== //
  it("mint to 0 地址应被拒绝", async function () {
    const amount = ethers.parseEther("1");
    await expect(token.connect(dao).mint(ethers.ZeroAddress, amount, "zero")).to.be.revertedWith("Cannot mint to zero address");
  });
  it("mint 金额为 0 应被拒绝", async function () {
    await expect(token.connect(dao).mint(userAddr, 0, "zero")).to.be.revertedWith("Amount must be greater than 0");
  });
  it("mint 超过 maxSupply 应被拒绝", async function () {
    const max = await token.maxSupply();
    const total = await token.totalSupply();
    await expect(token.connect(dao).mint(userAddr, max - total + 1n, "exceed")).to.be.revertedWith("Exceeds max supply");
  });
  it("burn from 0 地址应被拒绝", async function () {
    const amount = ethers.parseEther("1");
    await expect(token.connect(dao).burn(ethers.ZeroAddress, amount, "zero")).to.be.revertedWith("Cannot burn from zero address");
  });
  it("burn 金额为 0 应被拒绝", async function () {
    await expect(token.connect(dao).burn(userAddr, 0, "zero")).to.be.revertedWith("Amount must be greater than 0");
  });
  it("burn 余额不足应被拒绝", async function () {
    const amount = ethers.parseEther("10000");
    await expect(token.connect(dao).burn(userAddr, amount, "insufficient")).to.be.revertedWith("Insufficient balance");
  });
  it("batchMint recipients 为空应被拒绝", async function () {
    await expect(token.connect(dao).batchMint([], [], "empty")).to.be.revertedWith("Empty arrays");
  });
  it("batchMint 包含 0 地址应被拒绝", async function () {
    await expect(token.connect(dao).batchMint([ethers.ZeroAddress], [ethers.parseEther("1")], "zero")).to.be.revertedWith("Cannot mint to zero address");
  });
  it("batchMint 包含 0 金额应被拒绝", async function () {
    await expect(token.connect(dao).batchMint([userAddr], [0], "zero")).to.be.revertedWith("Amount must be greater than 0");
  });
  it("batchMint 超过 maxSupply 应被拒绝", async function () {
    const max = await token.maxSupply();
    const total = await token.totalSupply();
    await expect(token.connect(dao).batchMint([userAddr], [max - total + 1n], "exceed")).to.be.revertedWith("Exceeds max supply");
  });
  it("approve 0 金额在暂停时允许，非 0 金额应被拒绝", async function () {
    await token.connect(owner).pause("for-approve");
    await expect(token.connect(user).approve(ownerAddr, 0)).to.not.be.reverted;
    await expect(token.connect(user).approve(ownerAddr, 1)).to.be.revertedWithCustomError(token, "PausedOnlyRevokeAllowed");
    await token.connect(owner).unpause();
  });
  it("transferFrom 余额不足应被拒绝", async function () {
    const amount = ethers.parseEther("1");
    await token.connect(user).approve(ownerAddr, amount);
    await expect(token.connect(owner).transferFrom(userAddr, ownerAddr, amount)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });
  it("selfBurn 金额为 0 应被拒绝", async function () {
    await expect(token.connect(user).selfBurn(0, "zero")).to.be.revertedWith("Amount must be greater than 0");
  });
  it("setMaxSupply 等于当前供应量应通过，少于当前供应量应被拒绝", async function () {
    const current = await token.totalSupply();
    await expect(token.connect(dao).setMaxSupply(current)).to.not.be.reverted;
    await expect(token.connect(dao).setMaxSupply(current - 1n)).to.be.revertedWith("Cannot be less than current supply");
  });
}); 