<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { appTheme } from "../../../config/theme";
import ExamPaper from "./ExamPaper.vue";

defineOptions({
	name: "PaperView",
});

const router = useRouter();
const route = useRoute();
const examId = ref(route.params.id);

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
	correctAnswer?: string | string[]; // 正确答案，单选为字符串，多选为字符串数组
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
	correctCode?: string; // 正确的代码实现
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

// 模拟试卷数据
const examData = ref<Exam>({
	title: "Node.js 前端开发工程师面试题",
	totalScore: 100,
	duration: 120,
	questions: [], // 所有题目的集合，用于计算完成度
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
	singleChoiceQuestions: [
		{
			id: "s1",
			content: "Node.js 中哪个模块用于处理文件系统相关操作？",
			isWrong: false,
			options: [
				{ key: "A", text: "http" },
				{ key: "B", text: "fs" },
				{ key: "C", text: "path" },
				{ key: "D", text: "os" },
			],
			correctAnswer: "B", // 正确答案
		},
		{
			id: "s2",
			content: "在 Node.js 中，哪个方法用于创建 HTTP 服务器？",
			isWrong: false,
			options: [
				{ key: "A", text: "http.createServer()" },
				{ key: "B", text: "fs.createServer()" },
				{ key: "C", text: "net.createServer()" },
				{ key: "D", text: "server.listen()" },
			],
			correctAnswer: "A", // 正确答案
		},
		{
			id: "s3",
			content: "关于 npm，下列说法正确的是？",
			isWrong: false,
			options: [
				{ key: "A", text: "npm 只能安装全局包" },
				{ key: "B", text: "npm install 默认安装到全局" },
				{ key: "C", text: "npm 可以管理依赖包的版本" },
				{ key: "D", text: "npm 只能用于 Node.js" },
			],
			correctAnswer: "C", // 正确答案
		},
	],
	multipleChoiceQuestions: [
		{
			id: "m1",
			content: "以下哪些是 Node.js 的核心模块？",
			isWrong: false,
			options: [
				{ key: "A", text: "events" },
				{ key: "B", text: "express" },
				{ key: "C", text: "path" },
				{ key: "D", text: "lodash" },
			],
			correctAnswer: ["A", "C"], // 正确答案
		},
		{
			id: "m2",
			content: "关于前端构建工具 webpack，下列说法正确的是？",
			isWrong: false,
			options: [
				{ key: "A", text: "可以打包 JavaScript、CSS、图片等资源" },
				{ key: "B", text: "只能用于 React 项目" },
				{ key: "C", text: "支持插件和 Loader 扩展功能" },
				{ key: "D", text: "只能在浏览器端运行" },
			],
			correctAnswer: ["A", "C"], // 正确答案
		},
		{
			id: "m3",
			content: "在 Node.js 中，关于异步编程，以下哪些方式是常用的？",
			isWrong: false,
			options: [
				{ key: "A", text: "回调函数" },
				{ key: "B", text: "Promise" },
				{ key: "C", text: "async/await" },
				{ key: "D", text: "线程池" },
			],
			correctAnswer: ["A", "B", "C"], // 正确答案
		},
	],
	codingQuestions: [
		{
			id: "c1",
			content:
				"实现一个函数，统计给定字符串中每个字符出现的次数，返回一个对象。",
			isWrong: false,
			description:
				"请实现一个函数 countChars(str)，输入一个字符串，返回一个对象，key 为字符，value 为出现次数。",
			language: "JavaScript",
			initialCode: "function countChars(str) {\n  // TODO\n}",
			examples: [
				{
					input: "countChars('hello')",
					output: "{ h: 1, e: 1, l: 2, o: 1 }",
				},
			],
			constraints: ["str 仅包含英文字符"],
			correctCode: `function countChars(str) {
  const result = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (result[char]) {
      result[char]++;
    } else {
      result[char] = 1;
    }
  }
  return result;
}`,
		},
		{
			id: "c2",
			content: "实现一个中间件函数，记录每个 HTTP 请求的请求方法和 URL。",
			isWrong: false,
			description:
				"请实现一个 Express 中间件 logRequest，能在每次请求时输出请求方法和 URL。",
			language: "JavaScript",
			initialCode: "function logRequest(req, res, next) {\n  // TODO\n}",
			examples: [
				{
					input: "GET /api/user",
					output: "GET /api/user",
				},
			],
			constraints: ["使用 Express 框架"],
			correctCode: `function logRequest(req, res, next) {
  console.log(\`\${req.method} \${req.url}\`);
  next();
}`,
		},
		{
			id: "c3",
			content: "实现一个 Promise 版的 setTimeout，支持 await。",
			isWrong: false,
			description:
				"请实现一个 sleep(ms) 函数，返回一个 Promise，可以通过 await sleep(ms) 实现延迟。",
			language: "JavaScript",
			initialCode: "function sleep(ms) {\n  // TODO\n}",
			examples: [
				{
					input: "await sleep(1000);",
					output: "延迟 1 秒后继续执行",
				},
			],
			constraints: ["ms 为正整数"],
			correctCode: `function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}`,
		},
		{
			id: "c4",
			content: "实现一个简单的 EventEmitter 类，支持 on 和 emit 方法。",
			isWrong: false,
			description:
				"请实现一个 EventEmitter 类，支持 on(event, handler) 注册事件，emit(event, ...args) 触发事件。",
			language: "JavaScript",
			initialCode: "class EventEmitter {\n  // TODO\n}",
			examples: [
				{
					input:
						"const emitter = new EventEmitter();\nemitter.on('test', (msg) => console.log(msg));\nemitter.emit('test', 'hello');",
					output: "hello",
				},
			],
			constraints: ["仅需实现 on 和 emit 两个方法"],
			correctCode: `class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, handler) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(...args));
    }
  }
}`,
		},
	],
});

// 初始化所有题目的集合
onMounted(() => {
	const allQuestions = [
		...examData.value.singleChoiceQuestions,
		...examData.value.multipleChoiceQuestions,
		...examData.value.codingQuestions,
	];
	examData.value.questions = allQuestions;

	// 在实际应用中，这里应该根据 examId 从服务器获取试卷数据
	console.log(`加载试卷ID: ${examId.value}`);
});

// 处理试卷提交
const handleSubmit = (answers: Record<string, string | string[]>) => {
	console.log("提交的答案:", answers);

	// 验证答案
	const results: Record<string, { correct: boolean; score: number }> = {};
	let totalScore = 0;

	// 验证单选题
	for (const q of examData.value.singleChoiceQuestions) {
		const userAnswer = answers[q.id] as string;
		const isCorrect = userAnswer === q.correctAnswer;
		const score = isCorrect ? examData.value.singleChoiceScore : 0;
		results[q.id] = { correct: isCorrect, score };
		totalScore += score;
	}

	// 验证多选题
	for (const q of examData.value.multipleChoiceQuestions) {
		const userAnswer = (answers[q.id] as string[]) || [];
		const correctAnswer = q.correctAnswer as string[];

		// 检查是否完全匹配
		const isCorrect =
			userAnswer.length === correctAnswer.length &&
			correctAnswer.every((a) => userAnswer.includes(a));

		// 计算部分分数
		let score = 0;
		if (isCorrect) {
			score = examData.value.multipleChoiceScore;
		} else if (userAnswer.every((a) => correctAnswer.includes(a))) {
			// 少选得部分分
			score = Math.floor(
				(userAnswer.length / correctAnswer.length) *
					examData.value.multipleChoiceScore,
			);
		}

		results[q.id] = { correct: isCorrect, score };
		totalScore += score;
	}

	// 将结果输出到控制台
	console.log("答题结果:", results);
	console.log(`总分: ${totalScore}/${examData.value.totalScore}`);

	alert(`答题完成！得分: ${totalScore}分`);
	// 返回题库
	router.push("/algorithm-training");
};

// 返回试卷列表
const goBack = () => {
	router.push("/algorithm-training");
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
      <!-- 返回按钮 -->
      <div class="flex items-center mb-4">
        <button
          class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
          @click="goBack"
          :style="`color: ${appTheme.primary.base}`"
        >
          <span class="material-icons" style="font-size: 20px">arrow_back</span>
        </button>
        <h1 class="text-xl font-bold text-gray-800">答题</h1>
      </div>

      <!-- 试卷组件 -->
      <ExamPaper :exam="examData" @submit="handleSubmit" />
    </div>
  </div>
</template>
