const express = require("express");
const path = require("path");
const config = require("./config");
const { setupMiddleware } = require("./middleware/setup");
const { errorHandler } = require("./middleware/errorHandler");
const { initRedis } = require("./config/redis");

const userRoutes = require("./routes/userRoutes");
const scaleRoutes = require("./routes/scaleRoutes");
const answerRoutes = require("./routes/answerRoutes");
const trendRoutes = require("./routes/trendRoutes");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();

setupMiddleware(app);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/scales", scaleRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/trends", trendRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/scales", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/scales.html"));
});

app.get("/answer/:scaleId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/answer.html"));
});

app.get("/result/:sessionUuid", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/result.html"));
});

app.get("/trend", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/trend.html"));
});

app.get("/resources", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/resources.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/privacy.html"));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: "接口不存在",
  });
});

app.use(errorHandler);

async function startServer() {
  await initRedis();

  const PORT = config.port;
  app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🚀 心理量表测评系统已启动`);
    console.log(`📡 服务地址: http://127.0.0.1:${PORT}`);
    console.log(`📊 API文档: http://127.0.0.1:${PORT}/api/health`);
    console.log(`========================================\n`);
  });
}

process.on("SIGTERM", () => {
  console.log("收到 SIGTERM 信号，正在关闭服务...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n收到 SIGINT 信号，正在关闭服务...");
  process.exit(0);
});

startServer();
