<script setup lang="ts">
import { appTheme } from "../../../config/theme";

type ActionType =
  | "toggleMute"
  | "toggleVideo"
  | "toggleShare"
  | "toggleChat"
  | "toggleRaiseHand"
  | "invite"
  | "more"
  | "end";

const emit = defineEmits([
  "toggleMute",
  "toggleVideo",
  "toggleShare",
  "toggleChat",
  "toggleRaiseHand",
  "invite",
  "more",
  "end",
]);

interface ControlButton {
  id: string;
  icon: string;
  label: string;
  action: ActionType;
  color: string;
  bgColor: string;
  hoverBgColor: string;
}

const controlButtons: ControlButton[] = [
  {
    id: "mute",
    icon: "mic",
    label: "静音",
    action: "toggleMute",
    color: appTheme.secondary.base,
    bgColor: appTheme.secondary.light,
    hoverBgColor: "bg-purple-100",
  },
  {
    id: "video",
    icon: "videocam",
    label: "视频",
    action: "toggleVideo",
    color: appTheme.secondary.base,
    bgColor: appTheme.secondary.light,
    hoverBgColor: "bg-purple-100",
  },
  {
    id: "share",
    icon: "screen_share",
    label: "共享",
    action: "toggleShare",
    color: appTheme.secondary.base,
    bgColor: appTheme.secondary.light,
    hoverBgColor: "bg-purple-100",
  },
  {
    id: "chat",
    icon: "chat",
    label: "聊天",
    action: "toggleChat",
    color: "#FFFFFF",
    bgColor: appTheme.accent.base,
    hoverBgColor: "bg-orange-400",
  },
  {
    id: "raiseHand",
    icon: "back_hand",
    label: "举手",
    action: "toggleRaiseHand",
    color: appTheme.secondary.base,
    bgColor: appTheme.secondary.light,
    hoverBgColor: "bg-purple-100",
  },
  {
    id: "invite",
    icon: "person_add",
    label: "邀请",
    action: "invite",
    color: appTheme.secondary.base,
    bgColor: appTheme.secondary.light,
    hoverBgColor: "bg-purple-100",
  },
  {
    id: "more",
    icon: "more_horiz",
    label: "更多",
    action: "more",
    color: appTheme.secondary.base,
    bgColor: appTheme.secondary.light,
    hoverBgColor: "bg-purple-100",
  },
  {
    id: "end",
    icon: "call_end",
    label: "结束",
    action: "end",
    color: "#FFFFFF",
    bgColor: "#EF4444",
    hoverBgColor: "bg-red-600",
  },
];

const handleButtonClick = (action: ActionType) => {
  emit(action);
};
</script>

<template>
  <footer
    class="border-t border-gray-100 bg-white py-3 px-4 flex justify-center space-x-4 shadow-lg z-20"
  >
    <button
      v-for="button in controlButtons"
      :key="button.id"
      class="flex flex-col items-center text-center px-1"
      @click="handleButtonClick(button.action)"
    >
      <div
        class="w-11 h-11 rounded-full flex items-center justify-center mb-1 transition-all"
        :class="button.hoverBgColor"
        :style="`background-color: ${button.bgColor}; color: ${button.color}`"
      >
        <span class="material-icons" style="font-size: 20px">{{
          button.icon
        }}</span>
      </div>
      <span class="text-xs text-gray-700">{{ button.label }}</span>
    </button>
  </footer>
</template>
