import { useCallback, useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACTS } from '../config/contracts';

export interface AdminPermissions {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  checkPermissions: () => Promise<void>;
}

export const useAdminPermissions = (): AdminPermissions => {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查ETH Staking合约中的管理员角色
  const { data: adminRole, isLoading: isRoleLoading } = useReadContract({
    address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
    abi: CONTRACTS.ETH_STAKING.abi,
    functionName: 'DEFAULT_ADMIN_ROLE',
    query: {
      enabled: !!CONTRACTS.ETH_STAKING?.address,
    },
  });

  // 检查当前用户是否具有管理员角色
  const { data: hasRole, isLoading: isHasRoleLoading } = useReadContract({
    address: CONTRACTS.ETH_STAKING?.address as `0x${string}`,
    abi: CONTRACTS.ETH_STAKING.abi,
    functionName: 'hasRole',
    args: [adminRole as `0x${string}`, address as `0x${string}`],
    query: {
      enabled: !!adminRole && !!address && !!CONTRACTS.ETH_STAKING?.address,
    },
  });

  // 检查权限
  const checkPermissions = useCallback(async () => {
    if (!isConnected || !address) {
      setIsAdmin(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 权限检查逻辑已经在useReadContract中处理
      // 这里主要是为了提供手动刷新功能
      setIsAdmin(hasRole === true);
    } catch (err) {
      console.error('Failed to check admin permissions:', err);
      setError(err instanceof Error ? err.message : 'Failed to check permissions');
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, hasRole]);

  // 自动检查权限
  useEffect(() => {
    if (isConnected && address && !isRoleLoading && !isHasRoleLoading) {
      setIsAdmin(hasRole === true);
    } else if (!isConnected) {
      setIsAdmin(false);
    }
  }, [isConnected, address, hasRole, isRoleLoading, isHasRoleLoading]);

  return {
    isAdmin,
    isLoading: isLoading || isRoleLoading || isHasRoleLoading,
    error,
    checkPermissions,
  };
}; 