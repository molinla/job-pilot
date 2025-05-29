import {
	app,
	shell,
	BrowserWindow,
	ipcMain,
	desktopCapturer,
	systemPreferences,
	protocol,
} from "electron";
import { join } from "node:path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import fs from "node:fs";
// @ts-ignore
import icon from "../../resources/icon.png?asset";

// 检查并请求macOS屏幕录制权限
function checkAndRequestScreenCapturePermission(): void {
	if (process.platform === "darwin") {
		console.log("[主进程] 检查macOS屏幕录制权限");

		try {
			// 检查屏幕录制权限
			const hasScreenCapturePermission =
				systemPreferences.getMediaAccessStatus("screen");
			console.log(
				`[主进程] 当前屏幕录制权限状态: ${hasScreenCapturePermission}`,
			);

			// 如果权限未授予，显示提示对话框
			if (hasScreenCapturePermission !== "granted") {
				const { dialog } = require("electron");

				dialog
					.showMessageBox({
						type: "info",
						buttons: ["确定", "打开系统设置"],
						title: "需要屏幕录制权限",
						message: "此应用需要屏幕录制权限才能正常工作",
						detail:
							"请按照以下步骤操作:\n\n" +
							"1. 点击「打开系统设置」\n" +
							"2. 在隐私与安全性 > 屏幕录制中，找到并勾选本应用\n" +
							"3. 完全退出应用后重新启动\n\n" +
							"注意：仅添加权限但不重启应用可能无法解决问题",
					})
					.then(({ response }) => {
						// 如果用户点击"打开系统设置"
						if (response === 1) {
							// 打开系统偏好设置的屏幕录制部分
							shell.openExternal(
								"x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture",
							);
						}
					});
			}

			// 请求摄像头和麦克风权限
			systemPreferences.askForMediaAccess("camera").then((cameraGranted) => {
				console.log(
					`[主进程] 摄像头权限${cameraGranted ? "已授予" : "被拒绝"}`,
				);

				systemPreferences.askForMediaAccess("microphone").then((micGranted) => {
					console.log(`[主进程] 麦克风权限${micGranted ? "已授予" : "被拒绝"}`);
				});
			});
		} catch (error) {
			console.error("[主进程] 处理媒体权限时出错:", error);
		}
	}
}

function createWindow(): void {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 760,
		show: false,
		autoHideMenuBar: true,
		resizable: true,
		// 根据平台设置不同的标题栏样式
		...(process.platform === "darwin"
			? {
					titleBarStyle: "hiddenInset", // macOS 使用 hiddenInset 样式，为信号灯留出空间
					trafficLightPosition: {
						x: 11,
						y: 11,
					},
				}
			: {
					titleBarStyle: "hidden", // Windows/Linux 使用 hidden 样式
					frame: false,
				}),

		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
			// 为了屏幕共享，需要启用这些权限
			nodeIntegration: true,
			contextIsolation: true,
			webSecurity: false, // 允许跨域请求，测试环境使用
		},
	});

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
	});

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});

	// 设置屏幕共享IPC处理程序
	setupScreenShareHandlers(mainWindow);

	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

// 设置屏幕共享相关的IPC处理程序
function setupScreenShareHandlers(mainWindow: BrowserWindow): void {
	// 获取可用的屏幕共享源
	ipcMain.handle("get-screen-sources", async () => {
		try {
			console.log("[主进程] 获取屏幕源");
			const sources = await desktopCapturer.getSources({
				types: ["window", "screen"],
				thumbnailSize: { width: 320, height: 180 },
				fetchWindowIcons: true,
			});
			console.log(`[主进程] 获取到 ${sources.length} 个屏幕源`);

			// 提供更详细的调试信息
			const screens = sources.filter((s) => s.id.startsWith("screen:"));
			const windows = sources.filter((s) => s.id.startsWith("window:"));

			console.log(
				`[主进程] 屏幕数量: ${screens.length}, 窗口数量: ${windows.length}`,
			);

			sources.forEach((source, index) => {
				const type = source.id.startsWith("screen:") ? "屏幕" : "窗口";
				console.log(
					`[主进程] 源 ${index + 1}: 类型=${type}, ID=${source.id}, 名称=${source.name}`,
				);
			});

			return sources;
		} catch (error) {
			console.error("[主进程] 获取屏幕源出错:", error);
			return [];
		}
	});

	// 获取资源文件路径
	ipcMain.handle("get-resource-path", (event, filename) => {
		console.log("[主进程] 获取资源文件路径:", filename);
		const resourcePath = join(app.getAppPath(), "resources", filename);
		console.log("[主进程] 资源文件完整路径:", resourcePath);
		return resourcePath;
	});

	// 选择屏幕共享源
	ipcMain.on("select-screen-source", (event, sourceId) => {
		console.log("[主进程] 收到select-screen-source事件，源ID:", sourceId);
		if (!sourceId) {
			console.error("[主进程] 无效的sourceId");
			return;
		}

		// 发送source-selected事件
		try {
			mainWindow.webContents.send("source-selected", sourceId);
			console.log("[主进程] 已发送source-selected事件，sourceId:", sourceId);
		} catch (error) {
			console.error("[主进程] 发送source-selected事件失败:", error);
		}
	});

	// 监听source-selected事件（从VideoRecorder组件发送）
	ipcMain.on("source-selected", (event, sourceId) => {
		console.log("[主进程] 收到source-selected事件，源ID:", sourceId);
		if (sourceId) {
			// 转发source-selected事件
			try {
				mainWindow.webContents.send("source-selected", sourceId);
				console.log("[主进程] 已转发source-selected事件，sourceId:", sourceId);
			} catch (error) {
				console.error("[主进程] 转发source-selected事件失败:", error);
			}
		} else {
			console.error("[主进程] 收到无效的sourceId");
		}
	});

	// 获取屏幕流
	ipcMain.on("get-source-stream", (event, sourceId) => {
		console.log("[主进程] 收到get-source-stream事件，源ID:", sourceId);
		if (sourceId) {
			// 通知渲染进程屏幕流已准备就绪
			// 实际的流创建发生在渲染进程，因为Electron安全限制
			try {
				mainWindow.webContents.send("source-stream-ready", { sourceId });
				console.log(
					"[主进程] 已发送source-stream-ready事件, sourceId:",
					sourceId,
				);
			} catch (error) {
				console.error("[主进程] 发送source-stream-ready事件失败:", error);
			}
		} else {
			console.error("[主进程] 收到无效的sourceId");
		}
	});

	// 一次性发送所有屏幕源到渲染进程(备用方法)
	ipcMain.on("get-all-sources", async (event) => {
		try {
			console.log("[主进程] 获取所有屏幕源");
			const sources = await desktopCapturer.getSources({
				types: ["window", "screen"],
				thumbnailSize: { width: 320, height: 180 },
				fetchWindowIcons: true,
			});
			console.log(`[主进程] 获取到 ${sources.length} 个屏幕源`);

			// 提供更详细的调试信息
			const screens = sources.filter((s) => s.id.startsWith("screen:"));
			const windows = sources.filter((s) => s.id.startsWith("window:"));

			console.log(
				`[主进程] 屏幕数量: ${screens.length}, 窗口数量: ${windows.length}`,
			);

			sources.forEach((source, index) => {
				const type = source.id.startsWith("screen:") ? "屏幕" : "窗口";
				console.log(
					`[主进程] 源 ${index + 1}: 类型=${type}, ID=${source.id}, 名称=${source.name}`,
				);
			});

			mainWindow.webContents.send("all-sources", sources);
		} catch (error: unknown) {
			console.error("[主进程] 获取所有屏幕源出错:", error);
			mainWindow.webContents.send("all-sources-error", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// 注册自定义协议，用于访问资源文件
	protocol.registerFileProtocol("app-resource", (request, callback) => {
		const url = request.url.replace("app-resource://", "");
		try {
			const filePath = join(app.getAppPath(), "resources", url);
			console.log("[主进程] 访问资源文件:", filePath);
			return callback(filePath);
		} catch (error) {
			console.error("[主进程] 访问资源文件失败:", error);
			return callback("");
		}
	});

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// 检查并请求macOS屏幕录制权限
	checkAndRequestScreenCapturePermission();

	// IPC test
	ipcMain.on("ping", () => console.log("pong"));

	createWindow();

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
