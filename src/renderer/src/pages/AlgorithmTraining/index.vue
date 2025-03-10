<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { appTheme } from "../../config/theme";
import ExamPaper from "./components/ExamPaper.vue";

defineOptions({
  name: "AlgorithmTraining",
});

// 定义题目类型
interface BaseQuestion {
  id: string;
  content: string;
  isWrong: boolean;
}

interface ChoiceQuestion extends BaseQuestion {
  options: Array<{
    key: string;
    text: string;
  }>;
}

interface CodingQuestion extends BaseQuestion {
  description: string;
  language: string;
  initialCode: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

// 定义试卷类型
interface Exam {
  title: string;
  totalScore: number;
  duration: number;
  questions: Array<ChoiceQuestion | CodingQuestion>;
  instructions: string[];
  singleChoiceScore: number;
  multipleChoiceScore: number;
  codingScore: number;
  singleChoiceQuestions: ChoiceQuestion[];
  multipleChoiceQuestions: ChoiceQuestion[];
  codingQuestions: CodingQuestion[];
}

const router = useRouter();
const pageTitle = ref("刷题训练");

const goBack = () => {
  router.push("/");
};

// 模拟试卷数据
const examData = ref<Exam>({
  title: "Java后端工程师面试题集（A卷）",
  totalScore: 100,
  duration: 120,
  questions: [], // 所有题目的集合，用于计算完成度
  instructions: [
    "本试卷共包含单选题、多选题和编程题三种题型。",
    "单选题每题4分，多选题每题6分，编程题每题10分。",
    "多选题少选得部分分，多选不得分。",
    "有红色标记的题目为上次做错的题目，请重点关注。",
    "点击题目旁的AI图标可获取智能解析帮助。",
  ],
  singleChoiceScore: 4,
  multipleChoiceScore: 6,
  codingScore: 10,
  singleChoiceQuestions: [
    {
      id: "s1",
      content: "在Java中，下列关于接口(Interface)的说法中，错误的是：",
      isWrong: true,
      options: [
        { key: "A", text: "接口中可以包含静态方法" },
        { key: "B", text: "接口中可以包含默认方法" },
        { key: "C", text: "接口中的变量默认是public static final的" },
        { key: "D", text: "接口可以继承多个类" },
      ],
    },
    {
      id: "s2",
      content: "关于Java中的线程安全，以下说法正确的是：",
      isWrong: false,
      options: [
        { key: "A", text: "ArrayList是线程安全的" },
        { key: "B", text: "Vector是线程安全的" },
        { key: "C", text: "HashMap是线程安全的" },
        { key: "D", text: "StringBuffer不是线程安全的" },
      ],
    },
    {
      id: "s3",
      content: "以下哪个注解可以用来处理Spring中的循环依赖问题？",
      isWrong: false,
      options: [
        { key: "A", text: "@Autowired" },
        { key: "B", text: "@Lazy" },
        { key: "C", text: "@Scope" },
        { key: "D", text: "@Primary" },
      ],
    },
  ],
  multipleChoiceQuestions: [
    {
      id: "m1",
      content: "关于Java中的集合框架，以下说法正确的有：",
      isWrong: true,
      options: [
        { key: "A", text: "LinkedList实现了List接口" },
        { key: "B", text: "HashSet中的元素是有序的" },
        { key: "C", text: "TreeMap实现了SortedMap接口" },
        { key: "D", text: "ConcurrentHashMap是线程安全的" },
      ],
    },
    {
      id: "m2",
      content: "Spring框架中，Bean的作用域包括：",
      isWrong: false,
      options: [
        { key: "A", text: "singleton" },
        { key: "B", text: "prototype" },
        { key: "C", text: "request" },
        { key: "D", text: "session" },
      ],
    },
  ],
  codingQuestions: [
    {
      id: "c1",
      content: "实现一个简单的LRU缓存",
      isWrong: false,
      description:
        "请实现一个LRU（最近最少使用）缓存机制，它应该支持以下操作：获取数据（get）和写入数据（put）。<br><br>获取数据get(key)：如果关键字存在于缓存中，则获取关键字的值（总是正数），否则返回-1。<br>写入数据put(key, value)：如果关键字已经存在，则变更其数据值；如果关键字不存在，则插入该组「关键字-值」。当缓存容量达到上限时，它应该在写入新数据之前删除最久未使用的数据，从而为新数据留出空间。",
      language: "Java",
      initialCode:
        "class LRUCache {\n\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        \n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}",
      examples: [
        {
          input:
            "LRUCache cache = new LRUCache(2);\ncache.put(1, 1);\ncache.put(2, 2);\ncache.get(1);       // 返回 1\ncache.put(3, 3);    // 该操作会使得关键字 2 作废\ncache.get(2);       // 返回 -1 (未找到)\ncache.put(4, 4);    // 该操作会使得关键字 1 作废\ncache.get(1);       // 返回 -1 (未找到)\ncache.get(3);       // 返回 3\ncache.get(4);       // 返回 4",
          output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
        },
      ],
      constraints: [
        "1 <= capacity <= 3000",
        "0 <= key <= 10000",
        "0 <= value <= 105",
        "最多调用 2 * 105 次 get 和 put 操作",
      ],
    },
  ],
});

// 初始化所有题目的集合
onMounted(() => {
  const allQuestions = [
    ...examData.value.singleChoiceQuestions,
    ...examData.value.multipleChoiceQuestions,
    ...examData.value.codingQuestions,
  ];
  examData.value.questions = allQuestions;
});

// 处理试卷提交
const handleSubmit = (answers: Record<string, string | string[]>) => {
  console.log("提交的答案:", answers);
  // 这里可以添加提交逻辑，如发送到服务器等
  alert("试卷提交成功！");
};
</script>

<template>
  <div class="bg-blue-50 flex flex-col h-full relative overflow-auto">
    <!-- 背景光晕效果 -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
      <div
        class="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-opacity-30 blur-3xl"
        :style="`background-color: ${appTheme.primary.light}`"
      ></div>
    </div>

    <div class="relative z-10 p-4">
      <div class="fixed top-14 z-20 flex items-center mb-4">
        <button
          class="cursor-pointer mr-3 size-8 text-center vertical-center p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200"
          @click="goBack"
          :style="`color: ${appTheme.primary.base}`"
        >
          <span class="material-icons" style="font-size: 20px">arrow_back</span>
        </button>
      </div>

      <!-- 试卷组件 -->
      <ExamPaper :exam="examData" @submit="handleSubmit" />
    </div>
  </div>
</template>
