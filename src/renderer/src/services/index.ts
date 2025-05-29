// 统一的服务导出文件
export { default as apiClient } from "./api";
export type { ApiResponse, PaginatedResponse } from "./api";

export { default as authService } from "./authService";
export type {
	User,
	LoginRequest,
	RegisterRequest,
	LoginResponse,
} from "./authService";

export { default as questionService } from "./questionService";
export type {
	Question,
	Difficulty,
	KnowledgePoint,
	QuestionQueryParams,
	CreateQuestionRequest,
	UpdateQuestionRequest,
} from "./questionService";

export { default as paperService } from "./paperService";
export type {
	Paper,
	PaperQueryParams,
	CreatePaperRequest,
	UpdatePaperRequest,
	GeneratePaperRequest,
} from "./paperService";

export { default as statisticsService } from "./statisticsService";
export type {
	SystemStatistics,
	ActivityStatistics,
	QuestionStatistics,
	UserLearningStatistics,
	UpdateUserStatisticsRequest,
} from "./statisticsService";

export { default as interviewService } from "./interviewService";
export type {
	InterviewRecord,
	InterviewQueryParams,
	CreateInterviewRequest,
	UpdateInterviewRequest,
	InterviewStatistics,
} from "./interviewService";

// 保留原有的服务
export { default as indexedDbService } from "./indexedDbService";
export * as openaiService from "./openaiService";
