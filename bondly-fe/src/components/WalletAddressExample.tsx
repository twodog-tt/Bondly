import React, { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';

const WalletAddressExample: React.FC = () => {
  const { address, isConnected, connector, chain } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  
  const [walletInfo, setWalletInfo] = useState({
    address: '',
    balance: '',
    network: '',
    connector: ''
  });

  // 当钱包连接状态或地址变化时更新信息
  useEffect(() => {
    if (isConnected && address) {
      setWalletInfo({
        address: address,
        balance: balance ? `${balance.formatted} ${balance.symbol}` : 'Loading...',
        network: chain ? chain.name : 'Unknown',
        connector: connector ? connector.name : 'Unknown'
      });
    } else {
      setWalletInfo({
        address: '',
        balance: '',
        network: '',
        connector: ''
      });
    }
  }, [isConnected, address, balance, chain, connector]);

  // 格式化地址显示
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 复制地址到剪贴板
  const copyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        alert('Address copied to clipboard!');
      } catch (err) {
        console.error('Copy failed:', err);
      }
    }
  };

  if (!isConnected) {
    return (
      <div style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white'
      }}>
        <h3>Wallet Not Connected</h3>
        <p>Please connect your wallet to view address information</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white'
    }}>
      <h3>Wallet Information</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Address:</strong> 
        <span style={{ 
          fontFamily: 'monospace', 
          marginLeft: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {formatAddress(walletInfo.address)}
        </span>
        <button 
          onClick={copyAddress}
          style={{
            marginLeft: '10px',
            background: 'rgba(102, 126, 234, 0.8)',
            border: 'none',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Copy
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Balance:</strong> 
        <span style={{ marginLeft: '10px' }}>
          {walletInfo.balance}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Network:</strong> 
        <span style={{ marginLeft: '10px' }}>
          {walletInfo.network}
        </span>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Connector:</strong> 
        <span style={{ marginLeft: '10px' }}>
          {walletInfo.connector}
        </span>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        background: 'rgba(102, 126, 234, 0.1)',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Full Address:</strong>
        <div style={{ 
          fontFamily: 'monospace', 
          fontSize: '12px',
          wordBreak: 'break-all',
          marginTop: '5px'
        }}>
          {walletInfo.address}
        </div>
      </div>
    </div>
  );
};

export default WalletAddressExample; 