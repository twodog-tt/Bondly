interface Config {
  apiUrl: string;
  wagmiProjectId: string;
  supportedChains: number[];
  isDevelopment: boolean;
  isProduction: boolean;
}

const config: Config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  wagmiProjectId: import.meta.env.VITE_WAGMI_PROJECT_ID || 'YOUR_PROJECT_ID',
  supportedChains: [1, 137, 10, 42161, 8453, 7777777], // mainnet, polygon, optimism, arbitrum, base, zora
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config; 