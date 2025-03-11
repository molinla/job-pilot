<script setup lang="ts">
import { appTheme } from "../../../config/theme";

defineProps({
  meetingTitle: {
    type: String,
    default: "前端开发模拟面试",
  },
  meetingId: {
    type: String,
    default: "389 475 1029",
  },
  duration: {
    type: String,
    default: "00:32:15",
  },
  pageTitle: {
    type: String,
    default: "模拟面试",
  },
});

const emit = defineEmits(["manage", "end", "back"]);

const handleManage = () => {
  emit("manage");
};

const handleEnd = () => {
  emit("end");
};

const handleBack = () => {
  emit("back");
};
</script>

<template>
  <header
    class="bg-white px-4 py-3 flex justify-between items-center shadow-md"
  >
    <div class="flex items-center">
      <button
        class="cursor-pointer mr-3 size-8 text-center flex items-center justify-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
        @click="handleBack"
        :style="`color: ${appTheme.secondary.base}`"
      >
        <span class="material-icons" style="font-size: 20px">arrow_back</span>
      </button>
      <div>
        <div class="flex items-center">
          <h1
            class="text-lg font-bold mr-3"
            :style="`color: ${appTheme.secondary.dark}`"
          >
            {{ pageTitle }}
          </h1>
          <div
            class="font-bold flex items-center"
            :style="`color: ${appTheme.secondary.base}`"
          >
            <span class="material-icons" style="font-size: 18px">videocam</span>
            <span class="ml-1.5">{{ meetingTitle }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-0.5">
          会议ID: {{ meetingId }} | {{ duration }}
        </p>
      </div>
    </div>
    <div class="flex space-x-3">
      <button
        class="py-1.5 px-3 rounded-full text-sm flex items-center"
        :style="`background-color: ${appTheme.secondary.light}; color: ${appTheme.secondary.base}`"
        @click="handleManage"
      >
        <span class="material-icons mr-1" style="font-size: 16px"
          >manage_accounts</span
        >
        <span>管理</span>
      </button>
      <button
        class="bg-red-500 hover:bg-red-600 py-1.5 px-3 rounded-full text-sm flex items-center text-white"
        @click="handleEnd"
      >
        <span class="material-icons mr-1" style="font-size: 16px"
          >call_end</span
        >
        <span>结束</span>
      </button>
    </div>
  </header>
</template>
