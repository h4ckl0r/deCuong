import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

// Tạo __dirname (vì trong ES Modules biến này không có sẵn)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cấu hình Proxy cho API Rikkei
app.use(
  "/api-rikkei",
  createProxyMiddleware({
    target: "https://apiportal.rikkei.edu.vn",
    changeOrigin: true,
    pathRewrite: { "^/api-rikkei": "" },
    onProxyReq: (proxyReq) => {
      // Fake headers để đánh lừa server Rikkei
      proxyReq.setHeader("Origin", "https://portal.rikkei.edu.vn");
      proxyReq.setHeader("Referer", "https://portal.rikkei.edu.vn/dangnhap");
    },
  })
);

// 2. Serve file tĩnh từ thư mục dist (sau khi build xong)
app.use(express.static(path.join(__dirname, "dist")));

// 3. Xử lý React Router (để khi F5 ở trang con không bị lỗi 404)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
