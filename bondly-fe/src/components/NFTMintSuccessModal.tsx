import React from 'react';

interface NFTMintSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftData: {
    tokenId: string;
    title: string;
    creator: string;
    ipfsHash: string;
    mintedAt: string;
    transactionHash?: string;
  };
}

const NFTMintSuccessModal: React.FC<NFTMintSuccessModalProps> = ({
  isOpen,
  onClose,
  nftData
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* 成功图标 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            ✓
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0
          }}>
            NFT Minted Successfully!
          </h2>
        </div>

        {/* NFT 信息 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '4px'
            }}>
              Article Title
            </label>
            <div style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {nftData.title}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '4px'
            }}>
              Token ID
            </label>
            <div style={{
              color: nftData.tokenId === 'Loading...' ? '#f59e0b' : 
                     nftData.tokenId === 'timeout' ? '#ef4444' : '#3b82f6',
              fontSize: '16px',
              fontFamily: 'monospace',
              fontWeight: '600'
            }}>
              {nftData.tokenId === 'Loading...' ? '⏳ Loading...' : 
               nftData.tokenId === 'timeout' ? '⏰ Timeout' : `#${nftData.tokenId}`}
            </div>
            {nftData.tokenId === 'Loading...' && (
              <div style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                Transaction confirmed, Token ID syncing...
              </div>
            )}
            {nftData.tokenId === 'timeout' && (
              <div style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '4px'
              }}>
                Token ID fetch timeout. Please check your profile later.
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '4px'
            }}>
              Creator Address
            </label>
            <div style={{
              color: 'white',
              fontSize: '14px',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {nftData.creator}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '4px'
            }}>
              IPFS Hash
            </label>
            <div style={{
              color: '#10b981',
              fontSize: '14px',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {nftData.ipfsHash}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              color: '#9ca3af',
              fontSize: '14px',
              fontWeight: '500',
              display: 'block',
              marginBottom: '4px'
            }}>
              Minted At
            </label>
            <div style={{
              color: 'white',
              fontSize: '14px'
            }}>
              {new Date(nftData.mintedAt).toLocaleString('en-US')}
            </div>
          </div>

          {nftData.transactionHash && (
            <div>
              <label style={{
                color: '#9ca3af',
                fontSize: '14px',
                fontWeight: '500',
                display: 'block',
                marginBottom: '4px'
              }}>
                Transaction Hash
              </label>
              <div style={{
                color: '#f59e0b',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {nftData.transactionHash}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Confirm
          </button>
        </div>

        {/* 提示信息 */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          color: '#9ca3af',
          fontSize: '12px'
        }}>
          NFT has been successfully minted to the blockchain, you can view it in your wallet
        </div>
      </div>
    </div>
  );
};

export default NFTMintSuccessModal; 