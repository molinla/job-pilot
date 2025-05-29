#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

// 应用路径
const appPath = path.join(__dirname, "../dist/mac-arm64/one-step-to-job.app");

console.log("正在配置 macOS 权限...");

// 检查应用是否存在
if (!fs.existsSync(appPath)) {
	console.error(`错误: 找不到应用 ${appPath}`);
	process.exit(1);
}

try {
	// 添加屏幕录制权限
	console.log("添加屏幕录制权限...");
	execSync(
		`tccutil reset ScreenCapture $(codesign -dvv "${appPath}" 2>&1 | grep "Authority=Developer ID Application:" | awk -F'=' '{print $NF}' | tr -d '"')`,
		{ stdio: "inherit" },
	);

	console.log("权限配置完成!");
	console.log("注意: 首次运行应用时，macOS 可能仍会请求屏幕录制权限。");
	console.log("请在系统设置中允许应用访问屏幕录制功能。");
} catch (error) {
	console.error("配置权限时出错:", error.message);
	process.exit(1);
}
