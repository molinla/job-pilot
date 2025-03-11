<script setup lang="ts">
import { appTheme } from "../../../config/theme";

defineProps({
  participantCount: {
    type: Number,
    default: 2,
  },
  hostName: {
    type: String,
    default: "面试官",
  },
  hostTitle: {
    type: String,
    default: "资深工程师",
  },
  hostInitials: {
    type: String,
    default: "MS",
  },
  isMicOn: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div
    class="relative bg-gray-50 w-full h-full flex items-center justify-center"
  >
    <!-- 占位符内容 -->
    <div class="text-center">
      <span
        class="material-icons text-6xl mb-4 block"
        :style="`color: ${appTheme.secondary.base}`"
        >videocam_off</span
      >
      <p class="text-lg text-gray-600 mb-2">视频占位区</p>
      <p class="text-sm text-gray-500">
        当前会议中有 {{ participantCount }} 名参会人
      </p>

      <!-- 循环播放的小动画点 -->
      <div class="flex justify-center mt-5 space-x-2">
        <div
          class="w-2 h-2 rounded-full animate-pulse"
          :style="`background-color: ${appTheme.secondary.base}`"
        ></div>
        <div
          class="w-2 h-2 rounded-full animate-pulse"
          :style="`background-color: ${appTheme.secondary.base}; animation-delay: 300ms`"
        ></div>
        <div
          class="w-2 h-2 rounded-full animate-pulse"
          :style="`background-color: ${appTheme.secondary.base}; animation-delay: 600ms`"
        ></div>
      </div>
    </div>

    <!-- 主持人信息标签 -->
    <div
      class="absolute bottom-4 left-4 bg-white bg-opacity-95 py-2 px-3 rounded-lg flex items-center border border-gray-100"
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2 text-xs"
        :style="`background-color: ${appTheme.secondary.base}`"
      >
        {{ hostInitials }}
      </div>
      <div>
        <p
          class="font-medium text-sm"
          :style="`color: ${appTheme.secondary.base}`"
        >
          {{ hostName }} (主持人)
        </p>
        <p class="text-xs text-gray-500">{{ hostTitle }}</p>
      </div>
      <span
        v-if="isMicOn"
        class="material-icons ml-3 text-green-500"
        style="font-size: 16px"
        >mic</span
      >
      <span
        v-else
        class="material-icons ml-3 text-red-500"
        style="font-size: 16px"
        >mic_off</span
      >
    </div>

    <!-- 参会人数指示 -->
    <div
      class="absolute top-4 right-4 bg-white bg-opacity-95 px-3 py-1.5 rounded-full flex items-center shadow-sm border border-gray-100 text-xs"
    >
      <span
        class="material-icons mr-1.5"
        :style="`color: ${appTheme.secondary.base}; font-size: 16px`"
        >group</span
      >
      <span class="text-gray-700">{{ participantCount }} 人</span>
    </div>
  </div>
</template>
