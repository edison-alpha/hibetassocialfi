import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // ✅ Node.js polyfills for Web3 browser compatibility
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'util', 'crypto'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  // ✅ Define global variables for browser compatibility
  define: {
    'global': 'globalThis',
  },
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: ['buffer', 'process', 'react', 'react-dom'],
  },
  // ✅ Build configuration for production
  build: {
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // ⚡ Split into smaller chunks for better loading performance
          'react-core': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'web3-viem': ['viem'],
          'web3-wagmi': ['wagmi'],
          'web3-ethers': ['ethers'],
          'sequence-core': ['0xsequence'],
          'sequence-connect': ['@0xsequence/connect', '@0xsequence/hooks'],
          'apollo': ['@apollo/client'],
        },
      },
    },
  },
}));
