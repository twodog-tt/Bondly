"use client";
import {
  getInjectedConnector,
  hasInjectedProvider
} from "./chunk-WXICAEA2.js";

// src/wallets/walletConnectors/xdefiWallet/xdefiWallet.ts
var xdefiWallet = () => {
  return {
    id: "xdefi",
    name: "XDEFI Wallet",
    rdns: "io.xdefi",
    installed: hasInjectedProvider({ namespace: "xfi.ethereum" }),
    iconUrl: async () => (await import("./xdefiWallet-ORZSAYJI.js")).default,
    iconBackground: "#fff",
    downloadUrls: {
      chrome: "https://chrome.google.com/webstore/detail/xdefi-wallet/hmeobnfnfcmdkdcmlblgagmfpfboieaf",
      browserExtension: "https://xdefi.io"
    },
    extension: {
      instructions: {
        learnMoreUrl: "https://xdefi.io/support-categories/xdefi-wallet/",
        steps: [
          {
            description: "wallet_connectors.xdefi.extension.step1.description",
            step: "install",
            title: "wallet_connectors.xdefi.extension.step1.title"
          },
          {
            description: "wallet_connectors.xdefi.extension.step2.description",
            step: "create",
            title: "wallet_connectors.xdefi.extension.step2.title"
          },
          {
            description: "wallet_connectors.xdefi.extension.step3.description",
            step: "refresh",
            title: "wallet_connectors.xdefi.extension.step3.title"
          }
        ]
      }
    },
    createConnector: getInjectedConnector({ namespace: "xfi.ethereum" })
  };
};

export {
  xdefiWallet
};
