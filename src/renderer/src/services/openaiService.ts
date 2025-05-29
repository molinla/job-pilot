import axios from "axios";

// OpenAI API配置
const API_URL =
	import.meta.env.VITE_OPENAI_API_URL ||
	"https://api.openai.com/v1/chat/completions";
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// 检查API密钥是否存在
if (!API_KEY) {
	throw new Error(
		"OpenAI API密钥未配置，请在.env文件中设置VITE_OPENAI_API_KEY",
	);
}

// 创建API实例
const apiInstance = axios.create({
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${API_KEY}`,
	},
});

// 接口定义
interface AIAnalysisRequest {
	questionContent: string;
	questionDescription: string;
	codeAnswer: string;
}

/**
 * 获取算法题AI解析 - 流式响应
 * @param data 请求数据
 * @param onChunk 接收流式内容的回调函数
 * @returns 完成的Promise
 */
export const getAlgorithmAnalysisStream = async (
	data: AIAnalysisRequest,
	onChunk: (chunk: string) => void,
): Promise<void> => {
	try {
		const response = await fetch(API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${API_KEY}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content:
							"你是一个专业的算法导师，请对用户提交的代码进行详细分析，包括时间复杂度、空间复杂度、关键算法思路解析，并给出优化建议。请使用Markdown格式输出结果，以提高可读性。",
					},
					{
						role: "user",
						content: `
题目: ${data.questionContent}
描述: ${data.questionDescription}
我的代码: 
\`\`\`javascript
${data.codeAnswer}
\`\`\`
请提供详细解析，包括:
1. 代码的基本思路
2. 时间复杂度和空间复杂度分析
3. 可能的优化方向
4. 算法的关键点讲解
            `,
					},
				],
				temperature: 0.7,
				max_tokens: 2000,
				stream: true, // 启用流式响应
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`API错误 (${response.status}): ${errorData.error?.message || "未知错误"}`,
			);
		}

		if (!response.body) {
			throw new Error("响应体为空");
		}

		// 处理流式响应
		const reader = response.body.getReader();
		const decoder = new TextDecoder("utf-8");
		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// 解码二进制数据
			const chunk = decoder.decode(value, { stream: true });
			buffer += chunk;

			// 处理数据行
			const lines = buffer.split("\n");
			buffer = lines.pop() || ""; // 保留最后一个不完整的行到buffer

			for (const line of lines) {
				if (line.trim() === "") continue;
				if (line.trim() === "data: [DONE]") continue;

				// 从行中提取JSON部分
				const jsonStr = line.replace(/^data: /, "").trim();
				if (!jsonStr) continue;

				try {
					const json = JSON.parse(jsonStr);
					const content = json.choices[0]?.delta?.content || "";
					if (content) {
						onChunk(content);
					}
				} catch (e) {
					console.warn("解析流式数据失败:", e);
				}
			}
		}
	} catch (error) {
		console.error("OpenAI API 调用失败:", error);
		throw error;
	}
};

/**
 * 获取算法题AI解析 - 非流式响应（保留向后兼容）
 * @param data 请求数据
 * @returns AI解析结果
 */
export const getAlgorithmAnalysis = async (
	data: AIAnalysisRequest,
): Promise<string> => {
	try {
		const response = await apiInstance.post(API_URL, {
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content:
						"你是一个专业的算法导师，请对用户提交的代码进行详细分析，包括时间复杂度、空间复杂度、关键算法思路解析，并给出优化建议。请使用Markdown格式输出结果，以提高可读性。",
				},
				{
					role: "user",
					content: `
题目: ${data.questionContent}
描述: ${data.questionDescription}
我的代码: 
\`\`\`javascript
${data.codeAnswer}
\`\`\`
请提供详细解析，包括:
1. 代码的基本思路
2. 时间复杂度和空间复杂度分析
3. 可能的优化方向
4. 算法的关键点讲解
            `,
				},
			],
			temperature: 0.7,
			max_tokens: 2000,
		});

		// 返回AI生成的内容
		return response.data.choices[0].message.content;
	} catch (error) {
		console.error("OpenAI API 调用失败:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(
				`API错误 (${error.response.status}): ${error.response.data.error?.message || "未知错误"}`,
			);
		}
		throw new Error("网络错误，请检查网络连接");
	}
};
