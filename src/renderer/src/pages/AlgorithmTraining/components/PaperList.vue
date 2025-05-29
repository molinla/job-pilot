<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../../config/theme";

// 定义试卷类型
interface Section {
	type: string;
	count: number;
	pointsPerQuestion: number;
	description: string;
}

interface Exam {
	id: number;
	title: string;
	category: string;
	level: string;
	duration: string;
	totalPoints: number;
	sections: Section[];
	usageCount: number;
	status: string;
	author: string;
	createdAt: string;
}

// 分类列表
const categories = [
	"前端开发",
	"后端开发",
	"数据库",
	"算法",
	"UI设计",
	"系统架构",
	"DevOps",
];

// 作者列表
const authors = [
	"张经理",
	"李总监",
	"王架构师",
	"刘老师",
	"陈教授",
	"赵技术总监",
	"钱部长",
	"孙主管",
];

// 描述模板
const descriptionTemplates = {
	选择题: ["单选题", "多选题", "判断题"],
	编程题: ["算法实现", "功能开发", "代码优化", "问题修复"],
	设计题: ["系统设计", "架构设计", "界面设计", "数据库设计"],
	简答题: ["概念解释", "原理阐述", "场景分析"],
	案例分析: ["实际案例", "最佳实践", "问题诊断"],
};

// 状态
const exams = ref<Exam[]>([]);
const searchQuery = ref("");
const filterCategory = ref("");
const sortBy = ref("latest");
const page = ref(1);
const hasMoreExams = ref(true);
const isLoading = ref(false);
const router = useRouter();

// 筛选和排序后的考试列表
const filteredExams = computed(() => {
	let result = [...exams.value];

	// 搜索筛选
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase();
		result = result.filter(
			(exam) =>
				exam.title.toLowerCase().includes(query) ||
				exam.category.toLowerCase().includes(query),
		);
	}

	// 分类筛选
	if (filterCategory.value) {
		result = result.filter((exam) => exam.category === filterCategory.value);
	}

	// 排序
	switch (sortBy.value) {
		case "usage":
			result.sort((a, b) => b.usageCount - a.usageCount);
			break;
		case "difficulty": {
			const difficultyOrder = { 初级: 1, 中级: 2, 高级: 3 };
			result.sort(
				(a, b) =>
					difficultyOrder[a.level as keyof typeof difficultyOrder] -
					difficultyOrder[b.level as keyof typeof difficultyOrder],
			);
			break;
		}
		default:
			result.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
			break;
	}

	return result;
});

// 模拟获取考试数据的API调用
async function fetchExams(pageNum: number) {
	isLoading.value = true;

	// 模拟API延迟
	await new Promise((resolve) => setTimeout(resolve, 0));

	// 只在第一页插入特定试卷，且只插入一次
	if (
		pageNum === 1 &&
		!exams.value.some((e) => e.title === "Node.js 前端开发工程师面试题")
	) {
		exams.value.unshift({
			id: 9999,
			title: "Node.js 前端开发工程师面试题",
			category: "前端开发",
			level: "中级",
			duration: "60分钟",
			totalPoints: 100,
			sections: [
				{
					type: "单选题",
					count: 3,
					pointsPerQuestion: 5,
					description: "涵盖Node.js基础、异步编程、前端构建工具等核心知识点。",
				},
				{
					type: "多选题",
					count: 3,
					pointsPerQuestion: 5,
					description: "考查Node.js模块、事件循环、前端工程化等内容。",
				},
				{
					type: "编程题",
					count: 4,
					pointsPerQuestion: 15,
					description: "涉及异步处理、API设计、构建脚本等实际开发能力。",
				},
			],
			usageCount: Math.floor(Math.random() * 100),
			status: "pending",
			author: "张经理",
			createdAt: new Date().toISOString(),
		});
	}

	// 模拟考试数据
	const newExams: Exam[] = [];
	const startId = (pageNum - 1) * 10 + 1;

	for (let i = 0; i < 10; i++) {
		const id = startId + i;

		// 如果超过50个考试，不再加载
		if (id > 50) {
			hasMoreExams.value = false;
			break;
		}

		const category = categories[Math.floor(Math.random() * categories.length)];
		const level = ["初级", "中级", "高级"][Math.floor(Math.random() * 3)];
		const usageCount = Math.floor(Math.random() * 100);
		const author = authors[Math.floor(Math.random() * authors.length)];

		// 生成随机考试内容
		const sections: Section[] = [
			{
				type: "选择题",
				count: Math.floor(Math.random() * 20) + 5,
				pointsPerQuestion: 2,
				description:
					descriptionTemplates.选择题[
						Math.floor(Math.random() * descriptionTemplates.选择题.length)
					],
			},
			{
				type: "编程题",
				count: Math.floor(Math.random() * 3) + 1,
				pointsPerQuestion: 20,
				description:
					descriptionTemplates.编程题[
						Math.floor(Math.random() * descriptionTemplates.编程题.length)
					],
			},
		];

		// 随机添加其他题型
		if (Math.random() > 0.5) {
			sections.push({
				type: "设计题",
				count: 1,
				pointsPerQuestion: 30,
				description:
					descriptionTemplates.设计题[
						Math.floor(Math.random() * descriptionTemplates.设计题.length)
					],
			});
		}

		if (Math.random() > 0.7) {
			sections.push({
				type: "简答题",
				count: Math.floor(Math.random() * 5) + 1,
				pointsPerQuestion: 10,
				description:
					descriptionTemplates.简答题[
						Math.floor(Math.random() * descriptionTemplates.简答题.length)
					],
			});
		}

		// 计算总分和时长
		const totalPoints = sections.reduce(
			(sum, section) => sum + section.count * section.pointsPerQuestion,
			0,
		);
		const duration = Math.floor(totalPoints / 2) + 15; // 简单模拟时长计算

		// 随机状态
		const status = Math.random() > 0.7 ? "completed" : "pending";

		// 生成随机创建日期（过去3个月内）
		const creationDate = new Date();
		creationDate.setDate(
			creationDate.getDate() - Math.floor(Math.random() * 90),
		);

		newExams.push({
			id,
			title: generateTitle(category, id),
			category,
			level,
			duration: `${duration}分钟`,
			totalPoints,
			sections,
			usageCount,
			status,
			author,
			createdAt: creationDate.toISOString(),
		});
	}

	exams.value = [...exams.value, ...newExams];
	isLoading.value = false;
}

// 生成标题
function generateTitle(category: string, id: number): string {
	const prefixes: Record<string, string[]> = {
		前端开发: [
			"JavaScript",
			"React",
			"Vue",
			"CSS3",
			"HTML5",
			"TypeScript",
			"Angular",
		],
		后端开发: ["Node.js", "Python", "Java", "Go", "C#", "PHP", "Ruby"],
		数据库: [
			"MySQL",
			"MongoDB",
			"PostgreSQL",
			"Redis",
			"SQLite",
			"Oracle",
			"SQL Server",
		],
		算法: [
			"数据结构",
			"排序算法",
			"搜索算法",
			"动态规划",
			"贪心算法",
			"图论",
			"机器学习",
		],
		UI设计: [
			"UI基础",
			"交互设计",
			"用户体验",
			"色彩理论",
			"Figma",
			"Sketch",
			"Adobe XD",
		],
		系统架构: [
			"微服务",
			"分布式系统",
			"云原生",
			"系统设计",
			"DevOps",
			"Docker",
			"Kubernetes",
		],
		DevOps: [
			"CI/CD",
			"自动化测试",
			"Docker",
			"Kubernetes",
			"监控",
			"日志分析",
			"安全",
		],
	};

	const suffixes = [
		"知识考核试卷",
		"能力评估试卷",
		"岗位认证试卷",
		"技能测试试卷",
		"水平测验试卷",
	];

	const prefix =
		prefixes[category][Math.floor(Math.random() * prefixes[category].length)];
	const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

	return `${prefix}${suffix}`;
}

// 计算考试总题数
function getTotalQuestions(exam: Exam): number {
	return exam.sections.reduce((total, section) => total + section.count, 0);
}

// 获取部分描述
function getSectionDescription(section: Section): string {
	return `${section.description}，每题${section.pointsPerQuestion}分，共${section.count * section.pointsPerQuestion}分`;
}

// 数字转中文
function numberToChinese(num: number): string {
	const chineseNumbers = [
		"一",
		"二",
		"三",
		"四",
		"五",
		"六",
		"七",
		"八",
		"九",
		"十",
	];
	if (num <= 10) {
		return chineseNumbers[num - 1];
	}
	return num.toString();
}

// 格式化日期
function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// 加载更多考试
function loadMoreExams(): void {
	page.value++;
	fetchExams(page.value);
}

// 开始考试
function startExam(examId: number): void {
	console.log(`开始做题: ${examId}`);
	router.push(`/algorithm-training/paper/${examId}`);
}

// 返回上一页
function goBack(): void {
	router.push("/");
}

onMounted(() => {
	// 初始加载
	fetchExams(page.value);
});
</script>

<template>
  <div
    class="bg-blue-50 flex flex-col h-full relative overflow-auto scroll-smooth"
  >
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
      <!-- 顶部标题和搜索 -->
      <div class="max-w-7xl mx-auto mb-6">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div class="flex items-center">
            <button
              class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
              @click="goBack"
              :style="`color: ${appTheme.primary.base}`"
            >
              <span class="material-icons" style="font-size: 20px"
                >arrow_back</span
              >
            </button>
            <h1 class="text-xl font-bold text-gray-800">题库</h1>
          </div>

          <div class="flex flex-wrap gap-2">
            <div class="relative">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="搜索题目..."
                class="pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-gray-400 absolute left-2.5 top-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              v-model="filterCategory"
              class="text-sm border border-gray-200 rounded-md py-1.5 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">全部分类</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>

            <select
              v-model="sortBy"
              class="text-sm border border-gray-200 rounded-md py-1.5 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="latest">最新上传</option>
              <option value="usage">使用次数</option>
              <option value="difficulty">难度排序</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 瀑布流试卷展示 -->
      <div class="max-w-7xl mx-auto">
        <div class="masonry-container">
          <div
            v-for="exam in filteredExams"
            :key="exam.id"
            class="masonry-item"
          >
            <!-- 考试卡片 - 使用您提供的新卡片设计 -->
            <div
              class="bg-white rounded-sm shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <!-- 试卷头部 - 模拟A4纸头部 -->
              <div class="border-b border-gray-200 p-4 bg-gray-50 text-center">
                <h3 class="text-base font-bold text-gray-800">
                  {{ exam.title }}
                </h3>
                <div class="mt-1 flex justify-center">
                  <span
                    class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-sm"
                    >{{ exam.category }} {{ exam.level }}</span
                  >
                </div>
              </div>

              <!-- 试卷内容 - 纸张样式 -->
              <div class="p-4 text-sm">
                <!-- 试卷基本信息 -->
                <div class="space-y-1.5 mb-4 border-b border-gray-100 pb-3">
                  <div class="flex justify-between">
                    <span class="text-gray-500">总分:</span>
                    <span class="text-gray-800 font-medium"
                      >{{ exam.totalPoints }}分</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">及格分数:</span>
                    <span class="text-gray-800 font-medium"
                      >{{ Math.ceil(exam.totalPoints * 0.6) }}分</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">考试时长:</span>
                    <span class="text-gray-800 font-medium">{{
                      exam.duration
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">题目总数:</span>
                    <span class="text-gray-800 font-medium"
                      >{{ getTotalQuestions(exam) }}题</span
                    >
                  </div>
                </div>

                <!-- 试卷内容列表 - 模拟A4纸中间部分 -->
                <div class="space-y-4">
                  <!-- 动态生成部分 -->
                  <div v-for="(section, index) in exam.sections" :key="index">
                    <div class="flex items-center mb-1.5">
                      <div class="w-1.5 h-3 bg-gray-300 mr-2"></div>
                      <h4
                        class="text-xs font-semibold uppercase tracking-wide text-gray-600"
                      >
                        第{{ numberToChinese(index + 1) }}部分
                      </h4>
                    </div>
                    <div class="ml-3.5 space-y-1.5">
                      <p class="text-gray-800">
                        {{ section.type }} ({{ section.count }}题)
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ getSectionDescription(section) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- 试卷注意事项 - 模拟A4纸底部说明 -->
                <div
                  class="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500"
                >
                  <p class="font-medium mb-1">注意事项:</p>
                  <ul
                    class="list-disc list-inside space-y-0.5 text-gray-500 text-xs"
                  >
                    <li>请仔细阅读每道题目的要求</li>
                    <li>作答时请注意代码规范</li>
                    <li>提交前请检查所有答案</li>
                  </ul>
                </div>
              </div>

              <!-- 试卷尾部 - 模拟A4纸页脚 -->
              <div
                class="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center"
              >
                <div class="text-xs text-gray-500">
                  <div>创建日期: {{ formatDate(exam.createdAt) }}</div>
                </div>
                <button
                  @click="startExam(exam.id)"
                  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-sm transition-colors"
                >
                  {{ exam.status === "completed" ? "再次做题" : "开始做题" }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMoreExams" class="flex justify-center mt-6">
          <button
            @click="loadMoreExams"
            class="px-5 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            :disabled="isLoading"
          >
            <span v-if="isLoading">加载中...</span>
            <span v-else>加载更多</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 瀑布流布局样式 */
.masonry-container {
  column-count: 1;
  column-gap: 1rem;
  width: 100%;
}

@media (min-width: 640px) {
  .masonry-container {
    column-count: 2;
  }
}

@media (min-width: 768px) {
  .masonry-container {
    column-count: 3;
  }
}

@media (min-width: 1024px) {
  .masonry-container {
    column-count: 4;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}
</style>
