<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <!-- 背景光晕效果 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl"></div>
      <div class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-400 opacity-20 blur-3xl"></div>
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-white text-2xl font-bold">职</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900">职捷径</h1>
        <p class="text-gray-600 mt-2">AI 驱动的求职面试助手</p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
        <div class="mb-6">
          <div class="flex space-x-1 mb-6">
            <button
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                isLogin ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              ]"
              @click="isLogin = true"
            >
              登录
            </button>
            <button
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                !isLogin ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              ]"
              @click="isLogin = false"
            >
              注册
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 用户名（仅注册时显示） -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <input
              v-model="form.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="请输入用户名"
            />
          </div>

          <!-- 邮箱 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="请输入邮箱地址"
            />
          </div>

          <!-- 密码 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="请输入密码"
            />
          </div>

          <!-- 学习阶段（仅注册时显示） -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-700 mb-1">学习阶段</label>
            <select
              v-model="form.studyStage"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">请选择学习阶段</option>
              <option value="大一">大一</option>
              <option value="大二">大二</option>
              <option value="大三">大三</option>
              <option value="大四">大四</option>
              <option value="研一">研一</option>
              <option value="研二">研二</option>
              <option value="研三">研三</option>
              <option value="在职">在职</option>
            </select>
          </div>

          <!-- 目标职位（仅注册时显示） -->
          <div v-if="!isLogin">
            <label class="block text-sm font-medium text-gray-700 mb-1">目标职位</label>
            <input
              v-model="form.position"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="如：前端开发工程师"
            />
          </div>

          <!-- 错误信息 -->
          <div v-if="errorMessage" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {{ errorMessage }}
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="inline-flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              处理中...
            </span>
            <span v-else>{{ isLogin ? '登录' : '注册' }}</span>
          </button>
        </form>

        <!-- 演示账号 -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-2">演示账号：</p>
          <p class="text-xs text-gray-500">邮箱: demo@example.com</p>
          <p class="text-xs text-gray-500">密码: demo123</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../../services";

defineOptions({
	name: "Login",
});

const router = useRouter();
const isLogin = ref(true);
const loading = ref(false);
const errorMessage = ref("");

const form = reactive({
	username: "",
	email: "",
	password: "",
	studyStage: "",
	position: "",
});

const handleSubmit = async () => {
	loading.value = true;
	errorMessage.value = "";

	try {
		if (isLogin.value) {
			// 登录
			const response = await authService.login({
				email: form.email,
				password: form.password,
			});

			if (response.success) {
				console.log("登录成功:", response.data);
				router.push("/");
			} else {
				errorMessage.value = response.message || "登录失败";
			}
		} else {
			// 注册
			const response = await authService.register({
				username: form.username,
				email: form.email,
				password: form.password,
				studyStage: form.studyStage,
				position: form.position,
			});

			if (response.success) {
				console.log("注册成功:", response.data);
				router.push("/");
			} else {
				errorMessage.value = response.message || "注册失败";
			}
		}
	} catch (error) {
		console.error("认证失败:", error);
		errorMessage.value = "网络错误，请稍后重试";
	} finally {
		loading.value = false;
	}
};
</script> 