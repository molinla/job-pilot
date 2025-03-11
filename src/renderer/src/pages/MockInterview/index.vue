<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";
import Header from "./components/Header.vue";
import VideoPlaceholder from "./components/VideoPlaceholder.vue";
import ControlBar from "./components/ControlBar.vue";

defineOptions({
  name: "MockInterview",
});

const router = useRouter();
const pageTitle = ref("模拟面试");
const meetingTitle = ref("前端开发模拟面试");
const meetingId = ref("389 475 1029");
const duration = ref("00:32:15");
const participantCount = ref(2);

const goBack = () => {
  router.push("/");
};

// 会议控制功能
const handleManage = () => {
  console.log("管理会议");
};

const handleEnd = () => {
  console.log("结束会议");
  goBack();
};

// 控制栏功能
const handleToggleMute = () => {
  console.log("切换静音");
};

const handleToggleVideo = () => {
  console.log("切换视频");
};

const handleToggleShare = () => {
  console.log("切换共享");
};

const handleToggleChat = () => {
  console.log("切换聊天");
};

const handleToggleRaiseHand = () => {
  console.log("切换举手");
};

const handleInvite = () => {
  console.log("邀请");
};

const handleMore = () => {
  console.log("更多选项");
};
</script>

<template>
  <div class="flex flex-col h-full relative overflow-hidden">
    <!-- 背景光晕效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.secondary.base}; opacity: 0.2`"
      ></div>
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.secondary.base}; opacity: 0.2`"
      ></div>
    </div>

    <div class="relative z-10 flex flex-col h-full">
      <!-- 头部信息栏 -->
      <Header
        :meetingTitle="meetingTitle"
        :meetingId="meetingId"
        :duration="duration"
        :pageTitle="pageTitle"
        @manage="handleManage"
        @end="handleEnd"
        @back="goBack"
      />

      <!-- 主要内容区 -->
      <main class="flex-1 flex justify-center p-4 overflow-auto">
        <div
          class="w-full bg-white rounded-md overflow-hidden border border-gray-200"
        >
          <VideoPlaceholder
            :participantCount="participantCount"
            hostName="面试官"
            hostTitle="资深工程师"
            hostInitials="MS"
          />
        </div>
      </main>

      <!-- 底部控制栏 -->
      <ControlBar
        @toggleMute="handleToggleMute"
        @toggleVideo="handleToggleVideo"
        @toggleShare="handleToggleShare"
        @toggleChat="handleToggleChat"
        @toggleRaiseHand="handleToggleRaiseHand"
        @invite="handleInvite"
        @more="handleMore"
        @end="handleEnd"
      />
    </div>
  </div>
</template>

<style scoped>
.vertical-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
