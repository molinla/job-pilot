<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";

defineOptions({
  name: "InterviewRecording",
});

const router = useRouter();
const pageTitle = ref("录制面试");

const goBack = () => {
  router.push("/");
};
</script>

<template>
  <div class="bg-blue-50 flex flex-col h-full relative overflow-hidden p-4">
    <!-- 背景光晕效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.status.info}; opacity: 0.2`"
      ></div>
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.status.info}; opacity: 0.2`"
      ></div>
    </div>

    <div class="relative z-10">
      <div class="flex items-center mb-4">
        <button
          class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
          @click="goBack"
          :style="`color: ${appTheme.status.info}`"
        >
          <span class="material-icons" style="font-size: 20px">arrow_back</span>
        </button>
        <h1
          class="text-2xl font-bold"
          :style="`color: ${appTheme.status.info}`"
        >
          {{ pageTitle }}
        </h1>
      </div>
      <div
        class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-6"
      >
        <p class="text-lg">录制面试页面内容将在这里实现...</p>
      </div>
    </div>
  </div>
</template>
