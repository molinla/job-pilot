<script setup>
import { computed } from "vue";

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
});

// 计算背景样式
const bgStyle = computed(() => {
  if (props.plan.focus) {
    return {
      backgroundColor: "rgba(79, 110, 242, 0.05)",
      borderColor: "rgba(79, 110, 242, 0.1)",
    };
  }
  return {
    backgroundColor: "rgba(243, 244, 246, 0.7)",
    borderColor: "rgba(229, 231, 235, 0.8)",
  };
});

// 计算勾选框样式
const checkboxStyle = computed(() => {
  if (props.plan.completed) {
    return {
      backgroundColor: "var(--success-color, #22C55E)",
      borderColor: "var(--success-color, #22C55E)",
    };
  }
  if (props.plan.focus) {
    return {
      borderColor: "var(--primary-color, #4F6EF2)",
      borderWidth: "2px",
    };
  }
  return {
    borderColor: "rgb(209, 213, 219)",
    borderWidth: "2px",
  };
});

// 计算文字样式
const textStyle = computed(() => {
  if (props.plan.completed) {
    return { color: "rgb(156, 163, 175)" };
  }
  return { color: "rgb(55, 65, 81)" };
});

// 计算时间文字样式
const timeStyle = computed(() => {
  if (props.plan.completed) {
    return { color: "rgb(209, 213, 219)" };
  }
  if (props.plan.focus) {
    return { color: "var(--primary-color, #4F6EF2)", fontWeight: "500" };
  }
  return { color: "rgb(156, 163, 175)" };
});
</script>

<template>
  <div
    class="flex items-center p-2.5 rounded-lg border transition-all duration-300 hover:shadow-sm transform hover:-translate-x-1"
    :class="[plan.completed ? 'opacity-90' : '']"
    :style="bgStyle"
  >
    <div
      class="w-5 h-5 rounded-full shrink-0 mr-2.5 flex items-center justify-center shadow-sm transition-all duration-300"
      :style="checkboxStyle"
    >
      <span
        v-if="plan.completed"
        class="material-icons text-white"
        style="font-size: 14px; line-height: 1"
        >check</span
      >
    </div>

    <div class="min-w-0 flex-1">
      <h3 class="text-xs font-medium truncate" :style="textStyle">
        {{ plan.title }}
      </h3>
      <p class="text-[10px]" :style="timeStyle">
        {{ plan.time }}
      </p>
    </div>

    <!-- 如果是焦点学习计划，添加一个强调标记 -->
    <div
      v-if="plan.focus && !plan.completed"
      class="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium shadow-sm"
      :style="{
        backgroundColor: 'rgba(255, 140, 36, 0.1)',
        color: 'var(--accent-color, #FF8C24)',
        borderColor: 'rgba(255, 140, 36, 0.2)',
        border: '1px solid',
      }"
    >
      专注
    </div>
  </div>
</template>
