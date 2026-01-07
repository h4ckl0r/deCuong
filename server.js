import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  "/api-rikkei",
  createProxyMiddleware({
    target: "https://apiportal.rikkei.edu.vn",
    changeOrigin: true,
    secure: false, // <--- QUAN TRỌNG: Bỏ qua lỗi SSL nếu có
    pathRewrite: { "^/api-rikkei": "" },
    onProxyReq: (proxyReq, req, res) => {
      // Giả mạo Headers giống hệt trình duyệt Chrome
      proxyReq.setHeader("Origin", "https://portal.rikkei.edu.vn");
      proxyReq.setHeader("Referer", "https://portal.rikkei.edu.vn/");
      proxyReq.setHeader(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Xóa header Host để tránh bị Rikkei phát hiện là từ Render
      proxyReq.removeHeader("Host");
    },
    onError: (err, req, res) => {
      console.error("Lỗi Proxy:", err);
      res.status(500).send("Proxy Error");
    },
  })
);

app.use(express.static(path.join(__dirname, "dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
