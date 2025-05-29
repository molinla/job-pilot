<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";
import VideoRecorder from "../../components/VideoRecorder.vue";
import { indexedDbService, statisticsService } from "../../services";

defineOptions({
	name: "InterviewRecording",
});

const router = useRouter();
const pageTitle = ref("录制面试");
const videoRecorderRef = ref(null);
const showConfigPanel = ref(true);
const isRecording = ref(false);
const transcriptText = ref(""); // 音频转文字的文本

// 面试配置
const interviewConfig = reactive({
	title: "",
	company: "",
	position: "",
	tags: [""],
	description: "",
});

// 当前面试ID，用于后续保存视频和转录文本
let currentInterviewId = "";

// 添加新标签
const addTag = () => {
	interviewConfig.tags.push("");
};

// 移除标签
const removeTag = (index) => {
	interviewConfig.tags.splice(index, 1);
};

const goBack = () => {
	router.push("/");
};

// 开始面试录制
const startInterview = async () => {
	// 确保至少有标题和公司名称
	if (!interviewConfig.title.trim()) {
		alert("请输入面试标题");
		return;
	}
	if (!interviewConfig.company.trim()) {
		alert("请输入公司名称");
		return;
	}

	// 过滤空标签
	interviewConfig.tags = interviewConfig.tags.filter((tag) => tag.trim());

	try {
		// 保存面试基本信息到IndexedDB
		currentInterviewId = await indexedDbService.saveInterview({
			title: interviewConfig.title,
			company: interviewConfig.company,
			position: interviewConfig.position,
			tags: interviewConfig.tags,
			description: interviewConfig.description,
			duration: "00:00:00", // 初始化为0，录制完成后更新
		});

		console.log("面试记录已保存，ID:", currentInterviewId);

		// 隐藏配置面板，显示录制界面
		showConfigPanel.value = false;
	} catch (error) {
		console.error("保存面试记录失败:", error);
		alert("创建面试失败，请重试");
	}
};

// 保存录制结果
const handleRecorded = async (recordData) => {
	console.log("录制完成:", recordData);
	isRecording.value = false;

	try {
		// 更新面试时长
		const interview =
			await indexedDbService.getInterviewById(currentInterviewId);
		if (interview) {
			// 更新面试时长并保存
			interview.duration = recordData.formattedDuration;
			await indexedDbService.saveInterview(interview);
		}

		// 保存视频到IndexedDB
		await indexedDbService.saveVideo({
			interviewId: currentInterviewId,
			blob: recordData.blob,
		});

		// 如果有转录文本，保存转录
		if (transcriptText.value) {
			await indexedDbService.saveTranscript({
				interviewId: currentInterviewId,
				content: transcriptText.value,
			});
		}

		// 尝试更新服务器端的用户统计数据
		try {
			await statisticsService.updateCurrentUserStatistics({});
			console.log("用户统计数据更新成功");
		} catch (error) {
			console.error("更新用户统计数据失败:", error);
			// 即使 API 调用失败，也不影响本地功能
		}

		// 保存成功后跳转到复盘页面
		router.push("/interview-review");
	} catch (error) {
		console.error("保存录制结果失败:", error);
		alert("保存录制失败，请手动下载视频");
	}
};

// 更新转录文本（模拟讯飞语音识别结果）
const updateTranscript = (text) => {
	transcriptText.value += text;
};

// 录制开始事件
const handleRecordingStarted = () => {
	isRecording.value = true;
	console.log("录制开始");
	transcriptText.value = ""; // 清空上次的转录文本
};

// 录制停止事件
const handleRecordingStopped = () => {
	isRecording.value = false;
	console.log("录制停止");

	// 这里可以模拟语音转文字完成
	// 实际项目中这里会替换为讯飞语音识别API的回调
	setTimeout(() => {
		updateTranscript(
			"这是一段模拟的语音转文字结果，实际项目中会替换为讯飞API的识别结果。",
		);
	}, 1000);
};
</script>

<template>
  <div class="bg-blue-50 flex flex-col h-full relative overflow-auto p-4">
    <!-- 背景光晕效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.status.info}; opacity: 0.2`"
      ></div>
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.status.info}; opacity: 0.2`"
      ></div>
    </div>

    <div class="relative z-10 min-h-full">
      <div class="flex items-center mb-4">
        <button
          class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
          @click="goBack"
          :style="`color: ${appTheme.status.info}`"
        >
          <span class="material-icons" style="font-size: 20px">arrow_back</span>
        </button>
        <h1
          class="text-2xl font-bold"
          :style="`color: ${appTheme.status.info}`"
        >
          {{ pageTitle }}
        </h1>
      </div>
      
      <div v-if="showConfigPanel" class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-6">
        <h2 class="text-xl font-bold mb-6" :style="`color: ${appTheme.status.info}`">面试配置</h2>
        
        <form @submit.prevent="startInterview" class="space-y-5">
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">面试标题 <span class="text-red-500">*</span></label>
              <input 
                v-model="interviewConfig.title" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：前端开发工程师面试"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">公司名称 <span class="text-red-500">*</span></label>
              <input 
                v-model="interviewConfig.company" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：腾讯科技"
                required
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">应聘岗位</label>
              <input 
                v-model="interviewConfig.position" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：高级前端工程师"
              />
            </div>
          </div>
          
          <!-- 标签 -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <label class="block text-sm font-medium text-gray-700">面试标签</label>
              <button 
                type="button" 
                class="text-sm text-blue-600 hover:text-blue-800"
                @click="addTag"
              >
                <span class="material-icons" style="font-size: 18px">add_circle</span>
                添加标签
              </button>
            </div>
            
            <div v-for="(tag, index) in interviewConfig.tags" :key="`tag-${index}`" class="flex items-center space-x-2">
              <input 
                v-model="interviewConfig.tags[index]" 
                type="text" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="例如：React, TypeScript, 算法"
              />
              <button 
                type="button" 
                class="text-red-500 hover:text-red-700"
                @click="removeTag(index)"
                v-if="interviewConfig.tags.length > 1"
              >
                <span class="material-icons" style="font-size: 20px">remove_circle</span>
              </button>
            </div>
          </div>
          
          <!-- 面试描述 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">面试描述</label>
            <textarea 
              v-model="interviewConfig.description" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="描述本次面试的背景、要点等"
            ></textarea>
          </div>
          
          <!-- 提交按钮 -->
          <div class="flex justify-end pt-4">
            <button 
              type="submit" 
              class="px-6 py-2 text-white rounded-lg shadow-sm hover:opacity-90 transition-all"
              :style="`background-color: ${appTheme.status.info}`"
            >
              开始面试录制
            </button>
          </div>
        </form>
      </div>
      
      <!-- 录制界面 -->
      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- 视频录制区 -->
          <div class="md:col-span-2">
            <VideoRecorder
              ref="videoRecorderRef"
              :theme="{
                recordButtonColor: appTheme.status.error,
                stopButtonColor: appTheme.status.info
              }"
              layout="standard"
              @recorded="handleRecorded"
              @started="handleRecordingStarted"
              @stopped="handleRecordingStopped"
              @screenShareStarted="() => console.log('屏幕共享已开始')"
              @screenShareStopped="() => console.log('屏幕共享已停止')"
              @layoutChanged="(layout) => console.log('布局已更改:', layout)"
            />
          </div>
          
          <!-- 语音转文字区域 -->
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="font-medium text-lg mb-3" :style="`color: ${appTheme.status.info}`">转录文本</h3>
            
            <div class="bg-white p-3 rounded-lg border border-gray-200 h-[60vh] overflow-y-auto">
              <p v-if="transcriptText" class="text-gray-800 whitespace-pre-line">{{ transcriptText }}</p>
              <p v-else class="text-gray-400 italic">{{ isRecording ? '正在录制中，文字将在录制结束后显示...' : '录制尚未开始' }}</p>
            </div>
            
            <!-- 录制提示 -->
            <div class="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
              <div class="flex items-center mb-2">
                <span class="material-icons text-red-500 mr-2">sensors</span>
                <span class="text-red-500 font-medium">录制提示</span>
              </div>
              <p class="text-sm text-gray-700">
                您当前正在进行面试录制，可以选择开启摄像头和共享屏幕，系统会记录您的表现和回答。
              </p>
              <p class="text-sm text-gray-700 mt-2">
                录制结束后，语音将自动转为文字并显示在此区域。
              </p>
            </div>
          </div>
        </div>
        
        <!-- 面试信息摘要 -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-4">
          <h3 class="font-medium text-lg mb-2" :style="`color: ${appTheme.status.info}`">面试信息</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500">标题：</span>
              <span class="text-gray-800">{{ interviewConfig.title }}</span>
            </div>
            <div>
              <span class="text-gray-500">公司：</span>
              <span class="text-gray-800">{{ interviewConfig.company }}</span>
            </div>
            <div v-if="interviewConfig.position">
              <span class="text-gray-500">职位：</span>
              <span class="text-gray-800">{{ interviewConfig.position }}</span>
            </div>
            <div v-if="interviewConfig.tags.length">
              <span class="text-gray-500">标签：</span>
              <span class="text-gray-800">{{ interviewConfig.tags.join(', ') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vertical-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 滚动条样式 */
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
