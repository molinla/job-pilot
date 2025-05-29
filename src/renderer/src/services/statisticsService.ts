// 统计数据服务
import apiClient, { type ApiResponse } from "./api";

// 系统总体统计接口
export interface SystemStatistics {
	totalUsers: number;
	totalQuestions: number;
	totalPapers: number;
	activeUsers: number;
	questionsToday: number;
	papersToday: number;
}

// 用户活跃度统计接口
export interface ActivityStatistics {
	date: string;
	activeUsers: number;
	newUsers: number;
	questionsAnswered: number;
	papersCompleted: number;
}

// 题目统计接口
export interface QuestionStatistics {
	totalQuestions: number;
	questionsByDifficulty: Array<{
		difficulty: string;
		count: number;
	}>;
	questionsByKnowledgePoint: Array<{
		knowledgePoint: string;
		count: number;
	}>;
	activeQuestions: number;
	inactiveQuestions: number;
}

// 用户学习统计接口
export interface UserLearningStatistics {
	activeDays: number;
	totalQuestions: number;
	correctRate: number;
	studyTime: number;
	completedPapers: number;
	averageScore: number;
	knowledgePointProgress: Array<{
		knowledgePoint: string;
		progress: number;
		totalQuestions: number;
		correctQuestions: number;
	}>;
	difficultyProgress: Array<{
		difficulty: string;
		progress: number;
		totalQuestions: number;
		correctQuestions: number;
	}>;
}

// 更新用户统计请求
export interface UpdateUserStatisticsRequest {
	activeDays?: number;
	totalQuestions?: number;
	correctRate?: number;
}

// 统计服务类
class StatisticsService {
	// 获取系统总体统计
	async getSystemStatistics(): Promise<ApiResponse<SystemStatistics>> {
		const response =
			await apiClient.get<ApiResponse<SystemStatistics>>("/statistics/system");
		return response.data;
	}

	// 获取用户活跃度统计
	async getActivityStatistics(
		days?: number,
	): Promise<ApiResponse<ActivityStatistics[]>> {
		const response = await apiClient.get<ApiResponse<ActivityStatistics[]>>(
			"/statistics/activity",
			{
				params: { days },
			},
		);
		return response.data;
	}

	// 获取题目统计
	async getQuestionStatistics(): Promise<ApiResponse<QuestionStatistics>> {
		const response = await apiClient.get<ApiResponse<QuestionStatistics>>(
			"/statistics/questions",
		);
		return response.data;
	}

	// 获取用户学习统计
	async getUserLearningStatistics(
		userId: string,
	): Promise<ApiResponse<UserLearningStatistics>> {
		const response = await apiClient.get<ApiResponse<UserLearningStatistics>>(
			`/statistics/users/${userId}/learning`,
		);
		return response.data;
	}

	// 更新用户统计数据
	async updateUserStatistics(
		userId: string,
		data: UpdateUserStatisticsRequest,
	): Promise<ApiResponse<void>> {
		const response = await apiClient.post<ApiResponse<void>>(
			`/statistics/users/${userId}`,
			data,
		);
		return response.data;
	}

	// 获取当前用户的学习统计（便捷方法）
	async getCurrentUserLearningStatistics(): Promise<
		ApiResponse<UserLearningStatistics>
	> {
		// 这里假设后端会根据 token 自动识别当前用户
		const response = await apiClient.get<ApiResponse<UserLearningStatistics>>(
			"/statistics/users/me/learning",
		);
		return response.data;
	}

	// 更新当前用户统计数据（便捷方法）
	async updateCurrentUserStatistics(
		data: UpdateUserStatisticsRequest,
	): Promise<ApiResponse<void>> {
		const response = await apiClient.post<ApiResponse<void>>(
			"/statistics/users/me",
			data,
		);
		return response.data;
	}
}

// 导出单例实例
export const statisticsService = new StatisticsService();
export default statisticsService;
