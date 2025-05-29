import {
	contextBridge,
	ipcRenderer,
	desktopCapturer,
	systemPreferences,
} from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// 扩展electronAPI，添加屏幕共享功能
const extendedElectronAPI = {
	...electronAPI,
	// 桌面捕获API
	desktopCapturer: {
		getSources: async (options) => {
			try {
				console.log("[预加载] 调用get-screen-sources", options);
				const sources = await ipcRenderer.invoke("get-screen-sources");
				console.log(`[预加载] 获取到 ${sources.length} 个屏幕源`);
				return sources;
			} catch (error) {
				console.error("[预加载] 获取屏幕源失败:", error);
				return [];
			}
		},
	},
	// IPC通信
	ipcRenderer: {
		// 发送消息到主进程
		send: (channel, ...args) => {
			console.log(`[预加载] 发送${channel}消息到主进程`, ...args);
			ipcRenderer.send(channel, ...args);
		},
		// 接收主进程消息
		on: (channel, func) => {
			console.log(`[预加载] 注册监听${channel}事件`);
			const wrappedFunc = (event, ...args) => {
				console.log(`[预加载] 收到${channel}事件`, ...args);
				func(...args);
			};
			ipcRenderer.on(channel, wrappedFunc);
			return () => ipcRenderer.removeListener(channel, wrappedFunc);
		},
		// 移除所有监听器
		removeAllListeners: (channel) => {
			console.log(`[预加载] 移除${channel}所有监听器`);
			ipcRenderer.removeAllListeners(channel);
		},
	},
	// 系统权限检查
	systemPermissions: {
		getMediaAccessStatus: (mediaType) => {
			if (systemPreferences?.getMediaAccessStatus) {
				return systemPreferences.getMediaAccessStatus(mediaType);
			}
			return "not-determined";
		},
	},
};

// Custom APIs for renderer
const api = {
	// 选择屏幕源进行共享
	selectScreenSource: (sourceId) => {
		console.log("[API] 选择屏幕源:", sourceId);
		ipcRenderer.send("select-screen-source", sourceId);
	},
	// 获取所有屏幕源
	getAllScreenSources: () => {
		console.log("[API] 请求获取所有屏幕源");
		ipcRenderer.send("get-all-sources");
		return new Promise((resolve, reject) => {
			ipcRenderer.once("all-sources", (event, sources) => {
				console.log(`[API] 收到所有屏幕源: ${sources.length}个`);
				resolve(sources);
			});
			ipcRenderer.once("all-sources-error", (event, error) => {
				console.error("[API] 获取所有屏幕源失败:", error);
				reject(error);
			});
		});
	},
	// 获取系统信息
	getSystemInfo: () => {
		return {
			platform: process.platform,
			arch: process.arch,
		};
	},
	// 检查媒体权限状态
	checkMediaPermission: (mediaType) => {
		if (systemPreferences?.getMediaAccessStatus) {
			return systemPreferences.getMediaAccessStatus(mediaType);
		}
		return "not-determined";
	},
	// 获取资源文件路径
	getResourcePath: (filename) => {
		console.log("[API] 获取资源文件路径:", filename);
		return ipcRenderer.invoke("get-resource-path", filename);
	},
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld("electron", extendedElectronAPI);
		contextBridge.exposeInMainWorld("api", api);
	} catch (error) {
		console.error(error);
	}
} else {
	// @ts-ignore (define in dts)
	window.electron = extendedElectronAPI;
	// @ts-ignore (define in dts)
	window.api = api;
}
