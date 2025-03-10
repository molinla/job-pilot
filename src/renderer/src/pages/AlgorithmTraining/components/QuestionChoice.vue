<script setup lang="ts">
import { ref, computed } from "vue";
import { appTheme } from "../../../config/theme";

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    default: "single", // 'single' 或 'multiple'
    validator: (value: string) => ["single", "multiple"].includes(value),
  },
});

const emit = defineEmits(["answer"]);

// 用户选择的答案
const selectedOptions = ref(props.type === "single" ? "" : []);

// 是否为错题
const isWrongQuestion = computed(() => props.question.isWrong);

// 处理选项选择
const handleOptionSelect = (optionKey: string) => {
  if (props.type === "single") {
    selectedOptions.value = optionKey;
    emit("answer", { questionId: props.question.id, answer: optionKey });
  } else {
    // 多选题逻辑
    const index = (selectedOptions.value as string[]).indexOf(optionKey);
    if (index === -1) {
      (selectedOptions.value as string[]).push(optionKey);
    } else {
      (selectedOptions.value as string[]).splice(index, 1);
    }
    emit("answer", {
      questionId: props.question.id,
      answer: [...selectedOptions.value],
    });
  }
};

// 判断选项是否被选中
const isOptionSelected = (optionKey: string) => {
  if (props.type === "single") {
    return selectedOptions.value === optionKey;
  }

  return (selectedOptions.value as string[]).includes(optionKey);
};

// 显示AI解析
const showAIAnalysis = () => {
  // 实现AI解析逻辑
  console.log("显示AI解析", props.question.id);
};
</script>

<template>
  <div class="mb-8">
    <div class="font-medium mb-3 flex items-center">
      <div
        class="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold mr-2"
        :style="`background-color: ${appTheme.primary.light}; color: ${appTheme.primary.dark}`"
      >
        {{ index }}
      </div>
      <span class="text-gray-700">{{ question.content }}</span>

      <!-- 错题标记 -->
      <span
        v-if="isWrongQuestion"
        class="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-medium"
        :style="`background-color: ${appTheme.status.error}20; color: ${appTheme.status.error}`"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-3 w-3 mr-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        上次错题
      </span>

      <!-- AI解析按钮 -->
      <button
        class="ml-auto hover:opacity-80"
        title="AI解析"
        @click="showAIAnalysis"
        :style="`color: ${appTheme.primary.base}`"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </button>
    </div>

    <!-- 选项列表 -->
    <div class="pl-8 space-y-3">
      <div
        v-for="option in question.options"
        :key="option.key"
        class="option-hover flex items-center p-3 border rounded-lg cursor-pointer transition-all"
        :class="{
          'border-gray-200 bg-white': !isOptionSelected(option.key),
          'border-2': isOptionSelected(option.key),
        }"
        :style="
          isOptionSelected(option.key)
            ? `border-color: ${appTheme.primary.base}; background-color: ${appTheme.primary.light}30`
            : ''
        "
        @click="handleOptionSelect(option.key)"
      >
        <!-- 选择框 -->
        <div
          class="w-5 h-5 flex-shrink-0 border rounded mr-3 flex items-center justify-center"
          :class="{ 'border-gray-300': !isOptionSelected(option.key) }"
          :style="
            isOptionSelected(option.key)
              ? `border-color: ${appTheme.primary.base}; background-color: ${appTheme.primary.base}`
              : ''
          "
        >
          <svg
            v-if="isOptionSelected(option.key)"
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <!-- 选项内容 -->
        <div class="flex items-center">
          <span class="font-medium mr-2">{{ option.key }}.</span>
          <span>{{ option.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
