// 题目管理服务
import apiClient, { type ApiResponse, type PaginatedResponse } from "./api";

// 题目接口
export interface Question {
	id: string;
	title: string;
	content: string;
	referenceAnswer: string;
	difficultyId: string;
	difficulty?: Difficulty;
	knowledgePointIds?: string[];
	knowledgePoints?: KnowledgePoint[];
	status: "ACTIVE" | "INACTIVE";
	createdAt: string;
	updatedAt: string;
}

// 难度等级接口
export interface Difficulty {
	id: string;
	name: string;
	level: number;
	description?: string;
	createdAt: string;
	updatedAt: string;
}

// 知识点接口
export interface KnowledgePoint {
	id: string;
	name: string;
	parentId?: string;
	parent?: KnowledgePoint;
	children?: KnowledgePoint[];
	createdAt: string;
	updatedAt: string;
}

// 题目查询参数
export interface QuestionQueryParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	difficulty?: string;
	category?: string;
	status?: "ACTIVE" | "INACTIVE";
}

// 创建题目请求
export interface CreateQuestionRequest {
	title: string;
	content: string;
	referenceAnswer: string;
	difficultyId: string;
	knowledgePointIds?: string[];
}

// 更新题目请求
export interface UpdateQuestionRequest {
	title?: string;
	content?: string;
	referenceAnswer?: string;
	difficultyId?: string;
	status?: "ACTIVE" | "INACTIVE";
	knowledgePointIds?: string[];
}

// 题目服务类
class QuestionService {
	// 获取题目列表
	async getQuestions(
		params?: QuestionQueryParams,
	): Promise<ApiResponse<PaginatedResponse<Question>>> {
		const response = await apiClient.get<
			ApiResponse<PaginatedResponse<Question>>
		>("/questions", {
			params,
		});
		return response.data;
	}

	// 获取单个题目
	async getQuestion(id: string): Promise<ApiResponse<Question>> {
		const response = await apiClient.get<ApiResponse<Question>>(
			`/questions/${id}`,
		);
		return response.data;
	}

	// 创建题目
	async createQuestion(
		data: CreateQuestionRequest,
	): Promise<ApiResponse<Question>> {
		const response = await apiClient.post<ApiResponse<Question>>(
			"/questions",
			data,
		);
		return response.data;
	}

	// 更新题目
	async updateQuestion(
		id: string,
		data: UpdateQuestionRequest,
	): Promise<ApiResponse<Question>> {
		const response = await apiClient.patch<ApiResponse<Question>>(
			`/questions/${id}`,
			data,
		);
		return response.data;
	}

	// 删除题目
	async deleteQuestion(id: string): Promise<ApiResponse<void>> {
		const response = await apiClient.delete<ApiResponse<void>>(
			`/questions/${id}`,
		);
		return response.data;
	}

	// 获取所有难度等级
	async getAllDifficulties(): Promise<ApiResponse<Difficulty[]>> {
		const response =
			await apiClient.get<ApiResponse<Difficulty[]>>("/difficulties/all");
		return response.data;
	}

	// 获取难度等级列表（分页）
	async getDifficulties(params?: { page?: number; limit?: number }): Promise<
		ApiResponse<PaginatedResponse<Difficulty>>
	> {
		const response = await apiClient.get<
			ApiResponse<PaginatedResponse<Difficulty>>
		>("/difficulties", {
			params,
		});
		return response.data;
	}

	// 获取知识点树形结构
	async getKnowledgePointTree(): Promise<ApiResponse<KnowledgePoint[]>> {
		const response = await apiClient.get<ApiResponse<KnowledgePoint[]>>(
			"/knowledge-points/tree",
		);
		return response.data;
	}

	// 获取所有知识点
	async getAllKnowledgePoints(): Promise<ApiResponse<KnowledgePoint[]>> {
		const response = await apiClient.get<ApiResponse<KnowledgePoint[]>>(
			"/knowledge-points/all",
		);
		return response.data;
	}

	// 获取知识点列表（分页）
	async getKnowledgePoints(params?: {
		page?: number;
		limit?: number;
		parentId?: string;
		search?: string;
	}): Promise<ApiResponse<PaginatedResponse<KnowledgePoint>>> {
		const response = await apiClient.get<
			ApiResponse<PaginatedResponse<KnowledgePoint>>
		>("/knowledge-points", {
			params,
		});
		return response.data;
	}
}

// 导出单例实例
export const questionService = new QuestionService();
export default questionService;
