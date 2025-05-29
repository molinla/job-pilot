<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";
import ExamPaper from "./components/ExamPaper.vue";
import {
	paperService,
	questionService,
	type Paper,
	type Question,
} from "../../services";

defineOptions({
	name: "AlgorithmTraining",
});

// 定义题目类型
interface BaseQuestion {
	id: string;
	content: string;
	isWrong: boolean;
}

interface ChoiceQuestion extends BaseQuestion {
	options: Array<{
		key: string;
		text: string;
	}>;
}

interface CodingQuestion extends BaseQuestion {
	description: string;
	language: string;
	initialCode: string;
	examples: Array<{
		input: string;
		output: string;
		explanation?: string;
	}>;
	constraints: string[];
}

// 定义试卷类型
interface Exam {
	title: string;
	totalScore: number;
	duration: number;
	questions: Array<ChoiceQuestion | CodingQuestion>;
	instructions: string[];
	singleChoiceScore: number;
	multipleChoiceScore: number;
	codingScore: number;
	singleChoiceQuestions: ChoiceQuestion[];
	multipleChoiceQuestions: ChoiceQuestion[];
	codingQuestions: CodingQuestion[];
}

const router = useRouter();
const pageTitle = ref("刷题训练");

const goBack = () => {
	router.push("/");
};

// 导航到试卷列表
const goToPapers = () => {
	router.push("/algorithm-training/papers");
};

// 其他功能区域的导航
const goToOtherFeature = (feature: string) => {
	console.log(`导航到: ${feature}`);
	// 这里可以添加其他功能区域的导航逻辑
};

// 试卷数据
const examData = ref<Exam>({
	title: "Java后端工程师面试题集（A卷）",
	totalScore: 100,
	duration: 120,
	questions: [],
	instructions: [
		"本试卷共包含单选题、多选题和编程题三种题型。",
		"单选题每题4分，多选题每题6分，编程题每题10分。",
		"多选题少选得部分分，多选不得分。",
		"有红色标记的题目为上次做错的题目，请重点关注。",
		"点击题目旁的AI图标可获取智能解析帮助。",
	],
	singleChoiceScore: 4,
	multipleChoiceScore: 6,
	codingScore: 10,
	singleChoiceQuestions: [],
	multipleChoiceQuestions: [],
	codingQuestions: [],
});

// 加载试卷数据
const loadExamData = async () => {
	try {
		// 获取试卷列表，这里假设获取第一个试卷
		const papersResponse = await paperService.getPapers({ page: 1, limit: 1 });

		if (papersResponse.success && papersResponse.data.items.length > 0) {
			const paper = papersResponse.data.items[0];

			// 获取试卷详情（包含题目）
			const paperDetailResponse = await paperService.getPaper(paper.id);

			if (paperDetailResponse.success && paperDetailResponse.data) {
				const paperDetail = paperDetailResponse.data;

				// 更新试卷基本信息
				examData.value.title = paperDetail.name;
				examData.value.totalScore = paperDetail.totalScore || 100;
				examData.value.duration = paperDetail.timeLimit || 120;

				// 如果试卷包含题目数据，转换格式
				if (paperDetail.questions && paperDetail.questions.length > 0) {
					const convertedQuestions = convertQuestionsToExamFormat(
						paperDetail.questions,
					);
					examData.value.singleChoiceQuestions =
						convertedQuestions.singleChoice;
					examData.value.multipleChoiceQuestions =
						convertedQuestions.multipleChoice;
					examData.value.codingQuestions = convertedQuestions.coding;
					examData.value.questions = [
						...convertedQuestions.singleChoice,
						...convertedQuestions.multipleChoice,
						...convertedQuestions.coding,
					];
				}
			}
		}
	} catch (error) {
		console.error("加载试卷数据失败:", error);
	}
};

// 转换 API 题目格式为组件需要的格式
const convertQuestionsToExamFormat = (questions: Question[]) => {
	const singleChoice: ChoiceQuestion[] = [];
	const multipleChoice: ChoiceQuestion[] = [];
	const coding: CodingQuestion[] = [];

	for (const question of questions) {
		// 这里需要根据实际的题目类型字段来判断
		// 暂时使用简单的逻辑来分类
		if (question.content.includes("选择")) {
			const choiceQuestion: ChoiceQuestion = {
				id: question.id,
				content: question.title,
				isWrong: false, // 这个需要从用户答题记录中获取
				options: [
					{ key: "A", text: "选项A" },
					{ key: "B", text: "选项B" },
					{ key: "C", text: "选项C" },
					{ key: "D", text: "选项D" },
				],
			};

			if (question.content.includes("多选")) {
				multipleChoice.push(choiceQuestion);
			} else {
				singleChoice.push(choiceQuestion);
			}
		} else {
			const codingQuestion: CodingQuestion = {
				id: question.id,
				content: question.title,
				isWrong: false,
				description: question.content,
				language: "Java",
				initialCode: "// 请在这里编写你的代码\n",
				examples: [
					{
						input: "示例输入",
						output: "示例输出",
					},
				],
				constraints: ["约束条件"],
			};
			coding.push(codingQuestion);
		}
	}

	return { singleChoice, multipleChoice, coding };
};

// 初始化数据
onMounted(() => {
	loadExamData();
});

// 处理试卷提交
const handleSubmit = (answers: Record<string, string | string[]>) => {
	console.log("提交的答案:", answers);
	// 这里可以添加提交逻辑，如发送到服务器等
	alert("试卷提交成功！");
};
</script>

<template>
  <div class="bg-blue-50 flex flex-col h-full relative overflow-auto">
    <!-- 背景光晕效果 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
    </div>

    <div class="relative z-10 p-4">
      <div class="flex items-center mb-4">
        <button
          class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
          @click="goBack"
          :style="`color: ${appTheme.primary.base}`"
        >
          <span class="material-icons" style="font-size: 20px">arrow_back</span>
        </button>
        <h1
          class="text-2xl font-bold"
          :style="`color: ${appTheme.primary.dark}`"
        >
          {{ pageTitle }}
        </h1>
      </div>

      <!-- 功能区域 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <!-- 试卷库 -->
        <div
          @click="goToPapers"
          class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              :style="`background-color: ${appTheme.primary.light}`"
            >
              <span
                class="material-icons"
                :style="`color: ${appTheme.primary.base}`"
                >description</span
              >
            </div>
            <h2 class="text-lg font-semibold">题库</h2>
          </div>
          <p class="text-sm text-gray-600">
            浏览各种类型的题目集合，包括前端、后端、算法等多个方向，选择题目开始练习。
          </p>
        </div>

        <!-- 其他功能区域 -->
        <div
          @click="goToOtherFeature('每日一题')"
          class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              :style="`background-color: ${appTheme.primary.light}`"
            >
              <span
                class="material-icons"
                :style="`color: ${appTheme.primary.base}`"
                >today</span
              >
            </div>
            <h2 class="text-lg font-semibold">每日一题</h2>
          </div>
          <p class="text-sm text-gray-600">
            每天一道精选题目，持续提升你的编程能力和解题思路。
          </p>
        </div>

        <!-- 错题集 -->
        <div
          @click="goToOtherFeature('错题集')"
          class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              :style="`background-color: ${appTheme.primary.light}`"
            >
              <span
                class="material-icons"
                :style="`color: ${appTheme.primary.base}`"
                >error_outline</span
              >
            </div>
            <h2 class="text-lg font-semibold">错题集</h2>
          </div>
          <p class="text-sm text-gray-600">
            查看你做错的题目，针对性地进行复习和强化训练。
          </p>
        </div>

        <!-- 学习计划 -->
        <div
          @click="goToOtherFeature('学习计划')"
          class="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center mb-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
              :style="`background-color: ${appTheme.primary.light}`"
            >
              <span
                class="material-icons"
                :style="`color: ${appTheme.primary.base}`"
                >schedule</span
              >
            </div>
            <h2 class="text-lg font-semibold">学习计划</h2>
          </div>
          <p class="text-sm text-gray-600">
            根据你的目标和水平，定制专属的学习计划和刷题路径。
          </p>
        </div>
      </div>

      <!-- 试卷组件 -->
      <ExamPaper :exam="examData" @submit="handleSubmit" />
    </div>
  </div>
</template>
