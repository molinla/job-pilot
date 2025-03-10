<script setup>
import { computed } from "vue";

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
});

// 使用 CSS 变量处理颜色
const iconStyles = computed(() => {
  switch (props.activity.color) {
    case "primary":
      return {
        backgroundColor: "var(--primary-color)",
      };
    case "secondary":
      return {
        backgroundColor: "var(--secondary-color, #8662F2)",
      };
    case "accent":
      return {
        backgroundColor: "var(--accent-color, #FF8C24)",
      };
    default:
      return {
        backgroundColor: "var(--primary-color)",
      };
  }
});

const statusStyles = computed(() => {
  return props.activity.status === "completed"
    ? {
        backgroundColor: "rgba(34, 197, 94, 0.1)", // status.success 的浅色版本
        color: "rgb(34, 197, 94)", // status.success
      }
    : {
        backgroundColor: "rgba(255, 140, 36, 0.1)", // accent 的浅色版本
        color: "var(--accent-color, #FF8C24)", // accent
      };
});

const statusText = computed(() => {
  return props.activity.status === "completed" ? "已完成" : "待处理";
});

// 将 Font Awesome 图标名称映射到 Material Icons 名称
const iconMap = computed(() => {
  switch (props.activity.icon) {
    case "fa-code":
      return "code";
    case "fa-user-tie":
      return "person";
    case "fa-comments":
      return "forum";
    case "fa-file-alt":
      return "description";
    default:
      return "code";
  }
});
</script>

<template>
  <div
    class="flex items-center p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 transition-all duration-300"
  >
    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
      :style="iconStyles"
    >
      <span class="material-icons" style="font-size: 16px">{{ iconMap }}</span>
    </div>

    <div class="ml-2.5 min-w-0 flex-1">
      <h3 class="text-xs font-medium text-gray-800 truncate">
        {{ activity.title }}
      </h3>
      <p class="text-[10px] text-gray-500">{{ activity.time }}</p>
    </div>

    <div
      class="px-1.5 py-0.5 text-[10px] rounded-full shrink-0 font-medium border"
      :style="[statusStyles, { borderColor: statusStyles.backgroundColor }]"
    >
      {{ statusText }}
    </div>
  </div>
</template>
