<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import StepCard from "./components/StepCard.vue";
import ActivityItem from "./components/ActivityItem.vue";
import InterviewReviewItem from "./components/InterviewReviewItem.vue";
import { appTheme } from "../../config/theme";
import {
	statisticsService,
	authService,
	type UserLearningStatistics,
} from "../../services";

defineOptions({
	name: "Home",
});

// 检测操作系统
const isMacOS = ref(false);

// 用户信息
const currentUser = ref(authService.getLocalUser());

// 刷题掌握情况数据
const algorithmSkills = ref([
	{ name: "数组", value: 0 },
	{ name: "链表", value: 0 },
	{ name: "树", value: 0 },
	{ name: "动态规划", value: 0 },
	{ name: "贪心算法", value: 0 },
	{ name: "图论", value: 0 },
	{ name: "哈希表", value: 0 },
]);

// 用户统计数据
const userStats = ref([
	{ label: "学习天数", value: 1 },
	{ label: "刷题总数", value: 0 },
	{ label: "面试次数", value: 0 },
	{ label: "收获Offer", value: 0 },
]);

// 求职三步曲数据 - 统一色彩语义
const steps = ref([
	{
		id: 1,
		number: 1,
		title: "刷题训练",
		description: "根据岗位需求定制专属刷题计划",
		icon: "fa-code",
		color: "primary", // 使用主色调
		stats: [
			{ label: "今日刷题", value: "0", progress: 0 },
			{ label: "刷题正确率", value: "0", progress: 0 },
		],
		buttonText: "开始刷题",
		routePath: "/algorithm-training",
	},
	{
		id: 2,
		number: 2,
		title: "模拟面试",
		description: "AI模拟面试场景，实时反馈",
		icon: "fa-user-tie",
		color: "primary", // 使用主色调
		stats: [
			{ label: "已完成模拟", value: "0场", progress: 0 },
			{ label: "上次模拟评分", value: "0", progress: 0 },
		],
		buttonText: "模拟面试",
		routePath: "/mock-interview",
	},
	{
		id: 3,
		number: 3,
		title: "面试复盘",
		description: "录音转文字，智能分析",
		icon: "fa-comments",
		color: "primary", // 使用主色调
		stats: [
			{ label: "待复盘面试", value: "0", progress: 0 },
			{ label: "面试通过率", value: "0%", progress: 0 },
		],
		buttonText: "录制面试",
		routePath: "/interview-review",
	},
]);

// 近期活动数据类型定义
interface Activity {
	id: number;
	title: string;
	description: string;
	date: string;
	type: string;
	icon: string;
}

// 面试复盘数据类型定义
interface InterviewToReview {
	id: string;
	title: string;
	company: string;
	position: string;
	date: string;
	expanded?: boolean;
}

// 近期活动数据 - 使用统一的颜色系统
const activities = ref<Activity[]>([]);

// 待复盘面试数据
const interviewsToReview = ref<InterviewToReview[]>([]);

// V2EX 新闻数据类型定义
interface V2exNews {
	id: number;
	title: string;
	time: string;
}

// V2EX新闻数据
const v2exNews = ref<V2exNews[]>([]);

// 加载用户学习统计数据
const loadUserLearningStats = async () => {
	try {
		if (!authService.isAuthenticated()) {
			console.log("用户未登录，使用默认数据");
			return;
		}

		const response = await statisticsService.getCurrentUserLearningStatistics();
		if (response.success && response.data) {
			const stats: UserLearningStatistics = response.data;

			// 更新用户统计数据
			userStats.value = [
				{ label: "学习天数", value: stats.activeDays },
				{ label: "刷题总数", value: stats.totalQuestions },
				{ label: "面试次数", value: stats.completedPapers },
				{ label: "收获Offer", value: 0 }, // 这个数据可能需要单独的接口
			];

			// 更新算法技能数据
			if (
				stats.knowledgePointProgress &&
				stats.knowledgePointProgress.length > 0
			) {
				const skillsMap = new Map(
					algorithmSkills.value.map((skill) => [skill.name, skill]),
				);

				for (const progress of stats.knowledgePointProgress) {
					const skill = skillsMap.get(progress.knowledgePoint);
					if (skill) {
						skill.value = Math.round(progress.progress);
					}
				}
			}

			// 更新步骤统计数据
			steps.value[0].stats = [
				{ label: "今日刷题", value: "0", progress: 0 }, // 需要今日数据的接口
				{
					label: "刷题正确率",
					value: `${Math.round(stats.correctRate)}%`,
					progress: stats.correctRate,
				},
			];

			steps.value[1].stats = [
				{
					label: "已完成模拟",
					value: `${stats.completedPapers}场`,
					progress: Math.min(stats.completedPapers * 10, 100),
				},
				{
					label: "平均评分",
					value: `${Math.round(stats.averageScore)}`,
					progress: stats.averageScore,
				},
			];

			// 重新初始化图表以反映新数据
			setTimeout(() => {
				initRoseChart();
				initChallengeChart();
			}, 100);
		}
	} catch (error) {
		console.error("加载用户学习统计失败:", error);
		// 发生错误时使用默认数据，不影响页面显示
	}
};

// 初始化玫瑰图
const initRoseChart = () => {
	const chartDom = document.getElementById("algorithm-skills-chart");
	if (!chartDom) return;

	const myChart = echarts.init(chartDom);

	// 根据容器宽度调整配置
	const containerWidth = chartDom.clientWidth;
	const isSmallContainer = containerWidth < 200;

	// 使用统一的主题色调
	const themeColors = [
		appTheme.primary.light,
		appTheme.primary.medium,
		appTheme.primary.base,
		appTheme.primary.dark,
		appTheme.primary.darker,
		appTheme.secondary.medium,
		appTheme.secondary.base,
		appTheme.secondary.dark,
	];

	const option = {
		backgroundColor: "transparent",
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c}分",
			backgroundColor: "rgba(255, 255, 255, 0.7)",
			textStyle: {
				color: appTheme.neutral[700],
			},
		},
		legend: {
			show: false,
		},
		series: [
			{
				name: "算法掌握度",
				type: "pie",
				radius: ["30%", "65%"],
				center: ["50%", "55%"],
				roseType: "radius",
				itemStyle: {
					borderRadius: 5,
					borderColor: "rgba(255, 255, 255, 0.3)",
					borderWidth: 1,
				},
				label: {
					show: true,
					position: "outside",
					fontSize: isSmallContainer ? 8 : 9,
					color: "#fff",
					formatter: (params) => {
						return `${params.name}\n${params.value}分`;
					},
					overflow: "breakAll",
					width: isSmallContainer ? 50 : 60,
					lineHeight: isSmallContainer ? 10 : 11,
					padding: [2, isSmallContainer ? 2 : 4],
					align: "center",
					distanceToLabelLine: isSmallContainer ? 3 : 5,
				},
				emphasis: {
					label: {
						fontSize: 12,
						fontWeight: "bold",
					},
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: "rgba(0, 0, 0, 0.5)",
					},
				},
				data: algorithmSkills.value.map((item) => ({
					name: item.name,
					value: item.value,
				})),
			},
		],
		color: themeColors,
	};

	myChart.setOption(option);

	// 响应窗口大小变化
	const resizeHandler = () => {
		// 重新获取容器宽度
		const newContainerWidth = chartDom.clientWidth;
		const newIsSmallContainer = newContainerWidth < 200;

		// 更新配置
		const newOption = {
			series: [
				{
					label: {
						fontSize: newIsSmallContainer ? 8 : 9,
						width: newIsSmallContainer ? 50 : 60,
						lineHeight: newIsSmallContainer ? 10 : 11,
						padding: [2, newIsSmallContainer ? 2 : 4],
						distanceToLabelLine: newIsSmallContainer ? 3 : 5,
					},
				},
			],
		};

		myChart.setOption(newOption);
		myChart.resize();
	};

	window.addEventListener("resize", resizeHandler);

	// 组件卸载时移除事件监听
	onUnmounted(() => {
		window.removeEventListener("resize", resizeHandler);
	});
};

// 初始化求职挑战环形进度图
const initChallengeChart = () => {
	const chartDom = document.getElementById("challenge-progress-chart");
	if (!chartDom) return;

	const myChart = echarts.init(chartDom);

	const option = {
		backgroundColor: "transparent",
		tooltip: {
			show: false,
		},
		series: [
			{
				type: "gauge",
				startAngle: 90,
				endAngle: -270,
				radius: "85%",
				center: ["50%", "50%"],
				pointer: {
					show: false,
				},
				progress: {
					show: true,
					overlap: false,
					roundCap: true,
					clip: false,
					itemStyle: {
						borderWidth: 1,
						borderColor: "#fff",
					},
				},
				axisLine: {
					lineStyle: {
						width: 18,
						color: [
							[0.7, appTheme.primary.base],
							[1, appTheme.neutral[200]],
						],
					},
				},
				splitLine: {
					show: false,
				},
				axisTick: {
					show: false,
				},
				axisLabel: {
					show: false,
				},
				title: {
					show: false,
				},
				detail: {
					width: 80,
					height: 80,
					fontSize: 20,
					color: appTheme.primary.base,
					fontWeight: "bold",
					formatter: () => {
						return "{levelStyle|LV.2}";
					},
					rich: {
						levelStyle: {
							fontSize: 32,
							fontWeight: "bold",
							color: appTheme.primary.base,
							padding: [0, 0, 0, 0],
							lineHeight: 40,
						},
					},
					borderColor: "auto",
					borderRadius: 40,
					borderWidth: 0,
					backgroundColor: "transparent",
					offsetCenter: [0, 0],
				},
				data: [
					{
						value: 70,
						name: "经验值",
					},
				],
			},
		],
	};

	myChart.setOption(option);

	// 响应窗口大小变化
	const resizeHandler = () => {
		myChart.resize();
	};

	window.addEventListener("resize", resizeHandler);

	// 组件卸载时移除事件监听
	onUnmounted(() => {
		window.removeEventListener("resize", resizeHandler);
	});
};

onMounted(() => {
	// 检测是否为 macOS
	isMacOS.value = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

	// 加载用户学习统计数据
	loadUserLearningStats();

	// 初始化图表
	setTimeout(() => {
		initRoseChart();
		initChallengeChart();
	}, 100);
});

// 切换面试卡片展开状态
const toggleInterviewExpand = (interview) => {
	interview.expanded = !interview.expanded;
};

const openV2ex = () => {
	window.open("https://v2ex.com", "_blank");
};
</script>

<template>
  <div class="bg-blue-50 flex flex-col h-full relative overflow-hidden">
    <!-- 背景光晕效果 - 统一使用主题色调 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- 左上角光晕 -->
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
      <!-- 右上角光晕 -->
      <div
        class="absolute -top-10 right-20 w-80 h-80 rounded-full bg-opacity-20 blur-3xl"
        :style="`background-color: ${appTheme.secondary.light}`"
      ></div>
      <!-- 左下角光晕 -->
      <div
        class="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-opacity-20 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
      <!-- 右下角光晕 -->
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
    </div>

    <!-- 主内容区 - 使用类似 home.html 的三列布局 -->
    <main
      class="grid grid-cols-[310px_1fr_260px] gap-4 p-4 flex-1 overflow-auto relative z-10"
    >
      <!-- 个人信息卡片 - 占据左侧列的全部高度 -->
      <div
        class="row-span-full rounded-xl shadow-sm p-4 flex flex-col text-white overflow-hidden relative backdrop-blur-sm transform transition-all duration-300 hover:shadow"
        :style="`background-image: linear-gradient(to bottom, ${appTheme.primary.medium}, ${appTheme.primary.dark})`"
      >
        <!-- 卡片内部光晕效果 -->
        <div
          class="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-30 blur-xl"
          :style="`background-color: ${appTheme.primary.light}`"
        ></div>
        <div
          class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-xl"
          :style="`background-color: ${appTheme.secondary.light}`"
        ></div>

        <div class="flex flex-col items-center relative z-10">
          <div
            class="w-24 h-24 rounded-full bg-white border-4 flex items-center justify-center text-3xl font-bold mb-3 shadow-md"
            :style="`border-color: ${appTheme.primary.light}; color: ${appTheme.primary.base}`"
          >
            李
          </div>
          <h2 class="text-xl font-bold">李同学</h2>
          <p class="text-xs mb-1" :style="`color: ${appTheme.primary.light}`">
            计算机科学与技术 / 大四
          </p>
          <div
            class="px-3 py-0.5 bg-white/20 rounded-full text-xs mt-2 mb-5 backdrop-blur-sm shadow-sm"
          >
            前端开发工程师
          </div>
        </div>

        <div
          class="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm border border-white/5 shadow-inner"
        >
          <h3 class="text-xs font-medium mb-2">个人数据</h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(stat, index) in userStats"
              :key="index"
              class="text-center"
            >
              <div class="text-lg font-bold">{{ stat.value }}</div>
              <div class="text-xs" :style="`color: ${appTheme.primary.light}`">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- 算法掌握情况玫瑰图 -->
        <div
          class="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm border border-white/5 shadow-inner"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-medium">算法掌握情况</h3>
            <span class="text-xs" :style="`color: ${appTheme.primary.light}`"
              >平均: 0分</span
            >
          </div>
          <div id="algorithm-skills-chart" class="w-full h-52"></div>
        </div>
        <div class="flex items-center justify-between text-xs mt-auto">
          <!-- 版权所有 -->
          <span class="text-xs" :style="`color: ${appTheme.primary.light}`"
            >© 2025 职捷径</span
          >
          <!-- 版本号 -->
          <span class="text-xs" :style="`color: ${appTheme.primary.light}`"
            >v1.0.0</span
          >
        </div>
      </div>

      <!-- 中间内容区 - 使用自动行布局 -->
      <div class="flex flex-col gap-4">
        <!-- 求职三步曲 -->
        <div class="grid grid-cols-3 gap-4 h-auto">
          <StepCard
            v-for="step in steps"
            :key="step.id"
            :step="step"
            class="flex-1 transform transition-all duration-300 hover:-translate-y-1 hover:shadow"
            :style="{
              '--primary-color': appTheme.primary.base,
              '--hover-color': appTheme.primary.dark,
              '--light-color': appTheme.primary.light,
            }"
          />
        </div>

        <!-- 近期活动 -->
        <div
          class="flex-1 bg-white/95 backdrop-blur-sm rounded-xl flex flex-col overflow-hidden transform transition-all duration-300 hover:shadow-sm"
          style="
            border: 1px solid rgba(240, 240, 240, 1);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          "
        >
          <div
            class="px-4 py-2.5 border-b border-gray-100"
            :style="`border-color: ${appTheme.neutral[200]}`"
          >
            <h2
              class="text-base font-semibold"
              :style="`color: ${appTheme.neutral[800]}`"
            >
              近期活动
            </h2>
          </div>

          <div
            class="p-3 flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
          >
            <ActivityItem
              v-if="activities.length > 0"
              v-for="activity in activities"
              :key="activity.id"
              :activity="activity"
              class="mb-2 last:mb-0 snap-start transform transition-all duration-300 hover:-translate-x-1"
              :style="{
                '--primary-color': appTheme.primary.base,
                '--secondary-color': appTheme.secondary.base,
                '--accent-color': appTheme.accent.base,
              }"
            />
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-gray-500">暂无活动</p>
            </div>
          </div>
        </div>

        <!-- 求职进度条 - Boss血条风格 -->
        <div
          class="bg-white/95 backdrop-blur-sm rounded-xl p-3 transform transition-all duration-300 hover:shadow-sm"
          style="
            border: 1px solid rgba(240, 240, 240, 1);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          "
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <span
                class="material-icons mr-1"
                style="font-size: 14px"
                :style="`color: ${appTheme.primary.base}`"
                >bolt</span
              >
              <h2
                class="text-sm font-medium"
                :style="`color: ${appTheme.neutral[700]}`"
              >
                求职挑战
              </h2>
            </div>
            <span
              class="text-xs font-medium"
              :style="`color: ${appTheme.primary.base}`"
              >LV.2</span
            >
          </div>

          <div class="relative">
            <!-- 阶段图标 - 移到上方 -->
            <div
              class="absolute -top-3 left-1/6 transform -translate-x-1/2 border-[0.5px] border-white z-10 rounded-full shadow-sm"
            >
              <div
                class="w-4 h-4 rounded-full border border-white flex items-center justify-center"
                :style="`background-color: ${appTheme.primary.base}`"
              >
                <span class="material-icons text-white" style="font-size: 10px"
                  >done</span
                >
              </div>
            </div>
            <div
              class="absolute -top-3 left-1/2 transform -translate-x-1/2 border-[0.5px] border-white z-10 rounded-full shadow-sm"
            >
              <div
                class="w-4 h-4 rounded-full border border-white flex items-center justify-center"
                :style="`background-color: ${appTheme.secondary.base}`"
              >
                <span class="material-icons text-white" style="font-size: 10px"
                  >bolt</span
                >
              </div>
            </div>
            <div
              class="absolute -top-3 left-5/6 transform -translate-x-1/2 border-[0.5px] border-white z-10 rounded-full shadow-sm"
            >
              <div
                class="w-4 h-4 rounded-full border border-white flex items-center justify-center"
                :style="`background-color: ${appTheme.neutral[300]}`"
              >
                <span class="material-icons text-white" style="font-size: 10px"
                  >lock</span
                >
              </div>
            </div>

            <!-- 进度条背景 - 分段式 -->
            <div
              class="h-3 rounded-md overflow-hidden flex border mt-1 shadow-inner"
              :style="`background-color: ${appTheme.neutral[100]}; border-color: ${appTheme.neutral[200]}`"
            >
              <!-- 第一阶段 - 刷题 (已完成) -->
              <div
                class="h-full flex-1 relative"
                :style="`background-image: linear-gradient(to right, ${appTheme.primary.light}, ${appTheme.primary.base})`"
              >
                <div
                  class="absolute inset-0 bg-white opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgxMHYxMEgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"
                ></div>
              </div>

              <!-- 第二阶段 - 模拟 (进行中) -->
              <div
                class="h-full flex-1 relative"
                :style="`background-image: linear-gradient(to right, ${appTheme.secondary.light}, ${appTheme.secondary.base})`"
              >
                <!-- 当前进度覆盖层 -->
                <div
                  class="absolute top-0 right-0 h-full"
                  :style="`width: 30%; background-color: ${appTheme.neutral[100]}`"
                ></div>

                <!-- 斜线纹理 -->
                <div
                  class="absolute inset-0 bg-white opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgxMHYxMEgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"
                ></div>
              </div>

              <!-- 第三阶段 - 实战 (未开始) -->
              <div
                class="h-full flex-1 relative"
                :style="`background-color: ${appTheme.neutral[200]}`"
              >
                <div
                  class="absolute inset-0 bg-white opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgxMHYxMEgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"
                ></div>
              </div>
            </div>

            <!-- 阶段分隔线 -->
            <div class="absolute top-0 left-1/3 h-full w-0.5 bg-white"></div>
            <div class="absolute top-0 left-2/3 h-full w-0.5 bg-white"></div>
          </div>

          <!-- 进度说明 -->
          <div
            class="mt-2 flex justify-between text-[9px]"
            :style="`color: ${appTheme.neutral[500]}`"
          >
            <span>刷题训练</span>
            <span :style="`color: ${appTheme.secondary.base}; font-weight: 500`"
              >模拟面试中</span
            >
            <span>实战面试</span>
          </div>
        </div>
      </div>

      <!-- 右侧小组件 - 占据右侧列的全部高度 -->
      <div class="flex flex-col gap-4 h-full overflow-hidden">
        <!-- 待复盘面试 -->
        <div
          class="bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-sm"
          style="
            flex: 0 0 auto;
            border: 1px solid rgba(240, 240, 240, 1);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          "
        >
          <div
            class="px-4 py-2.5 border-b"
            :style="`border-color: ${appTheme.neutral[200]}`"
          >
            <h2
              class="text-base font-semibold"
              :style="`color: ${appTheme.neutral[800]}`"
            >
              待复盘面试
            </h2>
          </div>

          <div
            class="m-3 mr-1.5 pr-1.5 h-[230px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory"
          >
            <InterviewReviewItem
              v-if="interviewsToReview.length > 0"
              v-for="interview in interviewsToReview"
              :key="interview.id"
              :interview="interview"
              class="mb-2 last:mb-0 snap-start transform transition-all duration-300"
              :style="{
                '--primary-color': appTheme.primary.base,
                '--secondary-color': appTheme.secondary.base,
                '--accent-color': appTheme.accent.base,
              }"
              @toggle-expand="toggleInterviewExpand"
            />
            <div v-else class="flex items-center justify-center h-full">
              <p class="text-gray-500">暂无待复盘面试</p>
            </div>
          </div>
        </div>

        <!-- V2EX 新闻小组件 -->
        <div
          class="flex flex-col w-full bg-gray-200 rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-sm"
          style="
            border: 1px solid rgba(235, 235, 235, 1);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          "
        >
          <!-- 小组件头部 -->
          <div class="px-2.5 py-1.5 flex items-center justify-between">
            <!-- 左侧：头像和名称 -->
            <div class="flex items-center">
              <div
                class="w-6 h-6 bg-black rounded-full flex items-center justify-center"
              >
                <span class="text-white text-[10px] font-bold">V2EX</span>
              </div>
              <div class="ml-1.5">
                <div class="text-sm font-bold text-gray-800 leading-tight">
                  V2EX
                </div>
                <div class="text-[10px] text-gray-600 leading-tight">
                  02-19
                </div>
              </div>
            </div>

            <!-- 右侧：标签 -->
            <div
              class="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]"
            >
              
            </div>
          </div>

          <!-- 新闻列表容器 -->
          <div
            class="bg-white h-full rounded-lg mx-2 mb-1.5 overflow-auto"
            style="
              border: 1px solid rgba(245, 245, 245, 1);
              box-shadow: 0 1px 1px rgba(0, 0, 0, 0.02);
            "
          >
            <!-- 新闻列表 -->
            <div class="divide-y h-full divide-gray-100 overflow-y-auto">
              <div
                v-for="news in v2exNews"
                :key="news.id"
                class="px-2.5 py-1.5 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                @click="openV2ex"
              >
                <div
                  class="text-xs font-medium text-gray-900 leading-tight line-clamp-1"
                >
                  {{ news.title }}
                </div>
                <div class="text-[10px] text-gray-400 mt-0.5">
                  {{ news.time }}
                </div>
              </div>
            </div>
          </div>

          <!-- 小组件控制按钮 -->
          <div class="flex justify-end px-2.5 pb-1.5">
            <div class="flex space-x-2">
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
