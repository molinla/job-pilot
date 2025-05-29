// API 服务基础配置
import axios, { type AxiosInstance, type AxiosResponse } from "axios";

// API 基础配置
const BASE_URL = "http://localhost:3001/api";

// 通用响应格式
export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data: T;
	error?: string;
}

// 分页响应格式
export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// 响应拦截器 - 统一处理响应和错误
apiClient.interceptors.response.use(
	(response: AxiosResponse<ApiResponse>) => {
		return response;
	},
	(error) => {
		// 处理 401 未认证错误
		if (error.response?.status === 401) {
			localStorage.removeItem("auth_token");
			localStorage.removeItem("user_info");
			// 可以在这里触发登录页面跳转
			window.location.href = "/login";
		}

		// 处理其他错误
		const errorMessage =
			error.response?.data?.message || error.message || "请求失败";
		console.error("API Error:", errorMessage);

		return Promise.reject(error);
	},
);

export { apiClient };
export default apiClient;
