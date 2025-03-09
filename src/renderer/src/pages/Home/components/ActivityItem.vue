<script setup>
import { computed } from "vue";

const props = defineProps({
  activity: {
    type: Object,
    required: true,
  },
});

const colorClasses = computed(() => {
  switch (props.activity.color) {
    case "blue":
      return "bg-blue-500";
    case "purple":
      return "bg-purple-500";
    case "amber":
      return "bg-amber-500";
    case "green":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
});

const statusClasses = computed(() => {
  return props.activity.status === "completed"
    ? "bg-green-100 text-green-600"
    : "bg-amber-100 text-amber-600";
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
  <div class="flex items-center p-2.5 bg-gray-50 rounded-lg">
    <div
      :class="[
        'w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0',
        colorClasses,
      ]"
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
      :class="[
        'px-1.5 py-0.5 text-[10px] rounded-full shrink-0',
        statusClasses,
      ]"
    >
      {{ statusText }}
    </div>
  </div>
</template>
