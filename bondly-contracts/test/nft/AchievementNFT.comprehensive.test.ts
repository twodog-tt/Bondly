import { ethers } from "hardhat";
import { expect } from "chai";
import { AchievementNFT } from "../../typechain-types";
import { Signer } from "ethers";

describe("AchievementNFT - 全面测试", function () {
  let nft: AchievementNFT;
  let owner: Signer, minter: Signer, burner: Signer, pauser: Signer, user: Signer, other: Signer, unauthorized: Signer;
  let ownerAddr: string, minterAddr: string, burnerAddr: string, pauserAddr: string, userAddr: string, otherAddr: string, unauthorizedAddr: string;

  beforeEach(async function () {
    [owner, minter, burner, pauser, user, other, unauthorized] = await ethers.getSigners();
    ownerAddr = await owner.getAddress();
    minterAddr = await minter.getAddress();
    burnerAddr = await burner.getAddress();
    pauserAddr = await pauser.getAddress();
    userAddr = await user.getAddress();
    otherAddr = await other.getAddress();
    unauthorizedAddr = await unauthorized.getAddress();
    
    const NFT = await ethers.getContractFactory("AchievementNFT");
    nft = (await NFT.deploy("成就NFT", "ACHV", ownerAddr, ownerAddr)) as any;
    await nft.waitForDeployment();
    
    // 授权角色
    await nft.connect(owner).grantRole(await nft.MINTER_ROLE(), minterAddr);
    await nft.connect(owner).grantRole(await nft.BURNER_ROLE(), burnerAddr);
    await nft.connect(owner).grantRole(await nft.PAUSER_ROLE(), pauserAddr);
  });

  describe("构造函数和初始化", function () {
    it("应该正确初始化合约", async function () {
      expect(await nft.name()).to.equal("成就NFT");
      expect(await nft.symbol()).to.equal("ACHV");
      expect(await nft.registry()).to.equal(ownerAddr);
      expect(await nft.hasRole(await nft.DEFAULT_ADMIN_ROLE(), ownerAddr)).to.be.true;
      expect(await nft.hasRole(await nft.MINTER_ROLE(), ownerAddr)).to.be.true;
      expect(await nft.hasRole(await nft.BURNER_ROLE(), ownerAddr)).to.be.true;
      expect(await nft.hasRole(await nft.PAUSER_ROLE(), ownerAddr)).to.be.true;
      console.log("[初始化] 合约角色设置正确");
    });

    it("应该支持 ERC165 接口检测", async function () {
      // ERC721 接口
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await nft.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
      
      // ERC721Enumerable 接口
      const ERC721_ENUMERABLE_INTERFACE_ID = "0x780e9d63";
      expect(await nft.supportsInterface(ERC721_ENUMERABLE_INTERFACE_ID)).to.be.true;
      
      // AccessControl 接口
      const ACCESS_CONTROL_INTERFACE_ID = "0x7965db0b";
      expect(await nft.supportsInterface(ACCESS_CONTROL_INTERFACE_ID)).to.be.true;
      
      // 不支持的接口
      const UNSUPPORTED_INTERFACE_ID = "0x12345678";
      expect(await nft.supportsInterface(UNSUPPORTED_INTERFACE_ID)).to.be.false;
      console.log("[接口] ERC165 接口检测正确");
    });
  });

  describe("铸造功能", function () {
    it("MINTER_ROLE 可以铸造成就 NFT", async function () {
      const tokenUri = "ipfs://Qm.../achv1.json";
      const tx = await nft.connect(minter).mintAchievement(userAddr, 1, tokenUri);
      const receipt = await tx.wait();
      const tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
      expect(await nft.ownerOf(tokenId)).to.equal(userAddr);
      expect(await nft.tokenURI(tokenId)).to.equal(tokenUri);
      expect(await nft.achievementOf(tokenId)).to.equal(1);
      expect(await nft.hasAchievement(userAddr, 1)).to.be.true;
      expect(await nft.mintedAt(tokenId)).to.be.gt(0);
      console.log("[铸造] 成功铸造 tokenId:", tokenId.toString());
    });

    it("非 MINTER_ROLE 不能铸造成就 NFT", async function () {
      const tokenUri = "ipfs://Qm.../achv1.json";
      await expect(
        nft.connect(unauthorized).mintAchievement(userAddr, 1, tokenUri)
      ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
      console.log("[权限] 非 MINTER_ROLE 被正确拒绝");
    });

    it("不能铸造到零地址", async function () {
      const tokenUri = "ipfs://Qm.../achv1.json";
      await expect(
        nft.connect(minter).mintAchievement(ethers.ZeroAddress, 1, tokenUri)
      ).to.be.revertedWith("Cannot mint to zero address");
      console.log("[验证] 零地址铸造被拒绝");
    });

    it("同一用户不能重复领取同一成就", async function () {
      const tokenUri = "ipfs://Qm.../achv1.json";
      await nft.connect(minter).mintAchievement(userAddr, 1, tokenUri);
      await expect(
        nft.connect(minter).mintAchievement(userAddr, 1, tokenUri)
      ).to.be.revertedWith("Already claimed");
      console.log("[重复] 重复领取被正确拒绝");
    });

    it("可以铸造多个不同的成就", async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      await nft.connect(minter).mintAchievement(userAddr, 2, "ipfs://Qm.../achv2.json");
      await nft.connect(minter).mintAchievement(userAddr, 3, "ipfs://Qm.../achv3.json");
      
      expect(await nft.balanceOf(userAddr)).to.equal(3);
      expect(await nft.hasAchievement(userAddr, 1)).to.be.true;
      expect(await nft.hasAchievement(userAddr, 2)).to.be.true;
      expect(await nft.hasAchievement(userAddr, 3)).to.be.true;
      console.log("[多成就] 成功铸造多个不同成就");
    });

    it("应该正确触发铸造事件", async function () {
      const tokenUri = "ipfs://Qm.../achv1.json";
      await expect(nft.connect(minter).mintAchievement(userAddr, 1, tokenUri))
        .to.emit(nft, "AchievementMinted")
        .withArgs(userAddr, 1, 1)
        .and.to.emit(nft, "AchievementGranted")
        .withArgs(userAddr, 1, 1);
      console.log("[事件] 铸造事件正确触发");
    });
  });

  describe("销毁功能", function () {
    let tokenId: bigint;

    beforeEach(async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
    });

    it("BURNER_ROLE 可以销毁成就 NFT", async function () {
      await expect(nft.connect(burner).burn(tokenId))
        .to.emit(nft, "AchievementBurned")
        .withArgs(userAddr, 1, tokenId);
      
      expect(await nft.balanceOf(userAddr)).to.equal(0);
      expect(await nft.hasAchievement(userAddr, 1)).to.be.false;
      console.log("[销毁] 成功销毁成就NFT");
    });

    it("非 BURNER_ROLE 不能销毁成就 NFT", async function () {
      await expect(
        nft.connect(unauthorized).burn(tokenId)
      ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
      console.log("[权限] 非 BURNER_ROLE 销毁被拒绝");
    });

    it("销毁后状态应该正确清理", async function () {
      const achievementId = await nft.achievementOf(tokenId);
      const tokenUri = await nft.tokenURI(tokenId);
      
      await nft.connect(burner).burn(tokenId);
      
      // 验证状态清理
      expect(await nft.hasAchievement(userAddr, achievementId)).to.be.false;
      console.log("[清理] 销毁后状态正确清理");
    });
  });

  describe("Soulbound 特性", function () {
    let tokenId: bigint;

    beforeEach(async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
    });

    it("成就NFT为Soulbound，不可转让", async function () {
      await expect(
        nft.connect(user).transferFrom(userAddr, otherAddr, tokenId)
      ).to.be.revertedWith("Soulbound: non-transferable");
      
      await expect(
        nft.connect(user)["safeTransferFrom(address,address,uint256)"](userAddr, otherAddr, tokenId)
      ).to.be.revertedWith("Soulbound: non-transferable");
      
      await expect(
        nft.connect(user)["safeTransferFrom(address,address,uint256,bytes)"](userAddr, otherAddr, tokenId, "0x")
      ).to.be.revertedWith("Soulbound: non-transferable");
      
      console.log("[Soulbound] 所有转让方式都被禁止");
    });

    it("不能通过 approve 和 transferFrom 转让", async function () {
      await nft.connect(user).approve(otherAddr, tokenId);
      await expect(
        nft.connect(other).transferFrom(userAddr, otherAddr, tokenId)
      ).to.be.revertedWith("Soulbound: non-transferable");
      console.log("[Soulbound] approve + transferFrom 也被禁止");
    });

    it("不能通过 setApprovalForAll 转让", async function () {
      await nft.connect(user).setApprovalForAll(otherAddr, true);
      await expect(
        nft.connect(other).transferFrom(userAddr, otherAddr, tokenId)
      ).to.be.revertedWith("Soulbound: non-transferable");
      console.log("[Soulbound] setApprovalForAll 也被禁止");
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      await nft.connect(minter).mintAchievement(userAddr, 2, "ipfs://Qm.../achv2.json");
      await nft.connect(minter).mintAchievement(userAddr, 3, "ipfs://Qm.../achv3.json");
    });

    it("可以查询用户所有成就", async function () {
      const [tokenIds, achievementIds] = await nft.getUserAchievements(userAddr);
      expect(tokenIds.length).to.equal(3);
      expect(achievementIds.length).to.equal(3);
      expect(achievementIds[0]).to.equal(1);
      expect(achievementIds[1]).to.equal(2);
      expect(achievementIds[2]).to.equal(3);
      console.log("[查询] 用户成就列表正确");
    });

    it("查询空用户应该返回空数组", async function () {
      const [tokenIds, achievementIds] = await nft.getUserAchievements(otherAddr);
      expect(tokenIds.length).to.equal(0);
      expect(achievementIds.length).to.equal(0);
      console.log("[查询] 空用户返回空数组");
    });

    it("可以查询单个成就信息", async function () {
      const tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
      expect(await nft.achievementOf(tokenId)).to.equal(1);
      expect(await nft.tokenURI(tokenId)).to.equal("ipfs://Qm.../achv1.json");
      expect(await nft.mintedAt(tokenId)).to.be.gt(0);
      console.log("[查询] 单个成就信息正确");
    });

    it("查询不存在的 tokenId 应该失败", async function () {
      await expect(nft.tokenURI(999)).to.be.revertedWith("Query for nonexistent token");
      console.log("[查询] 不存在tokenId查询被拒绝");
    });
  });

  describe("暂停功能", function () {
    it("PAUSER_ROLE 可以暂停合约", async function () {
      await expect(nft.connect(pauser).pause("紧急维护"))
        .to.emit(nft, "ContractPaused")
        .withArgs(pauserAddr, "紧急维护");
      
      expect(await nft.paused()).to.be.true;
      console.log("[暂停] 合约成功暂停");
    });

    it("非 PAUSER_ROLE 不能暂停合约", async function () {
      await expect(
        nft.connect(unauthorized).pause("测试")
      ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
      console.log("[权限] 非 PAUSER_ROLE 暂停被拒绝");
    });

    it("PAUSER_ROLE 可以恢复合约", async function () {
      await nft.connect(pauser).pause("测试");
      await expect(nft.connect(pauser).unpause())
        .to.emit(nft, "ContractUnpaused")
        .withArgs(pauserAddr);
      
      expect(await nft.paused()).to.be.false;
      console.log("[恢复] 合约成功恢复");
    });

    it("暂停时不能铸造", async function () {
      await nft.connect(pauser).pause("测试");
      await expect(
        nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json")
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");
      console.log("[暂停] 暂停时铸造被拒绝");
    });

    it("暂停时不能销毁", async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      const tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
      
      await nft.connect(pauser).pause("测试");
      await expect(
        nft.connect(burner).burn(tokenId)
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");
      console.log("[暂停] 暂停时销毁被拒绝");
    });
  });

  describe("管理功能", function () {
    it("DEFAULT_ADMIN_ROLE 可以设置成就 URI", async function () {
      await nft.connect(owner).setAchievementURI(1, "ipfs://Qm.../new-uri.json");
      expect(await nft.achievementURIs(1)).to.equal("ipfs://Qm.../new-uri.json");
      console.log("[管理] 成就URI设置成功");
    });

    it("非 DEFAULT_ADMIN_ROLE 不能设置成就 URI", async function () {
      await expect(
        nft.connect(unauthorized).setAchievementURI(1, "ipfs://Qm.../new-uri.json")
      ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
      console.log("[权限] 非管理员设置URI被拒绝");
    });
  });

  describe("角色管理", function () {
    it("DEFAULT_ADMIN_ROLE 可以授予角色", async function () {
      await nft.connect(owner).grantRole(await nft.MINTER_ROLE(), otherAddr);
      expect(await nft.hasRole(await nft.MINTER_ROLE(), otherAddr)).to.be.true;
      console.log("[角色] 角色授予成功");
    });

    it("DEFAULT_ADMIN_ROLE 可以撤销角色", async function () {
      await nft.connect(owner).revokeRole(await nft.MINTER_ROLE(), minterAddr);
      expect(await nft.hasRole(await nft.MINTER_ROLE(), minterAddr)).to.be.false;
      console.log("[角色] 角色撤销成功");
    });

    it("非 DEFAULT_ADMIN_ROLE 不能管理角色", async function () {
      await expect(
        nft.connect(unauthorized).grantRole(await nft.MINTER_ROLE(), otherAddr)
      ).to.be.revertedWithCustomError(nft, "AccessControlUnauthorizedAccount");
      console.log("[权限] 非管理员角色管理被拒绝");
    });
  });

  describe("边缘情况", function () {
    it("应该正确处理多个用户的成就", async function () {
      // 用户1获得成就
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      
      // 用户2获得相同成就
      await nft.connect(minter).mintAchievement(otherAddr, 1, "ipfs://Qm.../achv1.json");
      
      expect(await nft.hasAchievement(userAddr, 1)).to.be.true;
      expect(await nft.hasAchievement(otherAddr, 1)).to.be.true;
      expect(await nft.balanceOf(userAddr)).to.equal(1);
      expect(await nft.balanceOf(otherAddr)).to.equal(1);
      console.log("[边缘] 多用户相同成就处理正确");
    });

    it("应该正确处理 tokenId 递增", async function () {
      const tx1 = await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      const receipt1 = await tx1.wait();
      const tokenId1 = await nft.tokenOfOwnerByIndex(userAddr, 0);
      
      const tx2 = await nft.connect(minter).mintAchievement(otherAddr, 2, "ipfs://Qm.../achv2.json");
      const receipt2 = await tx2.wait();
      const tokenId2 = await nft.tokenOfOwnerByIndex(otherAddr, 0);
      
      expect(tokenId1).to.equal(1);
      expect(tokenId2).to.equal(2);
      console.log("[边缘] tokenId 递增正确");
    });

    it("销毁后可以重新铸造相同成就", async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      const tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
      
      await nft.connect(burner).burn(tokenId);
      
      // 可以重新铸造相同成就
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1-new.json");
      expect(await nft.hasAchievement(userAddr, 1)).to.be.true;
      console.log("[边缘] 销毁后重新铸造正确");
    });
  });

  describe("ERC721 标准功能", function () {
    beforeEach(async function () {
      await nft.connect(minter).mintAchievement(userAddr, 1, "ipfs://Qm.../achv1.json");
      await nft.connect(minter).mintAchievement(userAddr, 2, "ipfs://Qm.../achv2.json");
    });

    it("应该正确返回 token 总数", async function () {
      expect(await nft.totalSupply()).to.equal(2);
      console.log("[ERC721] totalSupply 正确");
    });

    it("应该正确返回用户余额", async function () {
      expect(await nft.balanceOf(userAddr)).to.equal(2);
      expect(await nft.balanceOf(otherAddr)).to.equal(0);
      console.log("[ERC721] balanceOf 正确");
    });

    it("应该正确返回 token 所有者", async function () {
      const tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
      expect(await nft.ownerOf(tokenId)).to.equal(userAddr);
      console.log("[ERC721] ownerOf 正确");
    });

    it("应该正确枚举用户的 token", async function () {
      const tokenId1 = await nft.tokenOfOwnerByIndex(userAddr, 0);
      const tokenId2 = await nft.tokenOfOwnerByIndex(userAddr, 1);
      expect(tokenId1).to.equal(1);
      expect(tokenId2).to.equal(2);
      console.log("[ERC721] tokenOfOwnerByIndex 正确");
    });

    it("应该正确返回 token 在用户列表中的索引", async function () {
      expect(await nft.tokenOfOwnerByIndex(userAddr, 0)).to.equal(1);
      expect(await nft.tokenOfOwnerByIndex(userAddr, 1)).to.equal(2);
      console.log("[ERC721] tokenOfOwnerByIndex 索引正确");
    });

    it("应该正确处理 approve 和 getApproved", async function () {
      const tokenId = await nft.tokenOfOwnerByIndex(userAddr, 0);
      await nft.connect(user).approve(otherAddr, tokenId);
      expect(await nft.getApproved(tokenId)).to.equal(otherAddr);
      console.log("[ERC721] approve 和 getApproved 正确");
    });

    it("应该正确处理 setApprovalForAll 和 isApprovedForAll", async function () {
      await nft.connect(user).setApprovalForAll(otherAddr, true);
      expect(await nft.isApprovedForAll(userAddr, otherAddr)).to.be.true;
      
      await nft.connect(user).setApprovalForAll(otherAddr, false);
      expect(await nft.isApprovedForAll(userAddr, otherAddr)).to.be.false;
      console.log("[ERC721] setApprovalForAll 和 isApprovedForAll 正确");
    });
  });
}); 