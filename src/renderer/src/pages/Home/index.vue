<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import StepCard from "./components/StepCard.vue";
import ActivityItem from "./components/ActivityItem.vue";
import InterviewReviewItem from "./components/InterviewReviewItem.vue";
import StudyPlanItem from "./components/StudyPlanItem.vue";

defineOptions({
  name: "Home",
});

// 检测操作系统
const isMacOS = ref(false);

// 刷题掌握情况数据
const algorithmSkills = ref([
  { name: "数组", value: 85 },
  { name: "链表", value: 78 },
  { name: "树", value: 65 },
  { name: "动态规划", value: 60 },
  { name: "贪心算法", value: 72 },
  { name: "图论", value: 45 },
  { name: "哈希表", value: 80 },
]);

// 初始化玫瑰图
const initRoseChart = () => {
  const chartDom = document.getElementById("algorithm-skills-chart");
  if (!chartDom) return;

  const myChart = echarts.init(chartDom);

  // 根据容器宽度调整配置
  const containerWidth = chartDom.clientWidth;
  const isSmallContainer = containerWidth < 200;

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}分",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      textStyle: {
        color: "#333",
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
    color: [
      "#91CAFF",
      "#65B0FF",
      "#3993FF",
      "#0076FF",
      "#005DC9",
      "#004BA3",
      "#00387D",
      "#4CDFFF",
    ],
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

onMounted(() => {
  // 检测是否为 macOS
  isMacOS.value = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  // 初始化图表
  setTimeout(initRoseChart, 100);
});

// 用户统计数据
const userStats = ref([
  { label: "学习天数", value: 42 },
  { label: "刷题总数", value: 538 },
  { label: "面试次数", value: 8 },
  { label: "收获Offer", value: 2 },
]);

// 求职三步曲数据
const steps = ref([
  {
    id: 1,
    number: 1,
    title: "刷题训练",
    description: "根据岗位需求定制专属刷题计划",
    icon: "fa-code",
    color: "blue",
    stats: [
      { label: "今日刷题", value: "12/20", progress: 60 },
      { label: "刷题正确率", value: "83%", progress: 83 },
    ],
    buttonText: "开始刷题",
  },
  {
    id: 2,
    number: 2,
    title: "模拟面试",
    description: "AI模拟面试场景，实时反馈",
    icon: "fa-user-tie",
    color: "purple",
    stats: [
      { label: "已完成模拟", value: "8次", progress: 80 },
      { label: "上次模拟评分", value: "85分", progress: 85 },
    ],
    buttonText: "开始模拟面试",
  },
  {
    id: 3,
    number: 3,
    title: "面试复盘",
    description: "录音转文字，智能分析",
    icon: "fa-comments",
    color: "amber",
    stats: [
      { label: "待复盘面试", value: "2场", progress: 40 },
      { label: "面试通过率", value: "62%", progress: 62 },
    ],
    buttonText: "复盘面试",
  },
]);

// 近期活动数据
const activities = ref([
  {
    id: 1,
    title: "完成算法训练 - LeetCode Hot 100",
    time: "2小时前",
    icon: "fa-code",
    color: "blue",
    status: "completed",
  },
  {
    id: 2,
    title: "腾讯前端开发模拟面试",
    time: "昨天 14:30",
    icon: "fa-user-tie",
    color: "purple",
    status: "completed",
  },
  {
    id: 3,
    title: "字节跳动一面录音复盘",
    time: "2023-06-10 10:00",
    icon: "fa-comments",
    color: "amber",
    status: "pending",
  },
  {
    id: 4,
    title: "简历优化 - Java开发工程师",
    time: "2023-06-08 16:20",
    icon: "fa-file-alt",
    color: "green",
    status: "pending",
  },
]);

// 待复盘面试数据
const interviewsToReview = ref([
  {
    id: 1,
    company: "字节跳动",
    position: "前端开发工程师",
    logo: "bytedance.com",
    round: "一轮技术面",
    date: "2023-06-10",
  },
  {
    id: 2,
    company: "阿里巴巴",
    position: "Java后端开发",
    logo: "alibaba.com",
    round: "二轮技术面",
    date: "2023-06-05",
  },
  {
    id: 3,
    company: "网易",
    position: "游戏开发工程师",
    logo: "netease.com",
    round: "一轮技术面",
    date: "2023-06-05",
  },
]);

// 今日学习计划数据
const studyPlans = ref([
  {
    id: 1,
    title: "完成动态规划专题",
    time: "09:00",
    completed: true,
  },
  {
    id: 2,
    title: "模拟面试练习",
    time: "14:00",
    completed: true,
  },
  {
    id: 3,
    title: "复习计算机网络",
    time: "16:00",
    completed: false,
    focus: true,
  },
]);
</script>

<template>
  <div class="bg-blue-50 flex flex-col h-full relative overflow-hidden">
    <!-- 背景光晕效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- 左上角光晕 -->
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-300/30 blur-3xl"
      ></div>
      <!-- 右上角光晕 -->
      <div
        class="absolute -top-10 right-20 w-80 h-80 rounded-full bg-purple-300/20 blur-3xl"
      ></div>
      <!-- 左下角光晕 -->
      <div
        class="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl"
      ></div>
      <!-- 右下角光晕 -->
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl"
      ></div>
    </div>

    <!-- 头部导航 - 高度优化为紧凑型, drag-drop-container -->
    <header
      style="-webkit-app-region: drag"
      class="flex justify-between items-center px-4 py-2 bg-white/50 backdrop-blur-sm shadow-sm relative z-10"
    >
      <div
        :class="[
          'flex items-center gap-1.5 text-base font-bold text-blue-600',
          isMacOS ? 'ml-20' : '',
        ]"
      >
        <div
          class="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center"
        >
          <span class="material-icons" style="font-size: 12px"
            >business_center</span
          >
        </div>
        求职助手
      </div>

      <div class="flex items-center gap-3">
        <button
          class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm"
        >
          <span class="material-icons" style="font-size: 12px"
            >notifications</span
          >
        </button>

        <button
          class="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-500 shadow-sm"
        >
          <span class="material-icons" style="font-size: 12px">settings</span>
        </button>
      </div>
    </header>

    <!-- 主内容区 - 使用类似 home.html 的三列布局 -->
    <main
      class="grid grid-cols-[310px_1fr_260px] gap-4 p-4 flex-1 overflow-auto scrollbar-custom relative z-10"
    >
      <!-- 个人信息卡片 - 占据左侧列的全部高度 -->
      <div
        class="row-span-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl shadow-md p-4 flex flex-col text-white overflow-hidden relative backdrop-blur-sm"
      >
        <!-- 卡片内部光晕效果 -->
        <div
          class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-400/30 blur-xl"
        ></div>
        <div
          class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-indigo-400/20 blur-xl"
        ></div>

        <div class="flex flex-col items-center relative z-10">
          <div
            class="w-24 h-24 rounded-full bg-white border-4 border-blue-400/30 flex items-center justify-center text-blue-500 text-3xl font-bold mb-3"
          >
            张
          </div>
          <h2 class="text-xl font-bold">张同学</h2>
          <p class="text-xs text-blue-100 mb-1">计算机科学与技术 / 大四</p>
          <div class="px-3 py-0.5 bg-white/20 rounded-full text-xs mt-2 mb-5">
            前端开发工程师
          </div>
        </div>

        <div class="bg-white/10 rounded-lg p-3 mb-4">
          <h3 class="text-xs font-medium mb-2">个人数据</h3>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(stat, index) in userStats"
              :key="index"
              class="text-center"
            >
              <div class="text-lg font-bold">{{ stat.value }}</div>
              <div class="text-xs text-blue-100">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- 算法掌握情况玫瑰图 -->
        <div class="bg-white/10 rounded-lg p-3 mb-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-medium">算法掌握情况</h3>
            <span class="text-xs text-blue-100">平均: 69分</span>
          </div>
          <div id="algorithm-skills-chart" class="w-full h-52"></div>
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
            class="flex-1"
          />
        </div>

        <!-- 近期活动 -->
        <div
          class="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md flex flex-col overflow-hidden"
        >
          <div class="px-4 py-2.5 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-800">近期活动</h2>
          </div>

          <div
            class="p-3 flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-custom"
          >
            <ActivityItem
              v-for="activity in activities"
              :key="activity.id"
              :activity="activity"
              class="mb-2 last:mb-0 snap-start"
            />
          </div>
        </div>

        <!-- 求职进度条 - Boss血条风格 -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-3">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <span
                class="material-icons text-purple-500 mr-1"
                style="font-size: 14px"
                >bolt</span
              >
              <h2 class="text-sm font-medium text-gray-700">求职挑战</h2>
            </div>
            <span class="text-xs font-medium text-purple-600">LV.2</span>
          </div>

          <div class="relative">
            <!-- 阶段图标 - 移到上方 -->
            <div
              class="absolute -top-3 left-1/6 transform -translate-x-1/2 border-[0.5px] border-white z-10 rounded-full"
            >
              <div
                class="w-4 h-4 rounded-full bg-blue-500 border border-white flex items-center justify-center"
              >
                <span class="material-icons text-white" style="font-size: 10px"
                  >done</span
                >
              </div>
            </div>
            <div
              class="absolute -top-3 left-1/2 transform -translate-x-1/2 border-[0.5px] border-white z-10 rounded-full"
            >
              <div
                class="w-4 h-4 rounded-full bg-purple-500 border border-white flex items-center justify-center"
              >
                <span class="material-icons text-white" style="font-size: 10px"
                  >bolt</span
                >
              </div>
            </div>
            <div
              class="absolute -top-3 left-5/6 transform -translate-x-1/2 border-[0.5px] border-white z-10 rounded-full"
            >
              <div
                class="w-4 h-4 rounded-full bg-gray-300 border border-white flex items-center justify-center"
              >
                <span class="material-icons text-white" style="font-size: 10px"
                  >lock</span
                >
              </div>
            </div>

            <!-- 进度条背景 - 分段式 -->
            <div
              class="h-3 bg-gray-100 rounded-md overflow-hidden flex border border-gray-200 mt-1"
            >
              <!-- 第一阶段 - 刷题 (已完成) -->
              <div
                class="h-full bg-gradient-to-r from-blue-400 to-blue-500 flex-1 relative"
              >
                <div
                  class="absolute inset-0 bg-white opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgxMHYxMEgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"
                ></div>
              </div>

              <!-- 第二阶段 - 模拟 (进行中) -->
              <div
                class="h-full bg-gradient-to-r from-purple-400 to-purple-500 flex-1 relative"
              >
                <!-- 当前进度覆盖层 -->
                <div
                  class="absolute top-0 right-0 h-full bg-gray-100"
                  style="width: 30%"
                ></div>

                <!-- 斜线纹理 -->
                <div
                  class="absolute inset-0 bg-white opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHBhdGggZD0iTTAgMGgxMHYxMEgweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')]"
                ></div>
              </div>

              <!-- 第三阶段 - 实战 (未开始) -->
              <div class="h-full bg-gray-200 flex-1 relative">
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
          <div class="mt-2 flex justify-between text-[9px] text-gray-500">
            <span>刷题训练</span>
            <span class="text-purple-600 font-medium">模拟面试中</span>
            <span>实战面试</span>
          </div>
        </div>
      </div>

      <!-- 右侧小组件 - 占据右侧列的全部高度 -->
      <div class="flex flex-col gap-4 h-full">
        <!-- 待复盘面试 -->
        <div
          class="bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden flex flex-col"
          style="flex: 0 0 auto"
        >
          <div class="px-4 py-2.5 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-800">待复盘面试</h2>
          </div>

          <div
            class="m-3 mr-1.5 pr-1.5 h-[230px] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-custom"
          >
            <InterviewReviewItem
              v-for="interview in interviewsToReview"
              :key="interview.id"
              :interview="interview"
              class="mb-2 last:mb-0 snap-start"
            />
          </div>
        </div>

        <!-- 今日学习计划 -->
        <div
          class="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md overflow-hidden flex flex-col"
        >
          <div class="px-4 py-2.5 border-b border-gray-100">
            <h2 class="text-base font-semibold text-gray-800">今日学习计划</h2>
          </div>

          <div
            class="p-3 flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-custom"
          >
            <StudyPlanItem
              v-for="plan in studyPlans"
              :key="plan.id"
              :plan="plan"
              class="mb-2 last:mb-0 snap-start"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
