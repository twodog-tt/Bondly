import type { DefaultWalletOptions, Wallet } from '../../Wallet';
export type MetaMaskWalletOptions = DefaultWalletOptions;
export declare const metaMaskWallet: ({ projectId, walletConnectParameters, }: MetaMaskWalletOptions) => Wallet;
