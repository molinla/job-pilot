<script setup>
import { computed } from "vue";

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
});

const colorClasses = computed(() => {
  switch (props.step.color) {
    case "blue":
      return "bg-gradient-to-br from-blue-500 to-blue-700";
    case "purple":
      return "bg-gradient-to-br from-purple-500 to-purple-700";
    case "amber":
      return "bg-gradient-to-br from-amber-500 to-amber-700";
    default:
      return "bg-gradient-to-br from-blue-500 to-blue-700";
  }
});

const buttonClasses = computed(() => {
  switch (props.step.color) {
    case "blue":
      return "bg-white text-blue-600 hover:bg-white/90";
    case "purple":
      return "bg-white text-purple-600 hover:bg-white/90";
    case "amber":
      return "bg-white text-amber-600 hover:bg-white/90";
    default:
      return "bg-white text-blue-600 hover:bg-white/90";
  }
});

// 将 Font Awesome 图标名称映射到 Material Icons 名称
const iconMap = computed(() => {
  switch (props.step.icon) {
    case "fa-code":
      return "code";
    case "fa-user-tie":
      return "person";
    case "fa-comments":
      return "forum";
    case "fa-file-alt":
      return "description";
    case "fa-briefcase":
      return "business_center";
    default:
      return "code";
  }
});
</script>

<template>
  <div
    :class="[
      'rounded-xl shadow-md p-3 text-white flex flex-col relative',
      colorClasses,
    ]"
  >
    <div
      class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs"
    >
      {{ step.number }}
    </div>

    <div class="text-xl mb-2">
      <span class="material-icons">{{ iconMap }}</span>
    </div>

    <h3 class="text-base font-bold mb-0.5">{{ step.title }}</h3>
    <p class="text-xs text-white/80 mb-3 line-clamp-1">
      {{ step.description }}
    </p>

    <div
      v-for="(stat, index) in step.stats"
      :key="index"
      class="bg-white/10 rounded-lg p-2 mb-1.5"
    >
      <div class="flex justify-between text-xs mb-1">
        <span>{{ stat.label }}</span>
        <span>{{ stat.value }}</span>
      </div>
      <div class="h-1 bg-white/20 rounded-full overflow-hidden">
        <div
          class="h-full bg-white"
          :style="{ width: `${stat.progress}%` }"
        ></div>
      </div>
    </div>

    <button
      :class="['mt-auto py-1.5 rounded-lg font-medium text-xs', buttonClasses]"
    >
      {{ step.buttonText }}
    </button>
  </div>
</template>
