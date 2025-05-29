#!/usr/bin/env node

const { execSync } = require("node:child_process");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

console.log("正在检查和修复 macOS 屏幕录制权限问题...");

// 检查操作系统
if (process.platform !== "darwin") {
	console.log("这个脚本只适用于 macOS 系统");
	process.exit(0);
}

// 确定应用程序路径
const getAppPaths = () => {
	const paths = [];

	// 检查开发环境中的 Electron
	try {
		const electronPath = require("electron");
		paths.push(electronPath);
		console.log(`找到开发环境 Electron 路径: ${electronPath}`);
	} catch (err) {
		console.log("未找到开发环境中的 Electron");
	}

	// 检查构建的应用程序
	const distPaths = [
		path.join(process.cwd(), "dist/mac-arm64/one-step-to-job.app"),
		path.join(process.cwd(), "dist/mac/one-step-to-job.app"),
	];

	for (const distPath of distPaths) {
		if (fs.existsSync(distPath)) {
			paths.push(distPath);
			console.log(`找到构建的应用程序: ${distPath}`);
		}
	}

	return paths;
};

const appPaths = getAppPaths();

if (appPaths.length === 0) {
	console.log("未找到任何 Electron 应用程序路径");
	console.log("请确保已安装 Electron 或已构建应用程序");
	process.exit(1);
}

// 检查和修复权限
const fixPermissions = async () => {
	console.log("\n===== 权限检查和修复 =====");

	// 1. 检查 TCC 数据库中的权限
	console.log("检查 TCC 数据库中的屏幕录制权限...");
	try {
		const tccDbOutput = execSync(
			"sqlite3 ~/Library/Application\\ Support/com.apple.TCC/TCC.db \"SELECT * FROM access WHERE service='kTCCServiceScreenCapture'\"",
			{ encoding: "utf8" },
		);
		console.log("TCC 数据库中的屏幕录制权限:");
		console.log(tccDbOutput || "未找到任何屏幕录制权限记录");
	} catch (err) {
		console.log("无法读取 TCC 数据库，可能需要管理员权限");
	}

	// 2. 尝试重置权限
	console.log("\n是否要尝试重置屏幕录制权限? (y/n)");
	process.stdout.write("> ");
	process.stdin.once("data", (data) => {
		const input = data.toString().trim().toLowerCase();
		if (input === "y" || input === "yes") {
			try {
				console.log("尝试重置屏幕录制权限...");
				execSync("tccutil reset ScreenCapture", { stdio: "inherit" });
				console.log("权限已重置");
			} catch (error) {
				console.error("重置权限失败，可能需要管理员权限:", error.message);
				console.log("请尝试运行: sudo tccutil reset ScreenCapture");
			}
		}

		// 3. 打开系统偏好设置
		console.log("\n正在打开系统偏好设置的屏幕录制部分...");
		execSync(
			"open x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
		);

		console.log("\n请在系统偏好设置中执行以下操作:");
		console.log("1. 确保以下应用程序已添加并启用:");
		for (const appPath of appPaths) {
			console.log(`   - ${appPath}`);
		}
		console.log("2. 添加终端应用程序 (Terminal)");
		console.log("3. 添加您的浏览器 (Chrome, Safari 等)");
		console.log("4. 重启应用程序");

		process.exit(0);
	});
};

fixPermissions();
