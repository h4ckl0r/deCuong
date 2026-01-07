import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    host: "0.0.0.0", // cho phép truy cập từ máy khác
    port: 5173, // cổng của frontend (vite)
    proxy: {
      // === Proxy cho API Rikkei (để lấy token) ===
      "/api-rikkei": {
        // <-- Đã đổi tên để tránh trùng lặp
        target: "https://apiportal.rikkei.edu.vn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-rikkei/, ""), // Xóa '/api-rikkei'
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Thêm các header đặc biệt mà API Rikkei yêu cầu
            proxyReq.setHeader("Origin", "https://portal.rikkei.edu.vn");
            proxyReq.setHeader(
              "Referer",
              "https://portal.rikkei.edu.vn/dangnhap"
            );
          });
        },
      },

      "/api": {
        // target: 'http://192.168.2.51:3001', // server Node.js logic
        target: "http://172.26.112.1:3001", // server Node.js logic
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/chatAll": {
        // target: "http://192.168.2.51:3000", // ✅ Đúng IP thật
        target: "http://172.26.112.1:3000", // ✅ Đúng IP thật

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chatAll/, "/chatAll"),
      },
    },
  },
});
