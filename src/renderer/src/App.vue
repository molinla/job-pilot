<script setup lang="ts">
import { ref, onMounted } from "vue";

// 检测操作系统
const isMacOS = ref(false);

onMounted(() => {
  // 检测是否为 macOS
  isMacOS.value = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 头部导航 - 高度优化为紧凑型 -->
    <header
      style="-webkit-app-region: drag"
      class="flex justify-between items-center px-4 py-2 bg-white/50 backdrop-blur-sm border-b border-gray-100 relative z-50"
    >
      <div
        :class="[
          'flex items-center gap-1.5 text-base font-bold text-blue-600',
          isMacOS ? 'ml-16' : '',
        ]"
      >
        <span
          class="inline-flex items-center justify-center size-6 shrink-0 overflow-hidden mr-1"
        >
          <img
            src="@/assets/images/logo.png"
            alt="logo"
            class="shrink-0 max-w-none size-12 translate-y-0.25"
          />
        </span>
        职捷径
      </div>

      <div class="flex items-center gap-3">
        <button
          class="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm transform transition-transform hover:scale-105 hover:shadow-md text-gray-500"
        >
          <span class="material-icons" style="font-size: 12px"
            >notifications</span
          >
        </button>

        <button
          class="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm transform transition-transform hover:scale-105 hover:shadow-md text-gray-500"
        >
          <span class="material-icons" style="font-size: 12px">settings</span>
        </button>
      </div>
    </header>

    <!-- 路由视图 -->
    <div class="flex-1 overflow-hidden">
      <router-view></router-view>
    </div>
  </div>
</template>
