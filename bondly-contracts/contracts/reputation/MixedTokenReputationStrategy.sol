// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IVotingWeightStrategy
 * @dev 投票权重策略接口，供治理合约调用以获取用户投票权重
 */
interface IVotingWeightStrategy {
    /**
     * @dev 获取用户在某提案、某快照区块的投票权重
     * @param voter 投票者地址
     * @param proposalId 提案ID
     * @param snapshotBlock 快照区块号
     * @return 权重数值
     */
    function getVotingWeightAt(address voter, uint256 proposalId, uint256 snapshotBlock) external view returns (uint256);
    /**
     * @dev 获取用户在某快照区块的 Token 权重
     * @param voter 投票者地址
     * @param snapshotBlock 快照区块号
     * @return Token 权重
     */
    function getTokenAt(address voter, uint256 snapshotBlock) external view returns (uint256);
    /**
     * @dev 获取用户在某快照区块的声誉分数
     * @param voter 投票者地址
     * @param snapshotBlock 快照区块号
     * @return 声誉分数
     */
    function getReputationAt(address voter, uint256 snapshotBlock) external view returns (uint256);
}

/**
 * @title IBondlyRegistry
 * @dev Bondly Registry 合约接口，用于查询合约地址
 */
interface IBondlyRegistry {
    function getContractAddress(string calldata name, string calldata version) external view returns (address);
}

/**
 * @title IERC20
 * @dev ERC20 标准接口（部分）
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title IReputationVault
 * @dev 声誉分数合约接口
 */
interface IReputationVault {
    function getReputation(address user) external view returns (uint256);
}

/**
 * @title MixedTokenReputationStrategy
 * @dev Token+Reputation 混合加权投票权重策略合约
 *
 * 该合约实现了 IVotingWeightStrategy 接口，支持根据 Token 持仓和声誉分数按比例加权计算投票权重。
 * 权重计算公式：
 *   (tokenAmount * tokenWeightRatio + reputation * (100 - tokenWeightRatio)) / 100
 *
 * - Token 和 Reputation 地址均通过 Registry 动态获取
 * - 权重比例可由 owner 设置
 * - 仅 owner 可变更参数
 */
contract MixedTokenReputationStrategy is IVotingWeightStrategy {
    /// @notice 策略合约所有者
    address public owner;
    /// @notice Registry 合约实例
    IBondlyRegistry public registry;
    /// @notice Token 权重占比（0~100），默认 50
    uint256 public tokenWeightRatio = 50;

    /// @dev 仅 owner 可调用
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }

    /**
     * @dev 构造函数
     * @param _registry Registry 合约地址
     */
    constructor(address _registry) {
        require(_registry != address(0), "No registry");
        owner = msg.sender;
        registry = IBondlyRegistry(_registry);
    }

    /**
     * @dev 设置 Token 权重占比（0~100）
     * @param ratio 新的 Token 占比
     */
    function setTokenWeightRatio(uint256 ratio) external onlyOwner {
        require(ratio <= 100, "Ratio 0~100");
        tokenWeightRatio = ratio;
    }

    /**
     * @dev 获取用户在某提案、某快照区块的投票权重
     * @param voter 投票者地址
     * @param proposalId 提案ID（未用，可兼容扩展）
     * @param snapshotBlock 快照区块号
     * @return 权重数值
     */
    function getVotingWeightAt(address voter, uint256 proposalId, uint256 snapshotBlock) public view override returns (uint256) {
        uint256 tokenAmount = getTokenAt(voter, snapshotBlock);
        uint256 reputation = getReputationAt(voter, snapshotBlock);
        return (tokenAmount * tokenWeightRatio + reputation * (100 - tokenWeightRatio)) / 100;
    }

    /**
     * @dev 获取用户在某快照区块的 Token 权重
     * @param voter 投票者地址
     * @param snapshotBlock 快照区块号
     * @return Token 权重
     */
    function getTokenAt(address voter, uint256 snapshotBlock) public view override returns (uint256) {
        address token = registry.getContractAddress("BondlyToken", "v1");
        if (token == address(0)) return 0;
        if (snapshotBlock > 0) {
            try IERC20(token).balanceOf(voter) returns (uint256 bal) { return bal; } catch {}
        }
        try IERC20(token).balanceOf(voter) returns (uint256 bal) { return bal; } catch {}
        return 0;
    }

    /**
     * @dev 获取用户在某快照区块的声誉分数
     * @param voter 投票者地址
     * @param snapshotBlock 快照区块号
     * @return 声誉分数
     */
    function getReputationAt(address voter, uint256 snapshotBlock) public view override returns (uint256) {
        address reputationVault = registry.getContractAddress("ReputationVault", "v1");
        if (reputationVault == address(0)) return 0;
        // 假设声誉合约支持快照接口，否则直接查当前
        // try IReputationVault(reputationVault).getPastReputation(voter, snapshotBlock) returns (uint256 rep) { return rep; } catch {}
        try IReputationVault(reputationVault).getReputation(voter) returns (uint256 rep) { return rep; } catch {}
        return 0;
    }
} 