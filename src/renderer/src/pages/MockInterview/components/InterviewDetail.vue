<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { appTheme } from "../../../config/theme";

// 定义面试详情类型接口
interface InterviewQuestion {
	id: number;
	question: string;
	answer: string;
}

interface InterviewRecord {
	id: number;
	date: string;
	duration: string;
	difficulty: string;
	score: number;
	topics: string[];
	questions?: InterviewQuestion[];
	strengths?: string[];
	weaknesses?: string[];
}

const router = useRouter();
const route = useRoute();
const recordId = ref(Number(route.params.id));
const interviewDetail = ref<InterviewRecord | null>(null);
const loading = ref(true); // 添加加载状态

// 历史记录存储键名
const historyKey = "mockInterviewHistory";

// 加载面试记录
onMounted(() => {
	// 设置随机延时 3-10 秒
	const delay = Math.floor(Math.random() * 7000) + 3000; // 3000ms - 10000ms

	setTimeout(() => {
		loadInterviewDetail();
		loading.value = false;
	}, delay);
});

// 加载详情数据
function loadInterviewDetail() {
	try {
		const historyData = localStorage.getItem(historyKey);
		if (historyData) {
			const records = JSON.parse(historyData) as InterviewRecord[];
			const detail = records.find((record) => record.id === recordId.value);
			if (detail) {
				// 如果找到记录，添加模拟数据
				interviewDetail.value = {
					...detail,
					questions: [
						{
							id: 1,
							question: "请你做一个自我介绍",
							answer: "额面试官你好，我叫你嘉宝",
						},
						{
							id: 2,
							question: "请你说一下页面访问到渲染浏览器都执行了什么操作",
							answer: "额浏览器访问页面有网络请求，然后就解析页面",
						},
					],
					strengths: ["基础概念认知", "简洁表达能力"],
					weaknesses: ["技术深度不足", "沟通能力与自信心", "结构化思维欠缺"],
				};
			}
		}
	} catch (error) {
		console.error("加载面试详情失败:", error);
	}
}

// 返回上一页
const goBack = () => {
	router.back();
};
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
      <!-- 头部 -->
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
            面试详情
          </h1>
        </div>
      </div>

      <!-- 加载状态 -->
      <div class="flex-1 flex flex-col items-center justify-center" v-if="loading">
        <div class="loading-spinner mb-4" :style="`border-top-color: ${appTheme.primary.base}`"></div>
        <p class="text-gray-600 text-lg">内容正在处理中...</p>
      </div>

      <!-- 主要内容区 -->
      <div class="flex-1 p-4 overflow-auto" v-else-if="interviewDetail">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <!-- 面试基本信息 -->
          <div class="flex flex-wrap justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-bold" :style="`color: ${appTheme.secondary.dark}`">
                前端开发模拟面试
              </h2>
              <p class="text-gray-600 mt-1">{{ interviewDetail.date }}</p>
            </div>
            
            <div class="flex flex-wrap gap-2 mt-2">
              <span
                class="px-3 py-1 text-sm rounded-full"
                :style="`background-color: ${appTheme.secondary.light}; color: ${appTheme.secondary.base}`"
              >
                时长: {{ interviewDetail.duration }}
              </span>
              <span
                class="px-3 py-1 text-sm rounded-full"
                :style="`background-color: ${appTheme.secondary.light}; color: ${appTheme.secondary.base}`"
              >
                难度: {{ interviewDetail.difficulty }}
              </span>
              <span
                class="px-3 py-1 text-sm rounded-full"
                :style="`background-color: ${appTheme.primary.light}; color: ${appTheme.primary.base}`"
              >
                得分: {{ interviewDetail.score }}
              </span>
            </div>
          </div>
          
          <!-- 主题标签 -->
          <div class="mb-6">
            <h3 class="text-sm font-medium text-gray-700 mb-2">面试主题</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(topic, index) in interviewDetail.topics"
                :key="index"
                class="px-3 py-1 text-sm rounded-full"
                :style="`background-color: ${appTheme.primary.light}; color: ${appTheme.primary.base}`"
              >
                {{ topic }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 面试题目 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 class="text-lg font-bold mb-4" :style="`color: ${appTheme.secondary.dark}`">面试题目</h3>
          
          <div class="space-y-4">
            <div 
              v-for="question in interviewDetail.questions" 
              :key="question.id"
              class="p-4 rounded-lg border border-gray-100"
            >
              <div class="font-medium mb-2" :style="`color: ${appTheme.secondary.base}`">
                问题 {{ question.id }}: {{ question.question }}
              </div>
              <div class="text-gray-700 text-sm pl-4 border-l-2" :style="`border-color: ${appTheme.secondary.light}`">
                {{ question.answer }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 优势与劣势 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- 优势 -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold mb-4" :style="`color: ${appTheme.primary.base}`">优势</h3>
            
            <ul class="space-y-2">
              <li 
                v-for="(strength, index) in interviewDetail.strengths" 
                :key="index"
                class="flex items-start"
              >
                <span class="material-icons mr-2 text-green-500">check_circle</span>
                <span>{{ strength }}</span>
              </li>
            </ul>
          </div>
          
          <!-- 劣势 -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-bold mb-4" :style="`color: ${appTheme.secondary.base}`">待改进</h3>
            
            <ul class="space-y-2">
              <li 
                v-for="(weakness, index) in interviewDetail.weaknesses" 
                :key="index"
                class="flex items-start"
              >
                <span class="material-icons mr-2 text-orange-500">info</span>
                <span>{{ weakness }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- 未找到记录 -->
      <div class="flex-1 flex items-center justify-center" v-else>
        <p class="text-gray-500">{{ recordId ? '未找到面试记录' : '未找到面试记录' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.material-icons {
  font-size: 18px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 