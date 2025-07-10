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
      <div className="bg-[#151728] border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* 成功图标 */}
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* 标题 */}
          <h3 className="text-xl font-bold text-white mb-4">
            钱包绑定成功
          </h3>
          
          {/* 钱包地址 */}
          <div className="bg-[#0b0c1a] border border-gray-600 rounded-lg p-3 mb-4">
            <p className="text-gray-400 text-sm mb-1">钱包地址</p>
            <p className="text-white text-sm font-mono break-all">
              {walletAddress}
            </p>
          </div>
          
          {/* 提示信息 */}
          <p className="text-gray-400 text-sm mb-6">
            您的钱包已成功绑定到账户。您可以随时在个人设置中解绑钱包。
          </p>
          
          {/* 按钮 */}
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletBindingModal; 