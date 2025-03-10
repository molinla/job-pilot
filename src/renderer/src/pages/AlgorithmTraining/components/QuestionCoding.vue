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
});

const emit = defineEmits(["answer"]);

// 用户输入的代码
const codeAnswer = ref(props.question.initialCode || "");

// 是否为错题
const isWrongQuestion = computed(() => props.question.isWrong);

// 更新代码
const updateCode = (event) => {
  codeAnswer.value = event.target.value;
  emit("answer", { questionId: props.question.id, answer: codeAnswer.value });
};

// 运行代码
const runCode = () => {
  console.log("运行代码", codeAnswer.value);
  // 实现代码运行逻辑
};

// 显示AI解析
const showAIAnalysis = () => {
  // 实现AI解析逻辑
  console.log("显示AI解析", props.question.id);
};
</script>

<template>
  <div class="mb-10">
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

    <!-- 题目描述 -->
    <div class="pl-8 mb-4">
      <div
        class="text-gray-600 text-sm mb-3"
        v-html="question.description"
      ></div>

      <!-- 示例 -->
      <div
        v-if="question.examples && question.examples.length > 0"
        class="mb-3"
      >
        <div
          v-for="(example, idx) in question.examples"
          :key="idx"
          class="mb-2"
        >
          <div
            class="text-xs font-medium mb-1"
            :style="`color: ${appTheme.neutral[600]}`"
          >
            示例 {{ idx + 1 }}:
          </div>
          <div class="bg-gray-50 p-2 rounded text-sm font-mono">
            <div v-if="example.input">
              <span class="font-medium">输入：</span>{{ example.input }}
            </div>
            <div v-if="example.output">
              <span class="font-medium">输出：</span>{{ example.output }}
            </div>
            <div v-if="example.explanation" class="text-gray-500 text-xs mt-1">
              {{ example.explanation }}
            </div>
          </div>
        </div>
      </div>

      <!-- 约束条件 -->
      <div
        v-if="question.constraints && question.constraints.length > 0"
        class="mb-3"
      >
        <div
          class="text-xs font-medium mb-1"
          :style="`color: ${appTheme.neutral[600]}`"
        >
          约束条件:
        </div>
        <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
          <li v-for="(constraint, idx) in question.constraints" :key="idx">
            {{ constraint }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 代码编辑器 -->
    <div class="pl-8">
      <div class="border border-gray-200 rounded-lg overflow-hidden">
        <!-- 编辑器头部 -->
        <div
          class="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center"
        >
          <div
            class="text-xs font-medium"
            :style="`color: ${appTheme.neutral[600]}`"
          >
            {{ question.language || "Java" }}
          </div>
          <button
            class="ml-auto text-xs px-2 py-1 rounded"
            :style="`background-color: ${appTheme.primary.base}; color: white`"
            @click="runCode"
          >
            <span class="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              运行代码
            </span>
          </button>
        </div>

        <!-- 代码编辑区域 -->
        <textarea
          class="w-full h-64 p-3 font-mono text-sm focus:outline-none resize-none"
          :value="codeAnswer"
          @input="updateCode"
          :placeholder="'请在此处编写代码...'"
          :style="`color: ${appTheme.neutral[800]}; background-color: ${appTheme.neutral[100]}`"
        ></textarea>
      </div>
    </div>
  </div>
</template>
