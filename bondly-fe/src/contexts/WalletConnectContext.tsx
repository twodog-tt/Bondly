import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface WalletConnectContextType {
  openConnectModal: () => void;
  setOpenConnectModal: (openModal: () => void) => void;
}

const WalletConnectContext = createContext<WalletConnectContextType | undefined>(undefined);

export const useWalletConnect = () => {
  const context = useContext(WalletConnectContext);
  if (!context) {
    throw new Error('useWalletConnect must be used within a WalletConnectProvider');
  }
  return context;
};

interface WalletConnectProviderProps {
  children: ReactNode;
}

export const WalletConnectProvider: React.FC<WalletConnectProviderProps> = ({ children }) => {
  const [openConnectModal, setOpenConnectModal] = useState<(() => void) | null>(null);

  const value: WalletConnectContextType = {
    openConnectModal: () => {
      if (openConnectModal) {
        openConnectModal();
      }
    },
    setOpenConnectModal: (openModal: () => void) => {
      setOpenConnectModal(() => openModal);
    }
  };

  return (
    <WalletConnectContext.Provider value={value}>
      {children}
    </WalletConnectContext.Provider>
  );
}; 