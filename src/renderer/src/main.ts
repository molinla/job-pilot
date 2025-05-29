import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.use(router);

// Monaco Editor worker 路径配置
// @ts-ignore
window.MonacoEnvironment = {
	getWorkerUrl: (moduleId, label) => {
		return `/monaco-editor-workers/${label}.js`;
	},
};

app.mount("#app");
