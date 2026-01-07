// server.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");
const app = express();

// 1. Cấu hình Proxy cho API Rikkei (giống hệt vite.config.ts của bạn)
app.use(
  "/api-rikkei",
  createProxyMiddleware({
    target: "https://apiportal.rikkei.edu.vn",
    changeOrigin: true,
    pathRewrite: { "^/api-rikkei": "" }, // Xóa /api-rikkei đi
    onProxyReq: (proxyReq) => {
      // Fake headers để đánh lừa server Rikkei
      proxyReq.setHeader("Origin", "https://portal.rikkei.edu.vn");
      proxyReq.setHeader("Referer", "https://portal.rikkei.edu.vn/dangnhap");
    },
  })
);

// 2. Cấu hình Proxy cho API Backend của bạn (NodeJS/Java)
// Nếu bạn không dùng cái này thì có thể bỏ qua
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.BACKEND_URL || "http://172.26.112.1:3001",
    changeOrigin: true,
    pathRewrite: { "^/api": "" },
  })
);

// 3. Serve file tĩnh (Frontend sau khi build)
app.use(express.static(path.join(__dirname, "dist")));

// 4. Xử lý React Router (F5 không bị lỗi 404)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
