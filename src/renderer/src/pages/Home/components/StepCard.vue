<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  step: {
    type: Object,
    required: true,
  },
});

// 使用CSS变量处理颜色，这样可以从父组件传入主题色
const colorStyles = computed(() => {
  switch (props.step.color) {
    case "primary":
      return {
        background:
          "linear-gradient(to bottom right, var(--primary-color), var(--hover-color))",
      };
    case "secondary":
      return {
        background:
          "linear-gradient(to bottom right, var(--secondary-color, #8662F2), var(--secondary-dark-color, #6344D2))",
      };
    case "accent":
      return {
        background:
          "linear-gradient(to bottom right, var(--accent-color, #FF8C24), var(--accent-dark-color, #E67011))",
      };
    default:
      return {
        background:
          "linear-gradient(to bottom right, var(--primary-color), var(--hover-color))",
      };
  }
});

// 按钮样式也使用CSS变量
const buttonStyles = computed(() => {
  switch (props.step.color) {
    case "primary":
      return {
        color: "var(--primary-color)",
      };
    case "secondary":
      return {
        color: "var(--secondary-color, #8662F2)",
      };
    case "accent":
      return {
        color: "var(--accent-color, #FF8C24)",
      };
    default:
      return {
        color: "var(--primary-color)",
      };
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

// 处理按钮点击，导航到对应路由
const handleButtonClick = () => {
  if (props.step.routePath) {
    router.push(props.step.routePath);
  }
};
</script>

<template>
  <div
    class="rounded-xl shadow-md p-3 text-white flex flex-col relative backdrop-blur-sm border border-white/10 transition-all duration-300 hover:shadow-lg"
    :style="colorStyles"
  >
    <!-- 背景渐变光效 -->
    <div
      class="absolute top-0 right-0 w-full h-full overflow-hidden rounded-xl opacity-30"
    >
      <div
        class="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-white/30 blur-md"
      ></div>
    </div>

    <div
      class="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shadow-inner border border-white/10 z-10"
    >
      {{ step.number }}
    </div>

    <div class="text-xl mb-2 relative z-10">
      <span class="material-icons">{{ iconMap }}</span>
    </div>

    <h3 class="text-base font-bold mb-0.5 relative z-10">{{ step.title }}</h3>
    <p class="text-xs text-white/80 mb-3 line-clamp-1 relative z-10">
      {{ step.description }}
    </p>

    <div
      v-for="(stat, index) in step.stats"
      :key="index"
      class="bg-white/10 rounded-lg p-2 mb-1.5 backdrop-blur-sm border border-white/5 shadow-inner relative z-10"
    >
      <div class="flex justify-between text-xs mb-1">
        <span>{{ stat.label }}</span>
        <span class="font-medium">{{ stat.value }}</span>
      </div>
      <div class="h-1.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{
            width: `${stat.progress}%`,
            background: 'rgba(255, 255, 255, 0.9)',
          }"
        ></div>
      </div>
    </div>

    <button
      class="cursor-pointer mt-auto py-1.5 rounded-lg font-medium text-xs bg-white hover:bg-white/90 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg relative z-10"
      :style="buttonStyles"
      @click="handleButtonClick"
    >
      {{ step.buttonText }}
    </button>
  </div>
</template>
