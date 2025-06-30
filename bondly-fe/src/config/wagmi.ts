import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, polygon, optimism, arbitrum, base, zora } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Bondly",
  projectId: "YOUR_PROJECT_ID", // 可以从 WalletConnect Cloud 获取
  chains: [mainnet, polygon, optimism, arbitrum, base, zora],
  ssr: true,
});
