<script setup lang="ts">
import { ref, computed } from "vue";
import { appTheme } from "../../../config/theme";
import QuestionChoice from "./QuestionChoice.vue";
import QuestionCoding from "./QuestionCoding.vue";
import AnswerCard from "./AnswerCard.vue";
import "./styles.css";

const props = defineProps({
  exam: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["submit"]);

// 用户答案
const userAnswers = ref({});

// 处理答案更新
const handleAnswer = (answer) => {
  userAnswers.value[answer.questionId] = answer.answer;
};

// 提交试卷
const submitExam = () => {
  emit("submit", userAnswers.value);
};

// 计算完成度
const completionRate = computed(() => {
  const totalQuestions = props.exam.questions.length;
  const answeredQuestions = Object.keys(userAnswers.value).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
});

// 题目元素引用
const questionRefs = ref({});

// 注册题目元素引用
const registerQuestionRef = (id, el) => {
  questionRefs.value[id] = el;
};

// 导航到指定题目
const navigateToQuestion = (id) => {
  const el = document.getElementById(`question-${id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
</script>

<template>
  <div class="grid grid-cols-[60px_1fr_320px] gap-12">
    <!-- 占位用 -->
    <div></div>
    <!-- 试卷内容 -->
    <div
      class="max-w-full mx-auto bg-white shadow-xl py-12 px-16 min-h-screen my-8 rounded-md"
    >
      <!-- 试卷标题 -->
      <div class="text-center mb-10">
        <h1
          class="text-2xl font-bold"
          :style="`color: ${appTheme.neutral[800]}`"
        >
          {{ exam.title }}
        </h1>
        <div class="text-gray-500 mt-2 text-sm">
          总分: {{ exam.totalScore }}分 &nbsp;|&nbsp; 时间:
          {{ exam.duration }}分钟 &nbsp;|&nbsp; 题量:
          {{ exam.questions.length }}题
        </div>
        <div
          class="w-20 h-1 mx-auto mt-4 rounded-full"
          :style="`background-color: ${appTheme.primary.base}`"
        ></div>
      </div>

      <!-- 试卷说明 -->
      <div
        class="mb-8 text-sm border p-4 rounded-lg"
        :style="`color: ${appTheme.neutral[600]}; background-color: ${appTheme.neutral[100]}; border-color: ${appTheme.neutral[200]}`"
      >
        <h3
          class="font-medium mb-2 flex items-center"
          :style="`color: ${appTheme.primary.base}`"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          答题须知：
        </h3>
        <ol class="list-decimal pl-6 space-y-1">
          <li v-for="(instruction, index) in exam.instructions" :key="index">
            {{ instruction }}
          </li>
        </ol>
      </div>

      <!-- 单选题部分 -->
      <div
        v-if="
          exam.singleChoiceQuestions && exam.singleChoiceQuestions.length > 0
        "
        class="mb-12"
      >
        <h2
          class="text-lg font-semibold border-b pb-2 mb-6 flex items-center"
          :style="`color: ${appTheme.neutral[700]}; border-color: ${appTheme.neutral[200]}`"
        >
          <div
            class="w-2 h-6 rounded-full mr-2"
            :style="`background-color: ${appTheme.primary.base}`"
          ></div>
          第一部分：单选题（每题{{ exam.singleChoiceScore }}分，共{{
            exam.singleChoiceQuestions.length
          }}题）
        </h2>

        <div
          v-for="(question, index) in exam.singleChoiceQuestions"
          :key="question.id"
          :id="`question-${question.id}`"
        >
          <QuestionChoice
            :question="question"
            :index="index + 1"
            type="single"
            @answer="handleAnswer"
          />
        </div>
      </div>

      <!-- 多选题部分 -->
      <div
        v-if="
          exam.multipleChoiceQuestions &&
          exam.multipleChoiceQuestions.length > 0
        "
        class="mb-12"
      >
        <h2
          class="text-lg font-semibold border-b pb-2 mb-6 flex items-center"
          :style="`color: ${appTheme.neutral[700]}; border-color: ${appTheme.neutral[200]}`"
        >
          <div
            class="w-2 h-6 rounded-full mr-2"
            :style="`background-color: ${appTheme.primary.base}`"
          ></div>
          第二部分：多选题（每题{{ exam.multipleChoiceScore }}分，共{{
            exam.multipleChoiceQuestions.length
          }}题）
        </h2>

        <div
          v-for="(question, index) in exam.multipleChoiceQuestions"
          :key="question.id"
          :id="`question-${question.id}`"
        >
          <QuestionChoice
            :question="question"
            :index="index + 1"
            type="multiple"
            @answer="handleAnswer"
          />
        </div>
      </div>

      <!-- 编程题部分 -->
      <div
        v-if="exam.codingQuestions && exam.codingQuestions.length > 0"
        class="mb-12"
      >
        <h2
          class="text-lg font-semibold border-b pb-2 mb-6 flex items-center"
          :style="`color: ${appTheme.neutral[700]}; border-color: ${appTheme.neutral[200]}`"
        >
          <div
            class="w-2 h-6 rounded-full mr-2"
            :style="`background-color: ${appTheme.primary.base}`"
          ></div>
          第三部分：编程题（每题{{ exam.codingScore }}分，共{{
            exam.codingQuestions.length
          }}题）
        </h2>

        <div
          v-for="(question, index) in exam.codingQuestions"
          :key="question.id"
          :id="`question-${question.id}`"
        >
          <QuestionCoding
            :question="question"
            :index="index + 1"
            @answer="handleAnswer"
          />
        </div>
      </div>

      <!-- 提交按钮 -->
      <div
        class="flex justify-between items-center mt-10 pt-6 border-t"
        :style="`border-color: ${appTheme.neutral[200]}`"
      >
        <div class="flex items-center">
          <div
            class="text-sm font-medium mr-3"
            :style="`color: ${appTheme.neutral[600]}`"
          >
            完成度: {{ completionRate }}%
          </div>
          <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full"
              :style="`width: ${completionRate}%; background-color: ${appTheme.primary.base}`"
            ></div>
          </div>
        </div>

        <button
          class="px-4 py-2 rounded-lg text-white flex items-center"
          :style="`background-color: ${appTheme.primary.base}`"
          @click="submitExam"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          提交试卷
        </button>
      </div>
    </div>

    <!-- 答题卡 -->
    <AnswerCard
      :answers="userAnswers"
      :exam="exam"
      @navigate="navigateToQuestion"
    />
  </div>
</template>
