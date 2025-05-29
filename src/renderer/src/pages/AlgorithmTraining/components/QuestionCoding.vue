<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { appTheme } from "../../../config/theme";
import { getAlgorithmAnalysisStream } from "../../../services/openaiService";
import { marked } from "marked";

// Monaco编辑器选项接口
interface MonacoEditorOptions {
	value: string;
	language: string;
	theme: string;
	fontSize: number;
	minimap: { enabled: boolean };
	automaticLayout: boolean;
	scrollBeyondLastLine: boolean;
}

// 声明Monaco编辑器的全局类型
declare global {
	interface Window {
		monaco: unknown;
		MonacoEnvironment?: {
			getWorkerUrl: (moduleId: string, label: string) => string;
		};
		amdRequire?: unknown;
	}
}

// 定义Monaco编辑器实例接口
interface MonacoEditorInstance {
	getValue: () => string;
	onDidChangeModelContent: (callback: () => void) => void;
}

// 定义测试用例接口
interface Example {
	input: string;
	output: string;
	explanation?: string;
}

// 定义运行结果接口
interface RunResult {
	output: string;
	success: boolean;
	error?: string;
}

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
const editorContainer = ref<HTMLElement | null>(null);
let monacoEditor: MonacoEditorInstance | null = null;

// 运行结果
const runResult = ref<RunResult | null>(null);

// AI解析相关变量
const analysisResult = ref("");
const parsedAnalysisResult = ref(""); // 存储解析后的HTML
const isLoadingAnalysis = ref(false);
const analysisError = ref("");
const showAnalysis = ref(false);

// 监听解析结果变化，将Markdown转换为HTML
watch(analysisResult, async (newValue) => {
	if (newValue) {
		// 手动将 Markdown 转换为 HTML
		const html = String(newValue)
			.replace(
				/```(\w*)([\s\S]*?)```/g,
				'<pre><code class="language-$1">$2</code></pre>',
			) // 代码块
			.replace(/`([^`]+)`/g, "<code>$1</code>") // 行内代码
			.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>") // 粗体
			.replace(/\*([^*]+)\*/g, "<em>$1</em>") // 斜体
			.replace(/#{6}\s+([^\n]+)/g, "<h6>$1</h6>") // h6
			.replace(/#{5}\s+([^\n]+)/g, "<h5>$1</h5>") // h5
			.replace(/#{4}\s+([^\n]+)/g, "<h4>$1</h4>") // h4
			.replace(/#{3}\s+([^\n]+)/g, "<h3>$1</h3>") // h3
			.replace(/#{2}\s+([^\n]+)/g, "<h2>$1</h2>") // h2
			.replace(/#{1}\s+([^\n]+)/g, "<h1>$1</h1>") // h1
			.replace(/\n\n/g, "<br><br>") // 段落
			.replace(/\n/g, "<br>") // 换行
			.replace(/- ([^\n]+)/g, "<li>$1</li>") // 无序列表项
			.replace(/\d+\.\s+([^\n]+)/g, "<li>$1</li>"); // 有序列表项

		parsedAnalysisResult.value = html;
	}
});

// 监听代码变化
const handleCodeChange = (newValue: string) => {
	emit("answer", { questionId: props.question.id, answer: newValue });
};

// 是否为错题
const isWrongQuestion = computed(() => props.question.isWrong);

// 执行JavaScript代码 - 使用Function构造函数替代eval
const executeJsCode = (code: string, example: Example): RunResult => {
	try {
		// 创建一个安全的执行环境
		const consoleLogs: string[] = [];
		const mockConsole = {
			log: (...args: unknown[]) => {
				consoleLogs.push(
					args
						.map((arg) =>
							typeof arg === "object" ? JSON.stringify(arg) : String(arg),
						)
						.join(" "),
				);
			},
		};

		// 准备输入示例中的表达式
		const inputExpr = example.input || "";

		// 移除函数调用部分，只保留函数定义
		const globalCode = `
			// 定义用户代码
			${code}
			
			// 设置模拟控制台
			const origConsole = console;
			console = {
				log: function(...args) {
					return mockConsole.log(...args);
				}
			};
			
			// 执行测试用例
			try {
				${inputExpr}
			} finally {
				console = origConsole;
			}
		`;

		// 使用Function构造函数代替eval
		// eslint-disable-next-line no-new-func
		const executeFn = new Function("mockConsole", globalCode);
		executeFn(mockConsole);

		// 返回结果
		return {
			output: consoleLogs.join("\n"),
			success: true,
		};
	} catch (error) {
		return {
			output: "",
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};

// 检查答案是否正确
const checkAnswer = (example: Example, result: RunResult): boolean => {
	// 对于编程题，我们检查输出是否符合预期
	if (!result.success) return false;

	// 特别处理对象类型的输出
	if (example.output.includes("{") && example.output.includes("}")) {
		try {
			// 把字符串输出的对象表示转换为实际对象来比较
			const expectedObj = JSON.parse(
				example.output.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'),
			);
			const actualOutput = result.output.trim();

			// 尝试将实际输出解析为对象
			let actualObj: Record<string, unknown>;
			try {
				actualObj = JSON.parse(
					actualOutput.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'),
				);
			} catch {
				// 如果不能解析成对象，尝试使用Function构造函数
				try {
					// eslint-disable-next-line no-new-func
					actualObj = new Function(`return ${actualOutput}`)();
				} catch {
					return false;
				}
			}

			// 比较两个对象是否相等
			return JSON.stringify(expectedObj) === JSON.stringify(actualObj);
		} catch (e) {
			// 如果解析失败，回退到直接比较
			return result.output.includes(example.output);
		}
	}

	// 直接比较输出
	return (
		result.output.includes(example.output) ||
		example.output.includes(result.output)
	);
};

// 运行代码
const runCode = () => {
	if (!props.question.examples || props.question.examples.length === 0) {
		runResult.value = {
			output: "没有可用的测试用例",
			success: false,
		};
		return;
	}

	const example = props.question.examples[0];

	// 目前只支持JavaScript
	if (props.question.language.toLowerCase() === "javascript") {
		const result = executeJsCode(codeAnswer.value, example);
		runResult.value = result;

		// 检查答案
		if (result.success) {
			result.success = checkAnswer(example, result);
		}
	} else {
		runResult.value = {
			output: `不支持的语言: ${props.question.language}`,
			success: false,
		};
	}
};

// 获取AI解析 - 使用流式API
const loadAnalysis = async () => {
	// 如果已经有结果，切换显示/隐藏状态
	if (analysisResult.value) {
		showAnalysis.value = !showAnalysis.value;
		return;
	}

	showAnalysis.value = true;
	isLoadingAnalysis.value = true;
	analysisError.value = "";
	analysisResult.value = "";

	try {
		await getAlgorithmAnalysisStream(
			{
				questionContent: props.question.content,
				questionDescription: props.question.description,
				codeAnswer: codeAnswer.value,
			},
			(chunk) => {
				// 每接收到一个数据块，就追加到结果中
				analysisResult.value += chunk;
			},
		);
	} catch (err) {
		analysisError.value = err instanceof Error ? err.message : "获取AI解析失败";
	} finally {
		isLoadingAnalysis.value = false;
	}
};

// 初始化编辑器
onMounted(async () => {
	// 等待DOM更新完成
	await nextTick();

	// 等待Monaco编辑器加载完成
	const waitForMonaco = () => {
		return new Promise<void>((resolve) => {
			const checkMonacoLoaded = () => {
				if (window.monaco) {
					resolve();
				} else {
					// 监听Monaco加载完成事件
					window.addEventListener(
						"monaco-editor-loaded",
						() => {
							resolve();
						},
						{ once: true },
					);

					// 设置超时，如果事件没有触发
					setTimeout(() => {
						if (!window.monaco) {
							console.error("Monaco编辑器加载超时");
							resolve(); // 仍然解析promise以避免卡住
						}
					}, 5000);
				}
			};

			checkMonacoLoaded();
		});
	};

	// 等待Monaco加载
	await waitForMonaco();

	// 如果Monaco已加载且DOM元素就绪
	if (window.monaco && editorContainer.value) {
		try {
			// 创建编辑器实例
			// @ts-ignore - 忽略类型错误，因为我们已经确认monaco存在
			monacoEditor = window.monaco.editor.create(editorContainer.value, {
				value: codeAnswer.value,
				language: props.question.language
					? props.question.language.toLowerCase()
					: "java",
				theme: "vs",
				fontSize: 14,
				minimap: { enabled: false },
				automaticLayout: true,
				scrollBeyondLastLine: false,
			});

			// 监听编辑器内容变化
			if (monacoEditor) {
				monacoEditor.onDidChangeModelContent(() => {
					if (monacoEditor) {
						const value = monacoEditor.getValue();
						codeAnswer.value = value;
						handleCodeChange(value);
					}
				});
			}
		} catch (error) {
			console.error("Monaco编辑器创建失败:", error);
		}
	} else {
		console.error("Monaco编辑器或容器元素不可用");
	}
});
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
				@click="loadAnalysis"
				:style="`color: ${appTheme.primary.base}`"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					:class="{ 'rotate-180': showAnalysis && analysisResult }"
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
            
            <!-- AI解析结果 -->
            <div v-if="showAnalysis" class="mb-4 mt-4">
                <div class="text-xs font-medium mb-2" :style="`color: ${appTheme.primary.dark}`">
                    AI解析:
                </div>
                <!-- 加载中状态 -->
                <div v-if="isLoadingAnalysis && !analysisResult" class="flex items-center p-4 bg-gray-50 rounded-lg">
                    <svg class="animate-spin h-5 w-5 mr-3" :style="`color: ${appTheme.primary.base}`" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span class="text-sm text-gray-500">正在生成AI解析，请稍候...</span>
                </div>
                
                <!-- 错误状态 -->
                <div v-else-if="analysisError" class="rounded-lg bg-red-50 p-4 border border-red-100">
                    <div class="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <div>
                            <h3 class="text-sm font-medium text-red-800">生成解析时发生错误</h3>
                            <p class="mt-1 text-sm text-red-700">{{ analysisError }}</p>
                            <button 
                                @click="loadAnalysis" 
                                class="mt-3 text-xs font-medium rounded px-3 py-1.5"
                                :style="`background-color: ${appTheme.primary.base}; color: white`"
                            >
                                重试
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- 解析结果 -->
                <div v-else-if="analysisResult" class="bg-gray-50 p-4 rounded-lg">
                    <!-- 流式结果和加载指示器 -->
                    <div class="prose prose-sm max-w-none markdown-body">
                        <!-- 使用v-html渲染解析后的Markdown -->
                        <div v-html="parsedAnalysisResult"></div>
                        
                        <!-- 仍在加载时显示打字指示器 -->
                        <span v-if="isLoadingAnalysis" class="typing-indicator">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                        </span>
                    </div>
                </div>
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
				<div ref="editorContainer" style="width: 800px; height: 400px"></div>

				<!-- 运行结果 -->
				<div v-if="runResult" class="border-t border-gray-200 p-3">
					<div
						class="text-xs font-medium mb-2"
						:style="`color: ${runResult.success ? appTheme.status.success : appTheme.status.error}`"
					>
						<span v-if="runResult.success">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							测试通过
						</span>
						<span v-else>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
							测试失败
						</span>
					</div>
					<div class="bg-gray-50 p-2 rounded text-sm font-mono overflow-auto max-h-32">
						<div v-if="runResult.error" class="text-red-500">{{ runResult.error }}</div>
						<div v-else>{{ runResult.output || '(无输出)' }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* 打字指示器动画 */
.typing-indicator {
    display: inline-flex;
    align-items: center;
    margin-left: 4px;
}

.dot {
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    margin: 0 1px;
    background-color: currentColor;
    animation: blink 1.4s infinite both;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes blink {
    0% {
        opacity: 0.2;
    }
    20% {
        opacity: 1;
    }
    100% {
        opacity: 0.2;
    }
}

/* Markdown样式调整 */
.markdown-body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #222;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;
}

.markdown-body h1 {
    font-size: 1.5em;
}

.markdown-body h2 {
    font-size: 1.25em;
}

.markdown-body h3 {
    font-size: 1.125em;
}

.markdown-body code {
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 85%;
    margin: 0;
    padding: 0.2em 0.4em;
}

.markdown-body pre {
    background-color: #f6f8fa;
    border-radius: 3px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 85%;
    line-height: 1.45;
    overflow: auto;
    padding: 16px;
}

.markdown-body pre code {
    background-color: transparent;
    border: 0;
    display: inline;
    line-height: inherit;
    margin: 0;
    max-width: auto;
    overflow: visible;
    padding: 0;
    word-wrap: normal;
}

.markdown-body ul, 
.markdown-body ol {
    padding-left: 2em;
}

.markdown-body ul {
    list-style-type: disc;
}

.markdown-body ol {
    list-style-type: decimal;
}

.markdown-body blockquote {
    border-left: 0.25em solid #dfe2e5;
    color: #6a737d;
    padding: 0 1em;
}

.markdown-body table {
    border-collapse: collapse;
    display: block;
    overflow: auto;
    width: 100%;
}

.markdown-body table th,
.markdown-body table td {
    border: 1px solid #dfe2e5;
    padding: 6px 13px;
}

.markdown-body table tr {
    background-color: #fff;
    border-top: 1px solid #c6cbd1;
}

.markdown-body table tr:nth-child(2n) {
    background-color: #f6f8fa;
}
</style>
