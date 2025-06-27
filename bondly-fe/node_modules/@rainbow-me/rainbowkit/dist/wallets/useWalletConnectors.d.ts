import { type Config } from 'wagmi';
import type { ConnectMutateAsync } from 'wagmi/query';
import type { WalletInstance } from './Wallet';
export interface WalletConnector extends WalletInstance {
    ready?: boolean;
    connect: () => ReturnType<ConnectMutateAsync<Config, unknown>>;
    showWalletConnectModal?: () => void;
    recent: boolean;
    mobileDownloadUrl?: string;
    extensionDownloadUrl?: string;
    desktopDownloadUrl?: string;
    getDesktopUri?: () => Promise<string>;
    getQrCodeUri?: () => Promise<string>;
    getMobileUri?: () => Promise<string>;
}
export declare function useWalletConnectors(mergeEIP6963WithRkConnectors?: boolean): WalletConnector[];
