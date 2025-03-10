<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  interview: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["toggle-expand"]);

const logoUrl = ref(`https://logo.clearbit.com/${props.interview.logo}`);

// 处理图片加载失败
const handleImageError = () => {
  const nameInitial = props.interview.company.charAt(0);
  logoUrl.value = `https://ui-avatars.com/api/?name=${nameInitial}&background=f59e0b&color=fff&size=36`;
};

// 切换展开状态
const toggleExpand = () => {
  emit("toggle-expand", props.interview);
};

// 根据状态计算样式
const statusStyle = computed(() => {
  switch (props.interview.status) {
    case "待复盘":
      return {
        backgroundColor: "rgba(255, 140, 36, 0.1)",
        color: "var(--accent-color, #FF8C24)",
        borderColor: "rgba(255, 140, 36, 0.2)",
      };
    case "已复盘":
      return {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        color: "rgb(34, 197, 94)",
        borderColor: "rgba(34, 197, 94, 0.2)",
      };
    case "需改进":
      return {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        color: "rgb(239, 68, 68)",
        borderColor: "rgba(239, 68, 68, 0.2)",
      };
    default:
      return {
        backgroundColor: "rgba(255, 140, 36, 0.1)",
        color: "var(--accent-color, #FF8C24)",
        borderColor: "rgba(255, 140, 36, 0.2)",
      };
  }
});

// 计算卡片背景样式
const cardStyle = computed(() => {
  switch (props.interview.status) {
    case "待复盘":
      return {
        backgroundColor: "rgba(255, 140, 36, 0.03)",
      };
    case "已复盘":
      return {
        backgroundColor: "rgba(34, 197, 94, 0.03)",
      };
    case "需改进":
      return {
        backgroundColor: "rgba(239, 68, 68, 0.03)",
      };
    default:
      return {
        backgroundColor: "white",
      };
  }
});

// 计算评分颜色
const scoreStyle = computed(() => {
  const score = props.interview.score;
  if (score >= 80) return { color: "rgb(34, 197, 94)" };
  if (score >= 60) return { color: "var(--accent-color, #FF8C24)" };
  return { color: "rgb(239, 68, 68)" };
});

// 计算点的样式
const pointStyle = computed(() => {
  switch (props.interview.status) {
    case "待复盘":
      return { backgroundColor: "var(--accent-color, #FF8C24)" };
    case "已复盘":
      return { backgroundColor: "rgb(34, 197, 94)" };
    case "需改进":
      return { backgroundColor: "rgb(239, 68, 68)" };
    default:
      return { backgroundColor: "var(--accent-color, #FF8C24)" };
  }
});
</script>

<template>
  <div
    class="bg-white rounded-lg overflow-hidden transition-all duration-300 border border-gray-100"
    :style="cardStyle"
  >
    <!-- 卡片头部 - 始终显示 -->
    <div class="p-2.5 flex items-center cursor-pointer" @click="toggleExpand">
      <div
        class="size-8 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-gray-100"
      >
        <img
          :src="logoUrl"
          :alt="interview.company"
          class="h-5 w-5 object-contain"
          @error="handleImageError"
        />
      </div>

      <div class="ml-2 flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-medium text-gray-800 truncate">
            {{ interview.company }}
          </h3>
          <div
            class="px-1.5 py-0.5 rounded-full text-[10px] font-medium border"
            :style="statusStyle"
          >
            {{ interview.status }}
          </div>
        </div>
        <p class="text-[10px] text-gray-500 truncate">
          {{ interview.position }}
        </p>
      </div>

      <!-- 展开/折叠图标 -->
      <span
        class="material-icons text-gray-400 ml-1 transition-transform duration-300"
        :class="{ 'rotate-180': props.interview.expanded }"
        style="font-size: 16px"
      >
        expand_more
      </span>
    </div>

    <!-- 展开内容 -->
    <div
      v-if="props.interview.expanded"
      class="px-3 py-2.5 bg-white/80 border-t border-gray-100"
    >
      <!-- 面试信息 -->
      <div class="flex justify-between items-center mb-3">
        <div class="text-[10px] text-gray-600">
          {{ interview.round }} · {{ interview.date }}
        </div>
        <div class="text-xs font-medium" :style="scoreStyle">
          {{ interview.score }}分
        </div>
      </div>

      <!-- 反馈要点 -->
      <div class="mb-3">
        <h4 class="text-[10px] font-medium text-gray-500 mb-2">反馈要点:</h4>
        <div class="space-y-1.5">
          <div
            v-for="(point, index) in interview.feedback"
            :key="index"
            class="flex items-start"
          >
            <div
              class="w-1.5 h-1.5 rounded-full mt-1 mr-1.5 shrink-0"
              :style="pointStyle"
            ></div>
            <span class="text-[11px] text-gray-700 leading-tight">{{
              point
            }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-1.5 mt-3">
        <button
          class="flex-1 py-1.5 text-white rounded-md text-xs transition flex items-center justify-center shadow-sm hover:shadow transform hover:translate-y-px"
          :style="{ backgroundColor: 'var(--accent-color, #FF8C24)' }"
        >
          <span class="material-icons mr-0.5" style="font-size: 12px"
            >play_arrow</span
          >
          立即复盘
        </button>
        <button
          class="flex-1 py-1.5 rounded-md text-xs transition flex items-center justify-center shadow-sm hover:shadow border transform hover:translate-y-px"
          :style="{
            backgroundColor: 'rgba(79, 110, 242, 0.1)',
            color: 'var(--primary-color, #4F6EF2)',
            borderColor: 'rgba(79, 110, 242, 0.2)',
          }"
        >
          <span class="material-icons mr-0.5" style="font-size: 12px"
            >fitness_center</span
          >
          创建练习
        </button>
      </div>
    </div>
  </div>
</template>
