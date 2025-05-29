<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { appTheme } from "../config/theme";

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits(["close", "select"]);

// 屏幕源列表
interface DesktopCapturerSource {
	id: string;
	name: string;
	thumbnail: Electron.NativeImage;
	display_id?: string;
	appIcon?: Electron.NativeImage;
}

// 扩展Window接口
declare global {
	interface Window {
		electron?: {
			ipcRenderer?: {
				on: (
					channel: string,
					listener: (event: unknown, ...args: unknown[]) => void,
				) => void;
				send: (channel: string, ...args: unknown[]) => void;
				removeAllListeners: (channel: string) => void;
			};
		};
		api?: {
			getAllScreenSources: () => Promise<DesktopCapturerSource[]>;
			selectScreenSource: (sourceId: string) => void;
			[key: string]: unknown;
		};
	}
}

const sources = ref<DesktopCapturerSource[]>([]);
const loading = ref(true);
const error = ref("");

// 判断源是否为屏幕
const isScreen = (source: DesktopCapturerSource) => {
	// Electron 返回的屏幕源ID格式为：screen:<id>
	// 窗口源ID格式为：window:<id>
	return source.id.startsWith("screen:");
};

// 判断源是否为窗口
const isWindow = (source: DesktopCapturerSource) => {
	return source.id.startsWith("window:");
};

// 过滤屏幕源
const screenSources = computed(() => {
	return sources.value.filter(isScreen);
});

// 过滤窗口源
const windowSources = computed(() => {
	return sources.value.filter(isWindow);
});

// 获取所有可用的屏幕源
const fetchSources = async () => {
	try {
		loading.value = true;
		error.value = "";
		console.log("开始获取屏幕源");

		// 优先使用 Electron 预加载的 API
		if (window.api && typeof window.api.getAllScreenSources === "function") {
			console.log("使用 window.api.getAllScreenSources 获取屏幕源");
			try {
				sources.value = await window.api.getAllScreenSources();
				console.log(`获取到 ${sources.value.length} 个屏幕源`);

				// 检查获取的源
				sources.value.forEach((source, index) => {
					console.log(`源 ${index + 1}: ID=${source.id}, 名称=${source.name}`);
				});

				if (sources.value.length === 0) {
					console.warn("获取到0个屏幕源");
					error.value = "没有找到可用的屏幕源，请确保已授予屏幕录制权限";
				}
			} catch (err) {
				console.error("获取屏幕源失败:", err);
				error.value = "获取屏幕源失败，请确保已授予屏幕录制权限";

				// 在开发模式下显示特殊提示
				const isDev =
					window.location.hostname === "localhost" ||
					window.location.hostname === "127.0.0.1";
				if (isDev) {
					error.value =
						"开发模式下需要手动授权屏幕录制权限。请确保已在系统偏好设置中允许应用录制屏幕。";
				}
			}
		} else if (window.electron?.ipcRenderer) {
			// 回退方法：通过IPC请求主进程获取屏幕源
			console.log("通过IPC请求主进程获取屏幕源");
			try {
				window.electron.ipcRenderer.send("get-all-sources");

				// 创建Promise等待响应
				const sourcesPromise = new Promise<DesktopCapturerSource[]>(
					(resolve, reject) => {
						window.electron?.ipcRenderer?.on(
							"all-sources",
							(allSources: DesktopCapturerSource[]) => {
								console.log(`通过IPC获取到 ${allSources.length} 个屏幕源`);
								resolve(allSources);
							},
						);

						window.electron?.ipcRenderer?.on("all-sources-error", (err) => {
							console.error("通过IPC获取屏幕源失败:", err);
							reject(err);
						});

						// 超时处理
						setTimeout(() => reject(new Error("获取屏幕源超时")), 5000);
					},
				);

				sources.value = await sourcesPromise;

				// 清理监听器
				window.electron.ipcRenderer.removeAllListeners("all-sources");
				window.electron.ipcRenderer.removeAllListeners("all-sources-error");

				if (sources.value.length === 0) {
					error.value = "没有找到可用的屏幕源";
				}
			} catch (ipcErr) {
				console.error("IPC获取屏幕源失败:", ipcErr);
				error.value = "获取屏幕源失败，请确保已授予屏幕录制权限";

				// 尝试使用浏览器API
				tryBrowserAPI();
			}
		} else {
			// 在浏览器环境中，直接使用浏览器API
			console.log("无法访问Electron API，尝试使用浏览器API");
			tryBrowserAPI();
		}
	} catch (err) {
		console.error("获取屏幕源失败:", err);
		error.value = "获取屏幕源失败";

		// 尝试浏览器API作为最后手段
		tryBrowserAPI();
	} finally {
		loading.value = false;
	}
};

// 尝试使用浏览器API获取屏幕流
const tryBrowserAPI = async () => {
	try {
		console.log("尝试使用浏览器getDisplayMedia API");

		const stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
		});
		console.log("成功获取屏幕流，发送选择事件");

		// 获取流的第一个视频轨道
		const videoTrack = stream.getVideoTracks()[0];
		if (videoTrack) {
			// 直接使用流ID作为源ID
			console.log(`使用浏览器API获取到流，ID: ${videoTrack.id}`);

			// 构造虚拟源对象
			const fakeSource: DesktopCapturerSource = {
				id: videoTrack.id,
				name: videoTrack.label || "屏幕共享",
				thumbnail: {
					toDataURL: () => "", // 空缩略图
				} as any,
			};

			sources.value = [fakeSource];
			error.value = "";
		} else {
			console.error("获取到的流没有视频轨道");
			error.value = "获取屏幕流失败，没有可用的视频轨道";
		}
	} catch (browserErr) {
		console.error("浏览器API失败:", browserErr);
		error.value = "无法访问屏幕共享功能，请确保已授予权限";
	}
};

// 选择屏幕源
const selectSource = (sourceId: string) => {
	console.log("选择屏幕源:", sourceId);

	// 发出选择事件
	emit("select", sourceId);

	// 关闭对话框
	emit("close");

	// 如果可用，通过API发送选择
	if (window.api?.selectScreenSource) {
		console.log("通过window.api.selectScreenSource发送选择");
		window.api.selectScreenSource(sourceId);
	}
	// 或者通过IPC发送
	else if (window.electron?.ipcRenderer) {
		console.log("通过ipcRenderer发送source-selected事件");
		window.electron.ipcRenderer.send("source-selected", sourceId);
	} else {
		console.warn("无法发送source-selected事件，API和IPC都不可用");
	}
};

// 关闭对话框
const close = () => {
	emit("close");
};

// 监听visible属性变化
watch(
	() => props.visible,
	(newVal) => {
		if (newVal) {
			fetchSources();
		}
	},
);

// 组件挂载时获取屏幕源
onMounted(() => {
	if (props.visible) {
		fetchSources();
	}
});

// 暴露组件方法
defineExpose({
	fetchSources,
});
</script>

<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="screen-source-dialog">
      <!-- 背景遮罩 -->
      <div class="overlay" @click="close"></div>
      
      <!-- 对话框内容 -->
      <div class="dialog-content">
        <div class="dialog-header">
          <h2 class="dialog-title">选择共享内容</h2>
          <button class="close-button" @click="close">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="dialog-body">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>正在获取可用屏幕源...</p>
          </div>
          
          <!-- 错误状态 -->
          <div v-else-if="error" class="error-state">
            <span class="material-icons text-red-500 text-4xl">error</span>
            <p class="text-red-500">{{ error }}</p>
            <button 
              class="retry-button"
              @click="fetchSources"
            >
              重试
            </button>
          </div>
          
          <!-- 源列表 -->
          <div v-else-if="sources.length > 0" class="sources-grid">
            <!-- 屏幕 -->
            <div class="source-group">
              <h3 class="source-group-title">屏幕</h3>
              <div class="sources-list">
                <div 
                  v-for="source in screenSources" 
                  :key="source.id"
                  class="source-item"
                  @click="selectSource(source.id)"
                >
                  <div class="thumbnail">
                    <img 
                      v-if="source.thumbnail && source.thumbnail.toDataURL" 
                      :src="source.thumbnail.toDataURL()" 
                      alt="屏幕预览"
                    />
                    <div v-else class="no-thumbnail">
                      <span class="material-icons">desktop_windows</span>
                    </div>
                  </div>
                  <p class="source-name">{{ source.name }}</p>
                </div>
              </div>
            </div>
            
            <!-- 应用窗口 -->
            <div class="source-group">
              <h3 class="source-group-title">窗口</h3>
              <div class="sources-list">
                <div 
                  v-for="source in windowSources" 
                  :key="source.id"
                  class="source-item"
                  @click="selectSource(source.id)"
                >
                  <div class="thumbnail">
                    <img 
                      v-if="source.thumbnail && source.thumbnail.toDataURL" 
                      :src="source.thumbnail.toDataURL()" 
                      alt="窗口预览"
                    />
                    <div v-else class="no-thumbnail">
                      <span class="material-icons">crop_original</span>
                    </div>
                  </div>
                  <p class="source-name">{{ source.name }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无源状态 -->
          <div v-else class="empty-state">
            <span class="material-icons text-gray-400 text-4xl">desktop_access_disabled</span>
            <p class="text-gray-500">没有找到可用的屏幕源</p>
            <button 
              class="retry-button"
              @click="fetchSources"
            >
              重试
            </button>
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-button" @click="close">取消</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.screen-source-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.dialog-content {
  position: relative;
  width: 80%;
  max-width: 900px;
  max-height: 80vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.dialog-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: v-bind('appTheme.accent.base');
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-button {
  margin-top: 16px;
  padding: 8px 16px;
  background-color: v-bind('appTheme.accent.base');
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: v-bind('appTheme.accent.dark');
}

.sources-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.source-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.sources-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.source-item {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e5e7eb;
}

.source-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: v-bind('appTheme.accent.base');
}

.thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-thumbnail {
  color: #9ca3af;
  font-size: 32px;
}

.source-name {
  padding: 8px 12px;
  font-size: 14px;
  color: #4b5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: #f9fafb;
  margin: 0;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.cancel-button {
  padding: 8px 16px;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #e5e7eb;
}

/* 淡入淡出动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style> 