<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { appTheme } from "../config/theme";
import ScreenSourceDialog from "./ScreenSourceDialog.vue";

// 为Electron API定义接口
interface DesktopCapturerSource {
	id: string;
	name: string;
	thumbnail: Electron.NativeImage;
	display_id?: string;
	appIcon?: Electron.NativeImage;
}

// 自定义API接口
interface CustomAPI {
	selectScreenSource: (sourceId: string) => void;
	getAllScreenSources: () => Promise<DesktopCapturerSource[]>;
	getSystemInfo: () => { platform: string; arch: string };
	getResourcePath?: (filename: string) => Promise<string>;
	[key: string]: unknown;
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
		api?: CustomAPI;
	}
}

const props = defineProps({
	autoSetup: {
		type: Boolean,
		default: true,
	},
	showControls: {
		type: Boolean,
		default: true,
	},
	theme: {
		type: Object,
		default: () => ({
			recordButtonColor: appTheme.status.error,
			stopButtonColor: appTheme.status.info,
		}),
	},
	layout: {
		type: String,
		default: "standard", // standard, pip, side-by-side
	},
});

const emit = defineEmits([
	"started",
	"stopped",
	"error",
	"recorded",
	"streamReady",
	"layoutChanged",
	"screenShareStarted",
	"screenShareStopped",
]);

const isRecording = ref(false);
const videoStream = ref<MediaStream | null>(null);
const screenStream = ref<MediaStream | null>(null);
const recordedChunks = ref<Blob[]>([]);
const recordedVideoURL = ref("");
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordingTime = ref(0);
const recordingTimerId = ref<number | null>(null);
const formattedTime = ref("00:00:00");
const currentLayout = ref(props.layout);
const isScreenSharing = ref(false);
const showSourceDialog = ref(false);
const showScreenControls = ref(false);
const screenSources = ref<DesktopCapturerSource[]>([]);

// 可用的布局选项
const layouts = [
	{ id: "standard", label: "标准视图", icon: "fullscreen" },
	{ id: "pip", label: "画中画", icon: "picture_in_picture" },
	{ id: "side-by-side", label: "并排布局", icon: "dashboard" },
];

// 计算当前是否同时有摄像头和屏幕共享
const hasBothStreams = computed(() => {
	return Boolean(videoStream.value) && Boolean(screenStream.value);
});

const layoutClasses = computed(() => {
	const base =
		"recorder-container relative rounded-lg overflow-hidden bg-gray-800";

	if (!hasBothStreams.value) {
		return base;
	}

	if (currentLayout.value === "pip") {
		return `${base} pip-layout`;
	}

	if (currentLayout.value === "side-by-side") {
		return `${base} side-by-side-layout`;
	}

	return base;
});

// 切换布局
const changeLayout = (layoutId: string) => {
	// 只有当布局发生变化时才进行处理
	if (currentLayout.value !== layoutId) {
		console.log(`切换布局: ${currentLayout.value} -> ${layoutId}`);
		currentLayout.value = layoutId;

		// 延迟一下，等待DOM更新后重新连接视频流
		setTimeout(() => {
			// 重新连接视频元素
			reconnectVideoElements();
		}, 200);

		// 发送布局变更事件
		emit("layoutChanged", layoutId);
	}
};

// 重新连接视频元素
const reconnectVideoElements = () => {
	// 重新连接屏幕流
	if (screenStream.value) {
		const screenElement = document.getElementById("screen-preview");
		if (screenElement instanceof HTMLVideoElement) {
			if (
				!screenElement.srcObject ||
				screenElement.srcObject !== screenStream.value
			) {
				console.log("重新连接屏幕预览");
				screenElement.srcObject = screenStream.value;

				if (screenElement.paused) {
					screenElement
						.play()
						.then(() => console.log("屏幕预览开始播放"))
						.catch((e) => console.error("重连屏幕预览失败:", e));
				}
			}
		} else {
			console.error("找不到屏幕预览元素或元素类型不正确");
		}
	}

	// 重新连接摄像头流
	if (videoStream.value) {
		const videoElement = document.getElementById("video-preview");
		if (videoElement instanceof HTMLVideoElement) {
			if (
				!videoElement.srcObject ||
				videoElement.srcObject !== videoStream.value
			) {
				console.log("重新连接摄像头预览");
				videoElement.srcObject = videoStream.value;

				if (videoElement.paused) {
					videoElement
						.play()
						.then(() => console.log("摄像头预览开始播放"))
						.catch((e) => console.error("重连摄像头预览失败:", e));
				}
			}
		} else {
			console.error("找不到摄像头预览元素或元素类型不正确");
		}
	}
};

// 摄像头设置
const setupCamera = async () => {
	try {
		if (videoStream.value) {
			// 如果已经有视频流，则先清理
			for (const track of videoStream.value.getTracks()) {
				track.stop();
			}
			videoStream.value = null;
		}

		// 获取摄像头权限
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true,
		});

		// 设置视频流
		videoStream.value = stream;

		console.log("摄像头流获取成功，准备连接到视频元素");

		// 链接到视频元素（异步等待DOM更新）
		setTimeout(() => {
			const videoElement = document.getElementById("video-preview");
			if (videoElement instanceof HTMLVideoElement) {
				videoElement.srcObject = stream;
				videoElement.onloadedmetadata = () => {
					videoElement
						.play()
						.then(() => console.log("摄像头预览开始播放"))
						.catch((e) => console.error("无法播放摄像头预览:", e));
				};
			} else {
				console.error("找不到视频预览元素:", videoElement);
			}
		}, 100);

		emit("streamReady", stream);
		return stream;
	} catch (error) {
		console.error("无法访问摄像头:", error);
		emit("error", error);
		return null;
	}
};

// 确保摄像头预览连接
const ensureCameraPreviewConnected = () => {
	if (!videoStream.value) return;

	setTimeout(() => {
		const videoElement = document.getElementById("video-preview");
		if (videoElement instanceof HTMLVideoElement) {
			if (!videoElement.srcObject) {
				videoElement.srcObject = videoStream.value;
				videoElement.onloadedmetadata = () => {
					videoElement
						.play()
						.catch((e) => console.error("无法播放摄像头预览:", e));
				};
			} else if (videoElement.paused) {
				videoElement
					.play()
					.catch((e) => console.error("无法继续播放摄像头预览:", e));
			}
		}
	}, 200);
};

// 清理所有媒体轨道
const stopAllMediaTracks = () => {
	if (videoStream.value) {
		for (const track of videoStream.value.getTracks()) {
			track.stop();
		}
		videoStream.value = null;
	}

	if (screenStream.value) {
		for (const track of screenStream.value.getTracks()) {
			track.stop();
		}
		screenStream.value = null;
	}
};

// 开始录制
const startRecording = async () => {
	// 确保至少有一个视频源
	if (!videoStream.value && !screenStream.value) {
		const stream = await setupCamera();
		if (!stream) return;
	}

	// 准备录制数据
	recordedChunks.value = [];
	isRecording.value = true;
	recordingTime.value = 0;
	formattedTime.value = "00:00:00";

	// 创建合并流
	let combinedStream: MediaStream;

	if (videoStream.value && screenStream.value) {
		// 合并视频和屏幕流
		const audioTracks = videoStream.value.getAudioTracks();
		const screenVideoTracks = screenStream.value.getVideoTracks();

		const tracks = [...screenVideoTracks, ...audioTracks];
		combinedStream = new MediaStream(tracks);
	} else if (screenStream.value) {
		// 只有屏幕流
		combinedStream = screenStream.value;
	} else {
		// 只有视频流
		combinedStream = videoStream.value as MediaStream;
	}

	// 创建录制器
	try {
		mediaRecorder.value = new MediaRecorder(combinedStream, {
			mimeType: "video/webm;codecs=vp9,opus",
		});
	} catch (e) {
		// 尝试兼容格式
		try {
			mediaRecorder.value = new MediaRecorder(combinedStream, {
				mimeType: "video/webm",
			});
		} catch (e2) {
			console.error("无法创建录制器:", e2);
			emit("error", e2);
			isRecording.value = false;
			return;
		}
	}

	// 设置数据处理
	mediaRecorder.value.ondataavailable = (event) => {
		if (event.data && event.data.size > 0) {
			recordedChunks.value.push(event.data);
		}
	};

	// 设置录制结束处理
	mediaRecorder.value.onstop = () => {
		const blob = new Blob(recordedChunks.value, { type: "video/webm" });
		recordedVideoURL.value = URL.createObjectURL(blob);

		stopRecordingTimer();
		emit("stopped");
		emit("recorded", {
			blob,
			url: recordedVideoURL.value,
			duration: recordingTime.value,
			formattedDuration: formattedTime.value,
		});
	};

	// 开始录制
	startRecordingTimer();
	mediaRecorder.value.start(1000); // 每秒保存一次数据
	emit("started");
};

// 停止录制
const stopRecording = () => {
	if (mediaRecorder.value && isRecording.value) {
		mediaRecorder.value.stop();
		isRecording.value = false;
	}
};

// 更新录制时间
const updateRecordingTime = () => {
	recordingTime.value++;
	const hours = Math.floor(recordingTime.value / 3600)
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor((recordingTime.value % 3600) / 60)
		.toString()
		.padStart(2, "0");
	const seconds = Math.floor(recordingTime.value % 60)
		.toString()
		.padStart(2, "0");
	formattedTime.value = `${hours}:${minutes}:${seconds}`;
};

// 开始录制计时器
const startRecordingTimer = () => {
	if (recordingTimerId.value) {
		clearInterval(recordingTimerId.value);
	}
	recordingTimerId.value = window.setInterval(updateRecordingTime, 1000);
};

// 停止录制计时器
const stopRecordingTimer = () => {
	if (recordingTimerId.value) {
		clearInterval(recordingTimerId.value);
		recordingTimerId.value = null;
	}
};

// 开始屏幕共享
const startScreenShare = () => {
	console.log("开始屏幕共享");
	showSourceDialog.value = true;
};

// 停止屏幕共享
const stopScreenShare = () => {
	console.log("停止屏幕共享");

	if (screenStream.value) {
		// 停止所有屏幕共享轨道
		for (const track of screenStream.value.getTracks()) {
			track.stop();
		}
		screenStream.value = null;
	}

	isScreenSharing.value = false;
	emit("screenShareStopped");
};

// 处理屏幕源选择
const handleSourceSelect = async (sourceId: string) => {
	console.log("选择了屏幕源:", sourceId);

	// 打印源类型信息
	const isScreenSource = sourceId.startsWith("screen:");
	const isWindowSource = sourceId.startsWith("window:");
	console.log(
		`源类型: ${isScreenSource ? "屏幕" : isWindowSource ? "窗口" : "未知"}`,
	);

	try {
		// 如果已有屏幕流，先停止
		if (screenStream.value) {
			for (const track of screenStream.value.getTracks()) {
				track.stop();
			}
			screenStream.value = null;
		}

		// 设置为正在共享屏幕
		isScreenSharing.value = true;

		// 使用浏览器API创建流的方式
		let stream: MediaStream;

		// 使用Electron IPC方式
		if (window.electron?.ipcRenderer) {
			// 监听stream-ready事件
			window.electron.ipcRenderer.on(
				"source-stream-ready",
				async (data: unknown) => {
					console.log("收到source-stream-ready事件", data);

					try {
						// 使用navigator.mediaDevices获取屏幕流
						stream = await navigator.mediaDevices.getUserMedia({
							audio: false,
							video: {
								// @ts-ignore - Electron特有的API，TypeScript无法识别
								mandatory: {
									chromeMediaSource: "desktop",
									chromeMediaSourceId: sourceId,
								},
							},
						});

						// 设置屏幕流
						screenStream.value = stream;

						// 记录和显示流的详细信息
						const tracks = stream.getTracks();
						console.log(`获取到 ${tracks.length} 个媒体轨道:`);
						tracks.forEach((track, index) => {
							console.log(
								`轨道 ${index + 1}: 类型=${track.kind}, 标签=${track.label}`,
							);
						});

						// 连接到视频元素
						setTimeout(() => {
							const screenElement = document.getElementById("screen-preview");
							if (screenElement instanceof HTMLVideoElement) {
								console.log("将屏幕流连接到视频元素");
								screenElement.srcObject = stream;
								screenElement.onloadedmetadata = () => {
									screenElement
										.play()
										.then(() => console.log("屏幕预览开始播放"))
										.catch((e) => console.error("无法播放屏幕预览:", e));
								};
							} else {
								console.error("找不到屏幕预览元素");
							}
						}, 100);

						emit("screenShareStarted", stream);
					} catch (err) {
						console.error("获取屏幕流失败:", err);
						isScreenSharing.value = false;
					}

					// 移除监听器
					if (window.electron?.ipcRenderer) {
						window.electron.ipcRenderer.removeAllListeners(
							"source-stream-ready",
						);
					}
				},
			);

			// 请求获取屏幕流
			console.log("发送get-source-stream请求，sourceId:", sourceId);
			window.electron.ipcRenderer.send("get-source-stream", sourceId);
		}
		// 使用预加载脚本API方式
		else if (window.api) {
			try {
				// 使用navigator.mediaDevices.getDisplayMedia获取屏幕流
				console.log("使用getDisplayMedia API获取屏幕流");
				stream = await navigator.mediaDevices.getDisplayMedia({
					video: true,
				});

				screenStream.value = stream;

				// 记录和显示流的详细信息
				const tracks = stream.getTracks();
				console.log(`获取到 ${tracks.length} 个媒体轨道:`);
				tracks.forEach((track, index) => {
					console.log(
						`轨道 ${index + 1}: 类型=${track.kind}, 标签=${track.label}`,
					);
				});

				// 设置屏幕轨道结束事件
				const videoTracks = stream.getVideoTracks();
				if (videoTracks.length > 0) {
					videoTracks[0].onended = () => {
						stopScreenShare();
					};
				}

				// 连接到视频元素
				setTimeout(() => {
					const screenElement = document.getElementById("screen-preview");
					if (screenElement instanceof HTMLVideoElement) {
						console.log("将屏幕流连接到视频元素");
						screenElement.srcObject = stream;
						screenElement.onloadedmetadata = () => {
							screenElement
								.play()
								.then(() => console.log("屏幕预览开始播放"))
								.catch((e) => console.error("无法播放屏幕预览:", e));
						};
					} else {
						console.error("找不到屏幕预览元素");
					}
				}, 100);

				emit("screenShareStarted", stream);
			} catch (err) {
				console.error("直接获取屏幕流失败:", err);
				isScreenSharing.value = false;
			}
		}
	} catch (error) {
		console.error("处理屏幕源选择失败:", error);
		isScreenSharing.value = false;
		emit("error", error);
	}
};

// 导出组件方法
defineExpose({
	startRecording,
	stopRecording,
	setupCamera,
	stopAllMediaTracks,
	isRecording,
	isScreenSharing,
	recordedVideoURL,
	formattedTime,
	changeLayout,
	currentLayout,
	startScreenShare,
	stopScreenShare,
});

// 监听录制状态变化
watch(isRecording, (newVal) => {
	if (!newVal) {
		stopRecordingTimer();
	}
});

// 监听布局变化，确保视频正确连接
watch(currentLayout, () => {
	// 重新连接视频元素，使用延迟确保DOM更新
	setTimeout(reconnectVideoElements, 200);
});

// 监听屏幕共享状态变化
watch(isScreenSharing, (newVal) => {
	if (newVal) {
		setTimeout(reconnectVideoElements, 200);
	}
});

// 监听屏幕流变化
watch(screenStream, (newVal, oldVal) => {
	if (newVal && newVal !== oldVal) {
		setTimeout(reconnectVideoElements, 200);
	}
});

// 监听摄像头流变化
watch(videoStream, (newVal, oldVal) => {
	if (newVal && newVal !== oldVal) {
		setTimeout(reconnectVideoElements, 200);
	}
});

// 监听两个流同时存在的情况
watch(hasBothStreams, (newVal) => {
	if (newVal) {
		// 如果两个流都存在，使用标准布局作为默认
		setTimeout(reconnectVideoElements, 200);
	}
});

onUnmounted(() => {
	// 清理IPC监听
	if (window.electron?.ipcRenderer) {
		window.electron.ipcRenderer.removeAllListeners("source-selected");
		window.electron.ipcRenderer.removeAllListeners("source-stream-ready");
	}

	// 停止计时器
	stopRecordingTimer();

	// 停止媒体流
	stopAllMediaTracks();

	// 清理URL对象
	if (recordedVideoURL.value) {
		URL.revokeObjectURL(recordedVideoURL.value);
	}
});
</script>

<template>
	<div class="video-recorder">
		<!-- 视频预览容器 -->
		<div :class="layoutClasses">
			<!-- 标准布局 -->
			<template v-if="!hasBothStreams">
				<!-- 如果只有屏幕共享视频，显示为全屏 -->
				<template v-if="screenStream">
					<video
						id="screen-preview"
						autoplay
						muted
						playsinline
						class="w-full h-full object-contain"
					></video>
				</template>
				
				<!-- 如果只有摄像头视频，将其显示为全屏 -->
				<template v-else-if="videoStream">
					<video
						id="video-preview"
						autoplay
						muted
						playsinline
						class="w-full h-full object-cover"
					></video>
					
					<!-- 屏幕共享提示 -->
					<div class="absolute top-4 left-4 flex items-center bg-black/70 rounded-full px-3 py-1.5 z-10">
						<span class="material-icons text-white mr-1.5" style="font-size: 16px">info</span>
						<span class="text-white text-sm">点击下方按钮共享屏幕</span>
					</div>
				</template>
				
				<!-- 无视频源时显示提示 -->
				<template v-else>
					<div class="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
						<span class="material-icons text-5xl mb-4">videocam_off</span>
						<p class="text-lg mb-4">无视频源，请开启摄像头或共享屏幕</p>
						<div class="flex space-x-3">
							<button
								class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 bg-blue-600"
								@click="setupCamera"
							>
								<span class="material-icons mr-1.5" style="font-size: 18px">videocam</span>
								<span>开启摄像头</span>
							</button>
							<button
								class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 bg-purple-600"
								@click="startScreenShare"
							>
								<span class="material-icons mr-1.5" style="font-size: 18px">screen_share</span>
								<span>共享屏幕</span>
							</button>
						</div>
					</div>
				</template>
			</template>
			
			<!-- 画中画布局 - 屏幕为主，摄像头为画中画 -->
			<template v-else-if="currentLayout === 'pip'">
				<video
					id="screen-preview"
					autoplay
					muted
					playsinline
					class="main-video"
				></video>
				
				<div class="pip-video">
					<video
						id="video-preview"
						autoplay
						muted
						playsinline
						class="w-full h-full object-cover"
					></video>
				</div>
			</template>
			
			<!-- 并排布局 -->
			<template v-else-if="currentLayout === 'side-by-side'">
				<div class="video-container">
					<video
						id="screen-preview"
						autoplay
						muted
						playsinline
						class="w-full h-full"
					></video>
				</div>
				
				<div class="video-container">
					<video
						id="video-preview"
						autoplay
						muted
						playsinline
						class="w-full h-full object-cover"
					></video>
				</div>
			</template>
			
			<!-- 标准布局（当同时有两个流时） -->
			<template v-else>
				<video
					id="screen-preview"
					autoplay
					muted
					playsinline
					class="w-full h-full object-contain"
				></video>
				
				<!-- 同时有摄像头，在右下角显示摄像头画面 -->
				<div class="absolute bottom-4 right-4 w-1/4 md:w-1/5 aspect-video rounded overflow-hidden shadow-lg border-2 border-white bg-black z-10">
					<video
						id="video-preview"
						autoplay
						muted
						playsinline
						class="w-full h-full object-cover"
					></video>
				</div>
			</template>
			
			<!-- 录制指示器 -->
			<div v-if="isRecording" class="absolute top-4 left-4 flex items-center bg-black/70 rounded-full px-3 py-1.5 z-10">
				<span class="animate-pulse h-3 w-3 rounded-full bg-red-500 mr-2"></span>
				<span class="text-white text-sm">{{ formattedTime }}</span>
			</div>
			
			
			</div>
		
		<!-- 录制的视频播放器（如果有） -->
		<div v-if="recordedVideoURL" class="mt-4">
			<video
				id="recorded-video"
				controls
				class="w-full rounded-lg"
				:src="recordedVideoURL"
			></video>
		</div>
		
		<!-- 控制按钮 -->
		<div v-if="showControls" class="flex justify-center flex-wrap space-x-3 mt-4">
			<!-- 摄像头控制 -->
			<button
				v-if="!videoStream"
				class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 bg-blue-600 mb-2"
				@click="setupCamera"
			>
				<span class="material-icons mr-1.5" style="font-size: 18px">videocam</span>
				<span>开启摄像头</span>
			</button>
			
			<!-- 屏幕共享控制 -->
			<button
				v-if="!isScreenSharing"
				class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 bg-purple-600 mb-2"
				@click="startScreenShare"
			>
				<span class="material-icons mr-1.5" style="font-size: 18px">screen_share</span>
				<span>共享屏幕</span>
			</button>
			<button
				v-else
				class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 bg-gray-600 mb-2"
				@click="stopScreenShare"
			>
				<span class="material-icons mr-1.5" style="font-size: 18px">stop_screen_share</span>
				<span>停止共享</span>
			</button>
			
			<!-- 录制控制 -->
			<button
				v-if="!isRecording"
				class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 mb-2"
				:style="`background-color: ${theme.recordButtonColor}`"
				@click="startRecording"
			>
				<span class="material-icons mr-1.5" style="font-size: 18px">fiber_manual_record</span>
				<span>开始录制</span>
			</button>
			<button
				v-else
				class="flex items-center px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 mb-2"
				:style="`background-color: ${theme.stopButtonColor}`"
				@click="stopRecording"
			>
				<span class="material-icons mr-1.5" style="font-size: 18px">stop</span>
				<span>停止录制</span>
			</button>
		</div>
		
		<!-- 屏幕源选择对话框 -->
		<ScreenSourceDialog 
			:visible="showSourceDialog" 
			@close="showSourceDialog = false"
			@select="handleSourceSelect"
		/>
	</div>
</template>

<style scoped>
.video-recorder {
	width: 100%;
}

.recorder-container {
	width: 100%;
	aspect-ratio: 16/9;
	position: relative;
}

/* 画中画布局样式 */
.pip-layout .main-video {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.pip-layout .pip-video {
	position: absolute;
	bottom: 1rem;
	right: 1rem;
	width: 25%;
	height: auto;
	aspect-ratio: 16/9;
	border-radius: 0.375rem;
	overflow: hidden;
	border: 2px solid white;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	z-index: 10;
}

/* 并排布局样式 */
.side-by-side-layout {
	display: flex;
	flex-direction: row;
}

.side-by-side-layout .video-container {
	flex: 1;
	height: 100%;
	position: relative;
}

.side-by-side-layout .video-container:first-child {
	border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.side-by-side-layout video {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}

::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 10px;
}

::-webkit-scrollbar-thumb {
	background: #c1c1c1;
	border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
	background: #a1a1a1;
}

/* 确保按钮在小屏上换行 */
@media (max-width: 640px) {
	.flex.space-x-3 {
		gap: 0.75rem;
	}
	
	/* 在小屏幕上调整画中画大小 */
	.pip-layout .pip-video {
		width: 30%;
	}
	
	/* 在小屏幕上改为上下布局 */
	.side-by-side-layout {
		flex-direction: column;
	}
	
	.side-by-side-layout .video-container:first-child {
		border-right: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}
}
</style> 