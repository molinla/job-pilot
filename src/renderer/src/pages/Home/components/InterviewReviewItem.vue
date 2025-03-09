<script setup>
import { ref } from "vue";

const props = defineProps({
  interview: {
    type: Object,
    required: true,
  },
});

const logoUrl = ref(`https://logo.clearbit.com/${props.interview.logo}`);

// 处理图片加载失败
const handleImageError = () => {
  const nameInitial = props.interview.company.charAt(0);
  logoUrl.value = `https://ui-avatars.com/api/?name=${nameInitial}&background=f59e0b&color=fff&size=36`;
};
</script>

<template>
  <div class="p-2.5 bg-amber-50 rounded-lg relative">
    <div
      class="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[10px]"
    >
      待处理
    </div>

    <div class="flex items-center mb-2">
      <div
        class="size-8 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0"
      >
        <img
          :src="logoUrl"
          :alt="interview.company"
          class="h-5 w-5 object-contain"
          @error="handleImageError"
        />
      </div>

      <div class="ml-2 min-w-0">
        <h3 class="text-xs font-medium text-gray-800 truncate">
          {{ interview.company }}
        </h3>
        <p class="text-[10px] text-gray-500 truncate">
          {{ interview.position }}
        </p>
      </div>
    </div>

    <div class="flex justify-between text-[10px] text-gray-600 mb-2">
      <span>{{ interview.round }}</span>
      <span>{{ interview.date }}</span>
    </div>

    <button
      class="w-full py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs transition"
    >
      开始复盘
    </button>
  </div>
</template>
