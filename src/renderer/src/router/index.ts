import { createRouter, createWebHashHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import Home from "../pages/Home/index.vue";
import AlgorithmTraining from "../pages/AlgorithmTraining/index.vue";
import MockInterview from "../pages/MockInterview/index.vue";
import InterviewReview from "../pages/InterviewReview/index.vue";
import InterviewRecording from "../pages/InterviewRecording/index.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "首页",
    },
  },
  {
    path: "/algorithm-training",
    name: "AlgorithmTraining",
    component: AlgorithmTraining,
    meta: {
      title: "刷题训练",
    },
  },
  {
    path: "/mock-interview",
    name: "MockInterview",
    component: MockInterview,
    meta: {
      title: "模拟面试",
    },
  },
  {
    path: "/interview-review",
    name: "InterviewReview",
    component: InterviewReview,
    meta: {
      title: "面试复盘",
    },
  },
  {
    path: "/interview-recording",
    name: "InterviewRecording",
    component: InterviewRecording,
    meta: {
      title: "录制面试",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
