// 试卷管理服务
import apiClient, { type ApiResponse, type PaginatedResponse } from "./api";
import type { Question } from "./questionService";

// 试卷接口
export interface Paper {
	id: string;
	name: string;
	description?: string;
	questionIds: string[];
	questions?: Question[];
	timeLimit?: number;
	totalScore?: number;
	createdAt: string;
	updatedAt: string;
}

// 试卷查询参数
export interface PaperQueryParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	search?: string;
}

// 创建试卷请求
export interface CreatePaperRequest {
	name: string;
	description?: string;
	questionIds: string[];
	timeLimit?: number;
	totalScore?: number;
}

// 更新试卷请求
export interface UpdatePaperRequest {
	name?: string;
	description?: string;
	questionIds?: string[];
	timeLimit?: number;
	totalScore?: number;
}

// 生成试卷请求
export interface GeneratePaperRequest {
	name: string;
	description?: string;
	difficultyDistribution?: Record<string, number>;
	knowledgePointIds?: string[];
	totalQuestions?: number;
	timeLimit?: number;
}

// 试卷服务类
class PaperService {
	// 获取试卷列表
	async getPapers(
		params?: PaperQueryParams,
	): Promise<ApiResponse<PaginatedResponse<Paper>>> {
		const response = await apiClient.get<ApiResponse<PaginatedResponse<Paper>>>(
			"/papers",
			{
				params,
			},
		);
		return response.data;
	}

	// 获取单个试卷详情
	async getPaper(id: string): Promise<ApiResponse<Paper>> {
		const response = await apiClient.get<ApiResponse<Paper>>(`/papers/${id}`);
		return response.data;
	}

	// 创建试卷
	async createPaper(data: CreatePaperRequest): Promise<ApiResponse<Paper>> {
		const response = await apiClient.post<ApiResponse<Paper>>("/papers", data);
		return response.data;
	}

	// 更新试卷
	async updatePaper(
		id: string,
		data: UpdatePaperRequest,
	): Promise<ApiResponse<Paper>> {
		const response = await apiClient.patch<ApiResponse<Paper>>(
			`/papers/${id}`,
			data,
		);
		return response.data;
	}

	// 删除试卷
	async deletePaper(id: string): Promise<ApiResponse<void>> {
		const response = await apiClient.delete<ApiResponse<void>>(`/papers/${id}`);
		return response.data;
	}

	// 根据条件生成试卷
	async generatePaper(data: GeneratePaperRequest): Promise<ApiResponse<Paper>> {
		const response = await apiClient.post<ApiResponse<Paper>>(
			"/papers/generate",
			data,
		);
		return response.data;
	}
}

// 导出单例实例
export const paperService = new PaperService();
export default paperService;
