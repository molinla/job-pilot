// 认证服务
import apiClient, { type ApiResponse } from "./api";

// 用户信息接口
export interface User {
	id: string;
	username: string;
	email: string;
	studyStage?: string;
	position?: string;
	avatarUrl?: string;
	createdAt: string;
	updatedAt: string;
}

// 登录请求接口
export interface LoginRequest {
	email: string;
	password: string;
}

// 注册请求接口
export interface RegisterRequest {
	username: string;
	email: string;
	password: string;
	studyStage?: string;
	position?: string;
}

// 登录响应接口
export interface LoginResponse {
	token: string;
	user: User;
}

// 认证服务类
class AuthService {
	// 用户注册
	async register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			"/auth/register",
			data,
		);

		if (response.data.success && response.data.data) {
			// 保存 token 和用户信息
			localStorage.setItem("auth_token", response.data.data.token);
			localStorage.setItem(
				"user_info",
				JSON.stringify(response.data.data.user),
			);
		}

		return response.data;
	}

	// 用户登录
	async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
		const response = await apiClient.post<ApiResponse<LoginResponse>>(
			"/auth/login",
			data,
		);

		if (response.data.success && response.data.data) {
			// 保存 token 和用户信息
			localStorage.setItem("auth_token", response.data.data.token);
			localStorage.setItem(
				"user_info",
				JSON.stringify(response.data.data.user),
			);
		}

		return response.data;
	}

	// 获取当前用户信息
	async getCurrentUser(): Promise<ApiResponse<User>> {
		const response = await apiClient.get<ApiResponse<User>>("/auth/me");

		if (response.data.success && response.data.data) {
			// 更新本地用户信息
			localStorage.setItem("user_info", JSON.stringify(response.data.data));
		}

		return response.data;
	}

	// 退出登录
	logout(): void {
		localStorage.removeItem("auth_token");
		localStorage.removeItem("user_info");
		// 可以在这里添加其他清理逻辑
	}

	// 检查是否已登录
	isAuthenticated(): boolean {
		return !!localStorage.getItem("auth_token");
	}

	// 获取本地存储的用户信息
	getLocalUser(): User | null {
		const userInfo = localStorage.getItem("user_info");
		return userInfo ? JSON.parse(userInfo) : null;
	}

	// 获取本地存储的 token
	getToken(): string | null {
		return localStorage.getItem("auth_token");
	}
}

// 导出单例实例
export const authService = new AuthService();
export default authService;
