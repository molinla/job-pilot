import type { ElectronAPI } from "@electron-toolkit/preload";

// 定义我们的自定义API接口
interface DesktopCapturerSource {
	id: string;
	name: string;
	thumbnail: Electron.NativeImage;
	display_id?: string;
	appIcon?: Electron.NativeImage;
}

interface CustomAPI {
	selectScreenSource: (sourceId: string) => void;
	getAllScreenSources: () => Promise<DesktopCapturerSource[]>;
	getSystemInfo: () => { platform: string; arch: string };
	checkMediaPermission?: (mediaType: string) => string;
	getResourcePath?: (filename: string) => Promise<string>;
	[key: string]: unknown;
}

// 自定义Electron API
interface CustomElectronAPI {
	desktopCapturer?: {
		getSources: (
			options: Record<string, unknown>,
		) => Promise<DesktopCapturerSource[]>;
	};
	ipcRenderer?: {
		send: (channel: string, ...args: unknown[]) => void;
		on: (channel: string, func: (...args: unknown[]) => void) => void;
		removeAllListeners: (channel: string) => void;
	};
	systemPermissions?: {
		getMediaAccessStatus: (mediaType: string) => string;
	};
}

declare global {
	interface Window {
		electron: CustomElectronAPI & ElectronAPI;
		api: CustomAPI;
	}
}
