import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useTranslation } from 'react-i18next';

interface WalletConnectProps {
  isMobile: boolean;
  onConnect?: () => void;
}

export default function WalletConnect({ isMobile, onConnect }: WalletConnectProps) {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const buttonStyle = {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'center'
  };

  const mobileButtonStyle = {
    ...buttonStyle,
    padding: '14px 28px',
    fontSize: '16px'
  };

  const connectedButtonStyle = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)'
  };

  const mobileConnectedButtonStyle = {
    ...mobileButtonStyle,
    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
    boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)'
  };

  const walletIconStyle = {
    fontSize: '20px'
  };

  // 按钮涟漪效果
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const handleConnect = (connector: any) => {
    connect({ connector });
    if (onConnect) {
      onConnect();
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const getWalletIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask':
        return '🦊';
      case 'walletconnect':
        return '🔗';
      case 'coinbase wallet':
        return '🪙';
      case 'rainbow':
        return '🌈';
      default:
        return '💳';
    }
  };

  const getShortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <button
        style={isMobile ? mobileConnectedButtonStyle : connectedButtonStyle}
        onClick={(e) => {
          createRipple(e);
          handleDisconnect();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
        }}
      >
        <span style={walletIconStyle}>✅</span>
        {t('wallet_connected')}: {address ? getShortAddress(address) : ''}
      </button>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        style={isMobile ? mobileButtonStyle : buttonStyle}
        onClick={(e) => {
          createRipple(e);
          // 默认连接 MetaMask
          const metamaskConnector = connectors.find(c => c.name === 'MetaMask');
          if (metamaskConnector) {
            handleConnect(metamaskConnector);
          }
        }}
        disabled={isPending}
        onMouseEnter={(e) => {
          if (!isPending) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isPending) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }
        }}
      >
        <span style={walletIconStyle}>
          {isPending ? '⏳' : '🔗'}
        </span>
        {isPending 
          ? t('connecting_wallet')
          : t('connect_wallet')
        }
      </button>
      
      {/* 钱包选择下拉菜单 */}
      {!isPending && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
              onClick={(e) => {
                createRipple(e);
                handleConnect(connector);
              }}
              disabled={!connector.ready}
              onMouseEnter={(e) => {
                if (connector.ready) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }
              }}
              onMouseLeave={(e) => {
                if (connector.ready) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>
                {getWalletIcon(connector.name)}
              </span>
              {connector.name}
              {!connector.ready && ' (未安装)'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 