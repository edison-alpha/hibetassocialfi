// vite.config.ts
import { defineConfig } from "file:///D:/BOUNTY%20EARN/hibeats/node_modules/vite/dist/node/index.js";
import react from "file:///D:/BOUNTY%20EARN/hibeats/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { nodePolyfills } from "file:///D:/BOUNTY%20EARN/hibeats/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "D:\\BOUNTY EARN\\hibeats";
var vite_config_default = defineConfig(() => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    // ✅ Node.js polyfills for Web3 browser compatibility
    nodePolyfills({
      include: ["buffer", "process", "stream", "util", "crypto"],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: ["react", "react-dom"]
  },
  // ✅ Define global variables for browser compatibility
  define: {
    "global": "globalThis"
  },
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: ["buffer", "process", "react", "react-dom"]
  },
  // ✅ Build configuration for production
  build: {
    target: "es2020",
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // ⚡ Split into smaller chunks for better loading performance
          "react-core": ["react", "react-dom"],
          "react-router": ["react-router-dom"],
          "web3-viem": ["viem"],
          "web3-wagmi": ["wagmi"],
          "web3-ethers": ["ethers"],
          "sequence-core": ["0xsequence"],
          "sequence-connect": ["@0xsequence/connect", "@0xsequence/hooks"],
          "apollo": ["@apollo/client"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxCT1VOVFkgRUFSTlxcXFxoaWJlYXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxCT1VOVFkgRUFSTlxcXFxoaWJlYXRzXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9CT1VOVFklMjBFQVJOL2hpYmVhdHMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBub2RlUG9seWZpbGxzIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHMnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIC8vIFx1MjcwNSBOb2RlLmpzIHBvbHlmaWxscyBmb3IgV2ViMyBicm93c2VyIGNvbXBhdGliaWxpdHlcclxuICAgIG5vZGVQb2x5ZmlsbHMoe1xyXG4gICAgICBpbmNsdWRlOiBbJ2J1ZmZlcicsICdwcm9jZXNzJywgJ3N0cmVhbScsICd1dGlsJywgJ2NyeXB0byddLFxyXG4gICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgQnVmZmVyOiB0cnVlLFxyXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcclxuICAgICAgICBwcm9jZXNzOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgICBkZWR1cGU6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgfSxcclxuICAvLyBcdTI3MDUgRGVmaW5lIGdsb2JhbCB2YXJpYWJsZXMgZm9yIGJyb3dzZXIgY29tcGF0aWJpbGl0eVxyXG4gIGRlZmluZToge1xyXG4gICAgJ2dsb2JhbCc6ICdnbG9iYWxUaGlzJyxcclxuICB9LFxyXG4gIC8vIFx1MjcwNSBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFsnYnVmZmVyJywgJ3Byb2Nlc3MnLCAncmVhY3QnLCAncmVhY3QtZG9tJ10sXHJcbiAgfSxcclxuICAvLyBcdTI3MDUgQnVpbGQgY29uZmlndXJhdGlvbiBmb3IgcHJvZHVjdGlvblxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxyXG4gICAgY29tbW9uanNPcHRpb25zOiB7XHJcbiAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBcdTI2QTEgU3BsaXQgaW50byBzbWFsbGVyIGNodW5rcyBmb3IgYmV0dGVyIGxvYWRpbmcgcGVyZm9ybWFuY2VcclxuICAgICAgICAgICdyZWFjdC1jb3JlJzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICAgICAgICAgICdyZWFjdC1yb3V0ZXInOiBbJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICd3ZWIzLXZpZW0nOiBbJ3ZpZW0nXSxcclxuICAgICAgICAgICd3ZWIzLXdhZ21pJzogWyd3YWdtaSddLFxyXG4gICAgICAgICAgJ3dlYjMtZXRoZXJzJzogWydldGhlcnMnXSxcclxuICAgICAgICAgICdzZXF1ZW5jZS1jb3JlJzogWycweHNlcXVlbmNlJ10sXHJcbiAgICAgICAgICAnc2VxdWVuY2UtY29ubmVjdCc6IFsnQDB4c2VxdWVuY2UvY29ubmVjdCcsICdAMHhzZXF1ZW5jZS9ob29rcyddLFxyXG4gICAgICAgICAgJ2Fwb2xsbyc6IFsnQGFwb2xsby9jbGllbnQnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFAsU0FBUyxvQkFBb0I7QUFDelIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQUg5QixJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsT0FBTztBQUFBLEVBQ2pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxJQUVOLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxVQUFVLFdBQVcsVUFBVSxRQUFRLFFBQVE7QUFBQSxNQUN6RCxTQUFTO0FBQUEsUUFDUCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixTQUFTO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLElBQ0EsUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLEVBQy9CO0FBQUE7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLFVBQVU7QUFBQSxFQUNaO0FBQUE7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxVQUFVLFdBQVcsU0FBUyxXQUFXO0FBQUEsRUFDckQ7QUFBQTtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsaUJBQWlCO0FBQUEsTUFDZix5QkFBeUI7QUFBQSxJQUMzQjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixjQUFjLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDbkMsZ0JBQWdCLENBQUMsa0JBQWtCO0FBQUEsVUFDbkMsYUFBYSxDQUFDLE1BQU07QUFBQSxVQUNwQixjQUFjLENBQUMsT0FBTztBQUFBLFVBQ3RCLGVBQWUsQ0FBQyxRQUFRO0FBQUEsVUFDeEIsaUJBQWlCLENBQUMsWUFBWTtBQUFBLFVBQzlCLG9CQUFvQixDQUFDLHVCQUF1QixtQkFBbUI7QUFBQSxVQUMvRCxVQUFVLENBQUMsZ0JBQWdCO0FBQUEsUUFDN0I7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
