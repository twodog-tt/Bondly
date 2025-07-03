// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IBondlyTreasury
 * @dev Bondly Treasury 合约接口定义
 * @author Bondly Team
 */
interface IBondlyTreasury {
    
    /**
     * @dev 执行 DAO 批准的提案
     * @param proposalId 提案ID
     * @param target 目标地址
     * @param amount 金额
     * @param data 执行数据
     */
    function executeProposal(
        uint256 proposalId,
        address target,
        uint256 amount,
        bytes calldata data
    ) external;
    
    /**
     * @dev 执行参数变更提案（仅允许调用 Registry 中登记的合约和允许的 setter 函数）
     * @param proposalId 提案ID
     * @param target 目标合约地址
     * @param data 执行数据（包含函数选择器和参数）
     */
    function executeParameterChange(
        uint256 proposalId,
        address target,
        bytes calldata data
    ) external;
    
    /**
     * @dev 紧急提取资金（仅所有者）
     * @param recipient 接收地址
     * @param amount 金额
     * @param reason 原因
     */
    function emergencyWithdraw(
        address recipient,
        uint256 amount,
        string calldata reason
    ) external;
    
    /**
     * @dev 提取代币（仅所有者）
     * @param token 代币地址
     * @param recipient 接收地址
     * @param amount 金额
     */
    function withdrawToken(
        address token,
        address recipient,
        uint256 amount
    ) external;
    
    /**
     * @dev 获取资金状态
     */
    function getFundsStatus() external view returns (
        uint256 total,
        uint256 available,
        uint256 locked
    );
    
    /**
     * @dev 检查提案是否已执行
     * @param proposalId 提案ID
     */
    function isProposalExecuted(uint256 proposalId) external view returns (bool);
    
    /**
     * @dev 获取授权支出者列表
     * @param spender 支出者地址
     */
    function isAuthorizedSpender(address spender) external view returns (bool);
    
    /**
     * @dev 更新 DAO 合约地址
     * @param newDAOContract 新的 DAO 合约地址
     */
    function updateDAOContract(address newDAOContract) external;
    
    /**
     * @dev 设置授权支出者
     * @param spender 支出者地址
     * @param level 级别
     */
    function setAuthorizedSpender(address spender, uint8 level) external;
    
    /**
     * @dev 更新资金参数
     * @param _minProposalAmount 最小提案金额
     * @param _maxProposalAmount 最大提案金额
     */
    function updateFundsParameters(
        uint256 _minProposalAmount,
        uint256 _maxProposalAmount
    ) external;
    
    /**
     * @dev 设置允许的 setter 函数选择器
     * @param functionSelector 函数选择器
     * @param allowed 是否允许
     */
    function setAllowedSetter(bytes4 functionSelector, bool allowed) external;
    
    /**
     * @dev 批量设置允许的 setter 函数选择器
     * @param functionSelectors 函数选择器数组
     * @param allowed 是否允许
     */
    function setAllowedSetters(bytes4[] calldata functionSelectors, bool allowed) external;
    
    /**
     * @dev 检查函数选择器是否被允许
     * @param functionSelector 函数选择器
     * @return 是否允许
     */
    function isAllowedSetter(bytes4 functionSelector) external view returns (bool);
    
    /**
     * @dev 获取合约信息
     */
    function getContractInfo() external view returns (
        address daoAddress,
        uint256 totalFunds_,
        uint256 availableFunds_,
        uint256 minAmount,
        uint256 maxAmount
    );
} 