import React from 'react';

interface WalletBindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

const WalletBindingModal: React.FC<WalletBindingModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#151728] border border-gray-700 rounded-xl p-4 max-w-xs w-full mx-2">
        <div className="text-center">
          {/* 成功图标 */}
          <div className="mx-auto w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mb-3">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* 标题 */}
          <h3 className="text-sm font-bold text-white mb-2">
            钱包绑定成功
          </h3>
          {/* 钱包地址 */}
          <div className="bg-[#0b0c1a] border border-gray-600 rounded-lg p-2 mb-3">
            <p className="text-gray-400 text-xs mb-1">钱包地址</p>
            <p className="text-white text-xs font-mono break-all">
              {walletAddress}
            </p>
          </div>
          {/* 提示信息 */}
          <p className="text-gray-400 text-xs mb-4">
            您的钱包已成功绑定到账户。
          </p>
          {/* 按钮 */}
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletBindingModal; 