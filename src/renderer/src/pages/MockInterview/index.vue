<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";
import Header from "./components/Header.vue";
import VideoPlaceholder from "./components/VideoPlaceholder.vue";
import ControlBar from "./components/ControlBar.vue";
import { questionService, statisticsService } from "../../services";

// 声明 SpeechRecognition 类型
interface SpeechRecognitionEvent extends Event {
	resultIndex: number;
	results: {
		[index: number]: {
			isFinal: boolean;
			[index: number]: {
				transcript: string;
			};
		};
		length: number;
	};
}

interface SpeechRecognitionError extends Event {
	error: string;
}

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start: () => void;
	stop: () => void;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onerror: ((event: SpeechRecognitionError) => void) | null;
	onend: (() => void) | null;
}

// 面试记录接口
interface InterviewRecord {
	id: number;
	date: string;
	duration: string;
	difficulty: string;
	score: number;
	topics: string[];
}

// 声明全局 API 类型
declare global {
	interface Window {
		api?: {
			getResourcePath: (filename: string) => Promise<string>;
			[key: string]: unknown;
		};
		SpeechRecognition?: {
			new (): SpeechRecognition;
		};
		webkitSpeechRecognition?: {
			new (): SpeechRecognition;
		};
	}
}

defineOptions({
	name: "MockInterview",
});

const router = useRouter();
const pageTitle = ref("模拟面试");
const meetingTitle = ref("前端开发模拟面试");
const meetingId = ref("389 475 1029");
const duration = ref("00:00");
const participantCount = ref(2);

// 是否处于准备页面状态
const isPreparation = ref(true);

// 面试设置
const difficultyOptions = [
	{ value: "easy", label: "简单" },
	{ value: "medium", label: "中等" },
	{ value: "hard", label: "困难" },
];
const selectedDifficulty = ref("medium");

const durationOptions = [
	{ value: 15, label: "15分钟" },
	{ value: 30, label: "30分钟" },
	{ value: 45, label: "45分钟" },
	{ value: 60, label: "60分钟" },
];
const selectedDuration = ref(30);

const historyKey = "mockInterviewHistory";

// 音频播放相关
const introAudio = ref<HTMLAudioElement | null>(null);
const questionAudio = ref<HTMLAudioElement | null>(null);
const introAudioPath = ref("");
const questionAudioPath = ref("");

// 读取本地历史记录
function loadHistory() {
	const raw = localStorage.getItem(historyKey);
	if (!raw) return [];
	try {
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

const historyRecords = ref(loadHistory());

function saveHistory(records) {
	localStorage.setItem(historyKey, JSON.stringify(records));
}

let timer: number | null = null;
let interviewStartTime = 0;

const subtitleText = ref("");
let recognition: SpeechRecognition | null = null;

function stopRecognition() {
	console.log("[面试] 停止语音识别");
	if (recognition) {
		try {
			recognition.onend = null; // 移除end事件处理器，防止自动重启
			recognition.stop();
		} catch (error) {
			console.error("[面试] 停止语音识别出错:", error);
		} finally {
			recognition = null;
		}
	}
	subtitleText.value = "";
}

// 准备音频文件
async function prepareAudios() {
	try {
		if (!window.api?.getResourcePath) {
			console.error("[面试] API 不可用");
			return;
		}
		introAudioPath.value = await window.api.getResourcePath("自我介绍.wav");
		questionAudioPath.value = await window.api.getResourcePath("问题 1.wav");
		console.log(
			`[面试] 音频文件路径准备完成: ${introAudioPath.value}, ${questionAudioPath.value}`,
		);
	} catch (error) {
		console.error("[面试] 准备音频文件失败:", error);
	}
}

const goBack = () => {
	router.push("/");
};

// 添加流式输出文字函数
async function typeText(text: string, speed = 150) {
	subtitleText.value = "";

	// 随机1-3个字符输出
	let i = 0;
	while (i < text.length) {
		// 随机决定这次输出1-3个字符
		const chunkSize = Math.floor(Math.random() * 3) + 1;
		// 确保不超出字符串长度
		const end = Math.min(i + chunkSize, text.length);
		// 截取当前要显示的字符
		const chunk = text.substring(i, end);

		// 添加到字幕
		subtitleText.value += chunk;

		// 更新索引
		i = end;

		// 等待随机时间，让输出速度有些变化
		const randomDelay = speed * 0.7 + Math.random() * speed * 0.6;
		await new Promise((resolve) => setTimeout(resolve, randomDelay));
	}

	return new Promise((resolve) => setTimeout(resolve, 500)); // 文字完全显示后额外等待时间
}

// 修改startInterview函数，移除自动播放逻辑
const startInterview = () => {
	isPreparation.value = false;
	meetingTitle.value = `前端开发模拟面试 (${difficultyOptions.find((d) => d.value === selectedDifficulty.value)?.label})`;
	meetingId.value =
		`${Math.floor(100000000 + Math.random() * 900000000)}`.replace(
			/(\d{3})(\d{3})(\d{3})/,
			"$1 $2 $3",
		);
	interviewStartTime = Date.now();
	duration.value = "00:00";
	if (timer) clearInterval(timer);
	timer = window.setInterval(() => {
		const now = Date.now();
		const usedSeconds = Math.floor((now - interviewStartTime) / 1000);
		const min = String(Math.floor(usedSeconds / 60)).padStart(2, "0");
		const sec = String(usedSeconds % 60).padStart(2, "0");
		duration.value = `${min}:${sec}`;
	}, 1000);
};
// 会议控制功能
const handleManage = () => {
	console.log("管理会议");
};

const handleEnd = async () => {
	console.log("结束会议");
	if (!interviewStartTime) {
		isPreparation.value = true;
		stopRecognition();
		return;
	}
	const endTime = Date.now();
	const usedSeconds = Math.floor((endTime - interviewStartTime) / 1000);
	const min = String(Math.floor(usedSeconds / 60)).padStart(2, "0");
	const sec = String(usedSeconds % 60).padStart(2, "0");
	const durationStr = `${min}:${sec}`;
	const today = new Date();
	const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	const score = Math.floor(20 + Math.random() * 40);
	const newRecord: InterviewRecord = {
		id: Date.now(),
		date: dateStr,
		duration: durationStr,
		difficulty:
			difficultyOptions.find((d) => d.value === selectedDifficulty.value)
				?.label || "中等",
		score,
		topics: ["算法", "前端", "综合"],
	};

	// 保存到本地存储
	const updated = [newRecord, ...loadHistory()];
	saveHistory(updated);
	historyRecords.value = updated;

	// 尝试更新服务器端的用户统计数据
	try {
		await statisticsService.updateCurrentUserStatistics({
			// 这里可以根据实际需要更新相应的统计数据
			// 比如增加面试次数等
		});
		console.log("用户统计数据更新成功");
	} catch (error) {
		console.error("更新用户统计数据失败:", error);
		// 即使 API 调用失败，也不影响本地功能
	}

	isPreparation.value = true;
	interviewStartTime = 0;
	if (timer !== null) {
		clearInterval(timer);
		timer = null;
	}
	stopRecognition();
};

// 控制栏功能
const handleToggleMute = () => {
	console.log("切换静音");
};

const handleToggleVideo = () => {
	console.log("切换视频");
};

const handleToggleShare = () => {
	console.log("切换共享");
};

const handleToggleChat = () => {
	console.log("切换聊天");
};

const handleToggleRaiseHand = () => {
	console.log("切换举手");
};

const handleInvite = () => {
	console.log("邀请");
};

const handleMore = () => {
	console.log("更多选项");
};

// 查看历史记录详情
const viewHistoryDetail = (record) => {
	console.log("查看历史记录", record);
	router.push(`/mock-interview/detail/${record.id}`);
};

// 页面激活时刷新历史
onMounted(() => {
	historyRecords.value = loadHistory();
	prepareAudios();
});

onUnmounted(() => {
	if (timer !== null) clearInterval(timer);
	stopRecognition();
});
</script>

<template>
	<div class="flex flex-col h-full relative overflow-hidden">
		<!-- 背景光晕效果 -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div
				class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
				:style="`background-color: ${appTheme.secondary.base}; opacity: 0.2`"
			></div>
			<div
				class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
				:style="`background-color: ${appTheme.secondary.base}; opacity: 0.2`"
			></div>
		</div>

		<div class="relative z-10 flex flex-col h-full">
			<!-- 准备页面 -->
			<div v-if="isPreparation" class="flex flex-col h-full">
				<div class="bg-white px-4 py-3 flex justify-between items-center shadow-md">
					<div class="flex items-center">
						<button
							class="cursor-pointer mr-3 size-8 text-center flex items-center justify-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
							@click="goBack"
							:style="`color: ${appTheme.secondary.base}`"
						>
							<span class="material-icons" style="font-size: 20px">arrow_back</span>
						</button>
						<h1
							class="text-lg font-bold"
							:style="`color: ${appTheme.secondary.dark}`"
						>
							{{ pageTitle }} - 准备
						</h1>
					</div>
				</div>

				<div class="flex-1 p-4 overflow-auto">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<!-- 左侧：面试设置 -->
						<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
							<h2 class="text-xl font-bold mb-6" :style="`color: ${appTheme.secondary.dark}`">面试设置</h2>
							
							<!-- 难度选择 -->
							<div class="mb-6">
								<label class="block text-sm font-medium mb-2 text-gray-700">难度选择</label>
								<div class="flex space-x-3">
									<button
										v-for="option in difficultyOptions"
										:key="option.value"
										class="flex-1 py-2 px-4 rounded-md text-center transition-all duration-200"
										:class="selectedDifficulty === option.value ? 'shadow-sm' : 'opacity-70'"
										:style="`
											background-color: ${selectedDifficulty === option.value ? appTheme.secondary.base : appTheme.secondary.light}; 
											color: ${selectedDifficulty === option.value ? 'white' : appTheme.secondary.base}
										`"
										@click="selectedDifficulty = option.value"
									>
										{{ option.label }}
									</button>
								</div>
							</div>
							
							<!-- 时长选择 -->
							<div class="mb-6">
								<label class="block text-sm font-medium mb-2 text-gray-700">时长选择</label>
								<div class="flex space-x-3">
									<button
										v-for="option in durationOptions"
										:key="option.value"
										class="flex-1 py-2 px-2 rounded-md text-center transition-all duration-200"
										:class="selectedDuration === option.value ? 'shadow-sm' : 'opacity-70'"
										:style="`
											background-color: ${selectedDuration === option.value ? appTheme.secondary.base : appTheme.secondary.light}; 
											color: ${selectedDuration === option.value ? 'white' : appTheme.secondary.base}
										`"
										@click="selectedDuration = option.value"
									>
										{{ option.label }}
									</button>
								</div>
							</div>

							<div class="mt-8">
								<button
									class="w-full py-3 rounded-md text-white font-medium shadow-sm transition-all duration-200 hover:shadow"
									:style="`background-color: ${appTheme.primary.base}; hover:background-color: ${appTheme.primary.dark}`"
									@click="startInterview"
								>
									开始模拟面试
								</button>
							</div>
						</div>

						<!-- 右侧：历史记录 -->
						<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
							<h2 class="text-xl font-bold mb-6" :style="`color: ${appTheme.secondary.dark}`">历史记录</h2>
							
							<div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
								<div
									v-for="record in historyRecords"
									:key="record.id"
									class="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-all duration-200 cursor-pointer"
									@click="viewHistoryDetail(record)"
								>
									<div class="flex justify-between items-start">
										<div>
											<div class="text-sm font-medium">{{ record.date }}</div>
											<div class="text-xs text-gray-500">时长: {{ record.duration }} | 难度: {{ record.difficulty }}</div>
										</div>
										
									</div>
									<div class="mt-2 flex flex-wrap gap-1">
										<span
											v-for="(topic, index) in record.topics"
											:key="index"
											class="px-2 py-0.5 text-xs rounded-full"
											:style="`background-color: ${appTheme.secondary.light}; color: ${appTheme.secondary.base}`"
										>
											{{ topic }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- 面试进行中页面 -->
			<template v-else>
				<!-- 头部信息栏 -->
				<Header
					:meetingTitle="meetingTitle"
					:meetingId="meetingId"
					:duration="duration"
					:pageTitle="pageTitle"
					@manage="handleManage"
					@end="handleEnd"
					@back="isPreparation = true"
				/>

				<!-- 主要内容区 -->
				<main class="flex-1 flex justify-center p-4 overflow-auto relative">
					<div
						class="w-full bg-white rounded-md overflow-hidden border border-gray-200"
					>
						<VideoPlaceholder
							:participantCount="participantCount"
							hostName="面试官"
							hostTitle="资深工程师"
							hostInitials="MS"
						/>
					</div>
					<!-- 字幕区域 -->
					<div
						class="fixed left-0 right-0 bottom-0 z-50 flex justify-center pointer-events-none"
						style="padding-bottom: 60px;"
					>
						<div
							class="max-w-2xl w-full px-6 py-3 rounded-lg text-white text-xl font-semibold bg-black/60 shadow-lg text-center whitespace-pre-line transition-all duration-200"
							style="backdrop-filter: blur(2px);"
							v-show="subtitleText"
						>
							{{ subtitleText }}
						</div>
					</div>
				</main>

				<!-- 底部控制栏 -->
				<ControlBar
					@toggleMute="handleToggleMute"
					@toggleVideo="handleToggleVideo"
					@toggleShare="handleToggleShare"
					@toggleChat="handleToggleChat"
					@toggleRaiseHand="handleToggleRaiseHand"
					@invite="handleInvite"
					@more="handleMore"
					@end="handleEnd"
				/>
			</template>
		</div>
	</div>

	
</template>

<style scoped>
.vertical-center {
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
