<script setup lang="ts">
import { computed } from "vue";
import { appTheme } from "../../../config/theme";

const props = defineProps({
  answers: {
    type: Object,
    required: true,
  },
  exam: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["navigate"]);

// 计算单选题答题情况
const singleChoiceStatus = computed(() => {
  return props.exam.singleChoiceQuestions.map((q) => ({
    id: q.id,
    index:
      props.exam.singleChoiceQuestions.findIndex((item) => item.id === q.id) +
      1,
    answered: !!props.answers[q.id],
    isWrong: q.isWrong,
  }));
});

// 计算多选题答题情况
const multipleChoiceStatus = computed(() => {
  return props.exam.multipleChoiceQuestions.map((q) => ({
    id: q.id,
    index:
      props.exam.multipleChoiceQuestions.findIndex((item) => item.id === q.id) +
      1,
    answered:
      !!props.answers[q.id] && (props.answers[q.id] as string[]).length > 0,
    isWrong: q.isWrong,
  }));
});

// 计算编程题答题情况
const codingStatus = computed(() => {
  return props.exam.codingQuestions.map((q) => ({
    id: q.id,
    index: props.exam.codingQuestions.findIndex((item) => item.id === q.id) + 1,
    answered:
      !!props.answers[q.id] &&
      (props.answers[q.id] as string).trim().length > 0,
    isWrong: q.isWrong,
  }));
});

// 计算总体完成度
const completionRate = computed(() => {
  const totalQuestions = props.exam.questions.length;
  const answeredQuestions = Object.keys(props.answers).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
});

// 导航到指定题目
const navigateToQuestion = (id: string) => {
  emit("navigate", id);
};
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-lg p-4 fixed right-16 top-22 max-h-[calc(100vh-120px)] overflow-auto w-74"
  >
    <!-- 答题卡标题 -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold" :style="`color: ${appTheme.neutral[700]}`">
        答题卡
      </h3>
      <div class="flex items-center">
        <div
          class="text-xs font-medium mr-2"
          :style="`color: ${appTheme.neutral[600]}`"
        >
          {{ completionRate }}%
        </div>
        <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full"
            :style="`width: ${completionRate}%; background-color: ${appTheme.primary.base}`"
          ></div>
        </div>
      </div>
    </div>

    <!-- 图例说明 -->
    <div
      class="flex items-center justify-between text-xs mb-3 px-1"
      :style="`color: ${appTheme.neutral[500]}`"
    >
      <div class="flex items-center">
        <div class="w-3 h-3 rounded-full bg-gray-200 mr-1"></div>
        <span>未答</span>
      </div>
      <div class="flex items-center">
        <div
          class="w-3 h-3 rounded-full mr-1"
          :style="`background-color: ${appTheme.primary.base}`"
        ></div>
        <span>已答</span>
      </div>
      <div class="flex items-center">
        <div
          class="w-3 h-3 rounded-full mr-1"
          :style="`background-color: ${appTheme.status.error}`"
        ></div>
        <span>已答错题</span>
      </div>
      <div class="flex items-center">
        <div
          class="w-3 h-3 rounded-full mr-1 border-2"
          :style="`border-color: ${appTheme.status.error}; background-color: transparent;`"
        ></div>
        <span>未答错题</span>
      </div>
    </div>

    <!-- 单选题部分 -->
    <div v-if="singleChoiceStatus.length > 0" class="mb-4">
      <div
        class="text-xs font-medium mb-2"
        :style="`color: ${appTheme.neutral[600]}`"
      >
        单选题 ({{ props.exam.singleChoiceScore }}分/题)
      </div>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="item in singleChoiceStatus"
          :key="item.id"
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 hover:shadow-md"
          :style="`
            ${
              item.answered
                ? `background-color: ${item.isWrong ? appTheme.status.error : appTheme.primary.base}; color: white; border: none;`
                : item.isWrong
                  ? `background-color: transparent; color: ${appTheme.neutral[700]}; border: 2px solid ${appTheme.status.error};`
                  : `background-color: rgb(229, 231, 235); color: ${appTheme.neutral[700]}; border: none;`
            }
          `"
          @click="navigateToQuestion(item.id)"
        >
          {{ item.index }}
        </button>
      </div>
    </div>

    <!-- 多选题部分 -->
    <div v-if="multipleChoiceStatus.length > 0" class="mb-4">
      <div
        class="text-xs font-medium mb-2"
        :style="`color: ${appTheme.neutral[600]}`"
      >
        多选题 ({{ props.exam.multipleChoiceScore }}分/题)
      </div>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="item in multipleChoiceStatus"
          :key="item.id"
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 hover:shadow-md"
          :style="`
            ${
              item.answered
                ? `background-color: ${item.isWrong ? appTheme.status.error : appTheme.primary.base}; color: white; border: none;`
                : item.isWrong
                  ? `background-color: transparent; color: ${appTheme.neutral[700]}; border: 2px solid ${appTheme.status.error};`
                  : `background-color: rgb(229, 231, 235); color: ${appTheme.neutral[700]}; border: none;`
            }
          `"
          @click="navigateToQuestion(item.id)"
        >
          {{ item.index }}
        </button>
      </div>
    </div>

    <!-- 编程题部分 -->
    <div v-if="codingStatus.length > 0" class="mb-4">
      <div
        class="text-xs font-medium mb-2"
        :style="`color: ${appTheme.neutral[600]}`"
      >
        编程题 ({{ props.exam.codingScore }}分/题)
      </div>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="item in codingStatus"
          :key="item.id"
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 hover:shadow-md"
          :style="`
            ${
              item.answered
                ? `background-color: ${item.isWrong ? appTheme.status.error : appTheme.primary.base}; color: white; border: none;`
                : item.isWrong
                  ? `background-color: transparent; color: ${appTheme.neutral[700]}; border: 2px solid ${appTheme.status.error};`
                  : `background-color: rgb(229, 231, 235); color: ${appTheme.neutral[700]}; border: none;`
            }
          `"
          @click="navigateToQuestion(item.id)"
        >
          {{ item.index }}
        </button>
      </div>
    </div>

    <!-- 提示信息 -->
    <div
      class="text-xs mt-4 p-2 rounded"
      :style="`color: ${appTheme.neutral[600]}; background-color: ${appTheme.neutral[100]}`"
    >
      <p>点击题号可快速跳转到对应题目</p>
      <p class="mt-1">红色填充表示已答但错误的题目</p>
      <p class="mt-1">红色边框表示未答但上次做错的题目</p>
    </div>
  </div>
</template>
