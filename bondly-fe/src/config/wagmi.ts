import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Bondly",
  projectId: "e8b3e7a8f3a542c8b6d4e2a1c9f7b5d3", // 临时测试 PROJECT_ID
  chains: [sepolia],
  ssr: false, // 设置为 false 以避免 SSR 问题
});
