<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";
import VideoRecorder from "../../components/VideoRecorder.vue";
import { indexedDbService, statisticsService } from "../../services";

// 导入Interview类型
interface Interview {
	id: string;
	title: string;
	company: string;
	position: string;
	tags: string[];
	description: string;
	date: string;
	duration: string;
	status: string;
}

defineOptions({
	name: "InterviewReview",
});

const router = useRouter();
const pageTitle = ref("面试复盘");
const videoRecorderRef = ref(null);
const currentLayout = ref("standard");
const isLoading = ref(true);
const selectedRecordId = ref<string | null>(null);
const selectedRecordVideo = ref<string | null>(null);
const selectedRecordTranscript = ref<string | null>(null);

// 面试复盘列表
const interviewRecords = ref<Interview[]>([]);

// 加载所有面试记录
const loadInterviewRecords = async () => {
	isLoading.value = true;

	try {
		// 从IndexedDB加载面试记录
		const records = await indexedDbService.getAllInterviews();
		interviewRecords.value = records.sort((a, b) => {
			// 按日期倒序排列，最新的排在前面
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});

		console.log(`成功加载 ${records.length} 条面试记录`);
	} catch (error) {
		console.error("加载面试记录失败:", error);
	} finally {
		isLoading.value = false;
	}
};

const goBack = () => {
	router.push("/");
};

// 进入录制面试页面
const goToRecording = () => {
	router.push("/interview-recording");
};

// 查看面试记录详情
const viewRecordDetail = async (record) => {
	try {
		console.log("查看面试记录详情:", record);
		selectedRecordId.value = record.id;

		// 加载视频
		const videoRecord = await indexedDbService.getVideoByInterviewId(record.id);
		if (videoRecord) {
			// 创建视频URL
			selectedRecordVideo.value = URL.createObjectURL(videoRecord.blob);
			console.log("视频已加载");
		} else {
			selectedRecordVideo.value = null;
			console.log("未找到视频记录");
		}

		// 加载转录文本
		const transcript = await indexedDbService.getTranscriptByInterviewId(
			record.id,
		);
		if (transcript) {
			selectedRecordTranscript.value = transcript.content;
			console.log("转录文本已加载");
		} else {
			selectedRecordTranscript.value = null;
			console.log("未找到转录记录");
		}
	} catch (error) {
		console.error("加载面试详情失败:", error);
	}
};

// 删除面试记录
const deleteRecord = async (record, event) => {
	// 阻止事件冒泡，避免触发viewRecordDetail
	event.stopPropagation();

	if (confirm(`确定要删除"${record.title}"吗？此操作不可恢复。`)) {
		try {
			await indexedDbService.deleteInterview(record.id);

			// 如果正在查看的是被删除的记录，清空选中状态
			if (selectedRecordId.value === record.id) {
				selectedRecordId.value = null;
				selectedRecordVideo.value = null;
				selectedRecordTranscript.value = null;
			}

			// 重新加载列表
			await loadInterviewRecords();
			console.log("记录已删除");
		} catch (error) {
			console.error("删除记录失败:", error);
			alert("删除失败，请重试");
		}
	}
};

// 处理录制完成事件
const handleRecorded = async (recordData) => {
	console.log("新录制完成:", recordData);

	try {
		// 保存新面试记录
		const newInterview = {
			title: `面试录制 ${new Date().toLocaleDateString()}`,
			company: "直接录制",
			position: "",
			tags: ["新录制"],
			description: "",
			duration: recordData.formattedDuration,
		};

		// 使用JSON序列化和反序列化确保数据可以被IndexedDB正确存储
		const interviewData = JSON.parse(JSON.stringify(newInterview));
		const interviewId = await indexedDbService.saveInterview(interviewData);

		// 保存视频
		await indexedDbService.saveVideo({
			interviewId,
			blob: recordData.blob,
		});

		// 尝试更新服务器端的用户统计数据
		try {
			await statisticsService.updateCurrentUserStatistics({});
			console.log("用户统计数据更新成功");
		} catch (error) {
			console.error("更新用户统计数据失败:", error);
			// 即使 API 调用失败，也不影响本地功能
		}

		// 重新加载列表
		await loadInterviewRecords();

		// 自动选中新录制的面试
		const newRecord = interviewRecords.value.find(
			(record) => record.id === interviewId,
		);
		if (newRecord) {
			viewRecordDetail(newRecord);
		}
	} catch (error) {
		console.error("保存新录制失败:", error);
		alert("保存录制失败");
	}
};

// 处理布局变更
const handleLayoutChange = (layout) => {
	currentLayout.value = layout;
	console.log("布局改变为:", layout);
};

// 下载视频
const downloadVideo = () => {
	if (!selectedRecordVideo.value) return;

	// 创建一个下载链接
	const a = document.createElement("a");
	a.href = selectedRecordVideo.value;
	a.download = `面试视频_${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
};

// 页面加载时获取面试记录
onMounted(() => {
	loadInterviewRecords();
});
</script>

<template>
	<div class="bg-blue-50 flex flex-col h-full relative overflow-auto p-4">
		<!-- 背景光晕效果 -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div
				class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
				:style="`background-color: ${appTheme.accent.base}; opacity: 0.2`"
			></div>
			<div
				class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
				:style="`background-color: ${appTheme.accent.base}; opacity: 0.2`"
			></div>
		</div>

		<div class="relative z-10 min-h-full">
			<div class="flex items-center mb-4">
				<button
					class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
					@click="goBack"
					:style="`color: ${appTheme.accent.dark}`"
				>
					<span class="material-icons" style="font-size: 20px">arrow_back</span>
				</button>
				<h1
					class="text-2xl font-bold"
					:style="`color: ${appTheme.accent.dark}`"
				>
					{{ pageTitle }}
				</h1>
			</div>
			
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<!-- 面试记录列表 -->
				<div class="lg:col-span-1">
					<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-4 flex flex-col h-full">
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-xl font-bold" :style="`color: ${appTheme.accent.dark}`">面试记录</h2>
							<button
								class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm flex items-center"
								@click="goToRecording"
							>
								<span class="material-icons mr-1" style="font-size: 16px">add</span>
								新建面试
							</button>
						</div>
						
						<!-- 加载状态 -->
						<div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center p-6">
							<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
							<p class="text-gray-500">正在加载面试记录...</p>
						</div>
						
						<!-- 没有记录 -->
						<div v-else-if="interviewRecords.length === 0" class="flex-1 flex flex-col items-center justify-center p-6 text-center">
							<span class="material-icons text-gray-400 text-5xl mb-3">video_library</span>
							<p class="text-gray-500 mb-3">暂无面试记录</p>
							<button
								class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center"
								@click="goToRecording"
							>
								<span class="material-icons mr-1" style="font-size: 18px">add</span>
								新建面试
							</button>
						</div>
						
						<!-- 记录列表 -->
						<div v-else class="flex-1 overflow-y-auto pr-1 space-y-3">
							<div 
								v-for="record in interviewRecords" 
								:key="record.id"
								class="p-3 rounded-lg border transition-all cursor-pointer relative group"
								:class="selectedRecordId === record.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-200'"
								@click="viewRecordDetail(record)"
							>
								<div class="flex justify-between items-start">
									<h3 class="font-medium text-gray-800 line-clamp-1">{{ record.title }}</h3>
									<button 
										class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
										@click="deleteRecord(record, $event)"
										title="删除记录"
									>
										<span class="material-icons" style="font-size: 18px">delete</span>
									</button>
								</div>
								
								<div class="flex justify-between mt-1 text-xs text-gray-500">
									<span>{{ record.company }}</span>
									<span>{{ new Date(record.date).toLocaleDateString() }}</span>
								</div>
								
								<div class="flex justify-between mt-2">
									<div class="flex flex-wrap gap-1">
										<span 
											v-for="(tag, tagIndex) in record.tags" 
											:key="`tag-${record.id}-${tagIndex}`"
											class="px-1.5 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600"
										>
											{{ tag }}
										</span>
									</div>
									<span class="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
										{{ record.duration }}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- 详情和新录制区域 -->
				<div class="lg:col-span-2 space-y-6">
					<!-- 视频预览区域 -->
					<div v-if="selectedRecordId" class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-4">
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-xl font-bold" :style="`color: ${appTheme.accent.dark}`">面试回放</h2>
							<button
								v-if="selectedRecordVideo"
								class="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-sm flex items-center"
								@click="downloadVideo"
							>
								<span class="material-icons mr-1" style="font-size: 16px">download</span>
								下载视频
							</button>
						</div>
						
						<div v-if="selectedRecordVideo" class="video-container mb-4">
							<video 
								controls 
								class="w-full rounded-lg border border-gray-200" 
								:src="selectedRecordVideo"
							></video>
						</div>
						
						<div v-else class="flex items-center justify-center h-48 bg-gray-100 rounded-lg mb-4">
							<p class="text-gray-500">未找到视频记录</p>
						</div>
						
						<!-- 转录文本 -->
						<div v-if="selectedRecordTranscript" class="transcript-section mt-4">
							<h3 class="font-medium text-gray-700 mb-2">转录文本</h3>
							<div class="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
								<p class="text-gray-800 whitespace-pre-line">{{ selectedRecordTranscript }}</p>
							</div>
						</div>
					</div>
					
					<!-- 实时录制区域 -->
					<div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-4 flex flex-col">
						<h2 class="text-xl font-bold mb-4" :style="`color: ${appTheme.accent.dark}`">实时录制</h2>
						
						<!-- 使用增强的VideoRecorder组件 -->
						<VideoRecorder
							ref="videoRecorderRef"
							:layout="currentLayout"
							:theme="{
								recordButtonColor: appTheme.status.error,
								stopButtonColor: appTheme.status.info
							}"
							@recorded="handleRecorded"
							@layoutChanged="handleLayoutChange"
							@screenShareStarted="() => console.log('屏幕共享已开始')"
							@screenShareStopped="() => console.log('屏幕共享已停止')"
						/>
						
			
						
						<!-- 提示信息 -->
						<div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm">
							<p class="text-blue-800">
								<span class="material-icons text-blue-500 align-bottom mr-1" style="font-size: 16px">info</span>
								您可以随时在此进行新的录制，录制完成后会自动保存到面试列表中。
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* 自定义滚动条 */
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
</style>
