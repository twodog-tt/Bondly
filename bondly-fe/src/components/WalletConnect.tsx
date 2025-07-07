import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function getShortAddress(address: string) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export default function WalletConnect({ onConnect }: { onConnect: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = (connector: any) => {
    connect({ connector });
    onConnect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div>
      {isConnected ? (
        <div style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>Wallet Connected: {address ? getShortAddress(address) : ''}</span>
          <button
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onClick={() => handleConnect(connector)}
              disabled={isPending}
            >
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
