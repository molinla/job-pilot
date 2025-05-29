#!/usr/bin/env node

const { execSync } = require("node:child_process");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

console.log("正在配置 macOS 开发环境屏幕录制权限...");

// 检查操作系统
if (process.platform !== "darwin") {
	console.log("这个脚本只适用于 macOS 系统");
	process.exit(0);
}

try {
	// 获取 Electron 可执行文件路径
	const electronPath = require("electron");

	console.log(`找到 Electron 路径: ${electronPath}`);
	console.log("请按照以下步骤操作:");
	console.log(
		"1. 在系统偏好设置 > 安全性与隐私 > 隐私 > 屏幕录制 中添加以下应用:",
	);
	console.log(`   - ${electronPath}`);
	console.log("   - Terminal (终端)");
	console.log("   - 您的浏览器 (如 Chrome, Safari 等)");
	console.log("2. 重启终端和开发服务器");

	// 尝试打开系统偏好设置
	console.log("正在尝试打开系统偏好设置...");
	execSync(
		"open x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
	);

	console.log("\n提示: 在开发模式下，您需要授权给 Electron 和终端应用程序。");
	console.log("授权完成后，重新运行 pnpm run dev:debug 命令。");

	// 可选: 尝试重置屏幕录制权限
	const resetPermissions = process.argv.includes("--reset");
	if (resetPermissions) {
		console.log("\n尝试重置屏幕录制权限 (可能需要管理员权限)...");
		try {
			execSync("tccutil reset ScreenCapture", { stdio: "inherit" });
			console.log("权限已重置");
		} catch (error) {
			console.error("重置权限失败，可能需要管理员权限:", error.message);
		}
	}
} catch (error) {
	console.error("配置权限时出错:", error.message);
	process.exit(1);
}
