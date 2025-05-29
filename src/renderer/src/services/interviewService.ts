// 面试服务
import apiClient, { type ApiResponse, type PaginatedResponse } from "./api";

// 面试记录接口
export interface InterviewRecord {
	id: string;
	title: string;
	company: string;
	position: string;
	tags: string[];
	description: string;
	date: string;
	duration: string;
	status: "PENDING" | "COMPLETED" | "REVIEWED";
	score?: number;
	feedback?: string;
	createdAt: string;
	updatedAt: string;
}

// 面试查询参数
export interface InterviewQueryParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	status?: "PENDING" | "COMPLETED" | "REVIEWED";
	company?: string;
	position?: string;
}

// 创建面试记录请求
export interface CreateInterviewRequest {
	title: string;
	company: string;
	position: string;
	tags?: string[];
	description?: string;
	duration?: string;
}

// 更新面试记录请求
export interface UpdateInterviewRequest {
	title?: string;
	company?: string;
	position?: string;
	tags?: string[];
	description?: string;
	duration?: string;
	status?: "PENDING" | "COMPLETED" | "REVIEWED";
	score?: number;
	feedback?: string;
}

// 面试统计接口
export interface InterviewStatistics {
	totalInterviews: number;
	completedInterviews: number;
	averageScore: number;
	averageDuration: string;
	topCompanies: Array<{
		company: string;
		count: number;
	}>;
	topPositions: Array<{
		position: string;
		count: number;
	}>;
}

// 面试服务类
class InterviewService {
	// 获取面试记录列表
	async getInterviews(
		params?: InterviewQueryParams,
	): Promise<ApiResponse<PaginatedResponse<InterviewRecord>>> {
		const response = await apiClient.get<
			ApiResponse<PaginatedResponse<InterviewRecord>>
		>("/interviews", {
			params,
		});
		return response.data;
	}

	// 获取单个面试记录
	async getInterview(id: string): Promise<ApiResponse<InterviewRecord>> {
		const response = await apiClient.get<ApiResponse<InterviewRecord>>(
			`/interviews/${id}`,
		);
		return response.data;
	}

	// 创建面试记录
	async createInterview(
		data: CreateInterviewRequest,
	): Promise<ApiResponse<InterviewRecord>> {
		const response = await apiClient.post<ApiResponse<InterviewRecord>>(
			"/interviews",
			data,
		);
		return response.data;
	}

	// 更新面试记录
	async updateInterview(
		id: string,
		data: UpdateInterviewRequest,
	): Promise<ApiResponse<InterviewRecord>> {
		const response = await apiClient.patch<ApiResponse<InterviewRecord>>(
			`/interviews/${id}`,
			data,
		);
		return response.data;
	}

	// 删除面试记录
	async deleteInterview(id: string): Promise<ApiResponse<void>> {
		const response = await apiClient.delete<ApiResponse<void>>(
			`/interviews/${id}`,
		);
		return response.data;
	}

	// 获取面试统计数据
	async getInterviewStatistics(): Promise<ApiResponse<InterviewStatistics>> {
		const response = await apiClient.get<ApiResponse<InterviewStatistics>>(
			"/interviews/statistics",
		);
		return response.data;
	}

	// 批量删除面试记录
	async batchDeleteInterviews(ids: string[]): Promise<ApiResponse<void>> {
		const response = await apiClient.post<ApiResponse<void>>(
			"/interviews/batch-delete",
			{ ids },
		);
		return response.data;
	}
}

// 导出单例实例
export const interviewService = new InterviewService();
export default interviewService;
