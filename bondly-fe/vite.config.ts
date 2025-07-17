import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@utils": resolve(__dirname, "./src/utils"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@styles": resolve(__dirname, "./src/styles"),
      "@config": resolve(__dirname, "./src/config"),
    },
  },
  optimizeDeps: {
    // 强制预构建这些依赖
    include: [
      'react',
      'react-dom',
      'wagmi',
      'viem',
      '@rainbow-me/rainbowkit',
      '@tanstack/react-query',
      'react-router-dom'
    ],
    // 排除这些依赖的预构建（通常不需要）
    exclude: [],
    // 强制重新构建
    force: false
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@chakra-ui/react", "@emotion/react", "@emotion/styled"],
          blockchain: ["wagmi", "viem", "@rainbow-me/rainbowkit"],
        },
      },
    },
  },
  css: {
    devSourcemap: true,
  },
});
