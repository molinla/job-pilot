// IndexedDB服务
// 主要用于面试数据的本地存储和获取

// 数据库版本
const DB_VERSION = 1;
// 数据库名称
const DB_NAME = "job-pilot-db";
// 对象存储名称
const STORES = {
	INTERVIEWS: "interviews",
	VIDEOS: "videos",
	TRANSCRIPTS: "transcripts",
};

interface Interview {
	id: string;
	title: string;
	company: string;
	position: string;
	tags: string[];
	description: string;
	date: string;
	duration: string;
	status: string;
}

interface VideoRecord {
	id: string;
	interviewId: string;
	blob: Blob;
	thumbnailUrl?: string;
	createdAt: string;
}

interface Transcript {
	id: string;
	interviewId: string;
	content: string;
	createdAt: string;
}

// 初始化数据库
const initDb = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(DB_NAME, DB_VERSION);

		request.onerror = (event) => {
			console.error("数据库打开失败:", event);
			reject("无法打开数据库");
		};

		request.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			resolve(db);
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			// 创建面试记录存储
			if (!db.objectStoreNames.contains(STORES.INTERVIEWS)) {
				const interviewStore = db.createObjectStore(STORES.INTERVIEWS, {
					keyPath: "id",
				});
				interviewStore.createIndex("date", "date", { unique: false });
				interviewStore.createIndex("company", "company", { unique: false });
			}

			// 创建视频存储
			if (!db.objectStoreNames.contains(STORES.VIDEOS)) {
				const videoStore = db.createObjectStore(STORES.VIDEOS, {
					keyPath: "id",
				});
				videoStore.createIndex("interviewId", "interviewId", { unique: false });
				videoStore.createIndex("createdAt", "createdAt", { unique: false });
			}

			// 创建语音转文字记录存储
			if (!db.objectStoreNames.contains(STORES.TRANSCRIPTS)) {
				const transcriptStore = db.createObjectStore(STORES.TRANSCRIPTS, {
					keyPath: "id",
				});
				transcriptStore.createIndex("interviewId", "interviewId", {
					unique: false,
				});
				transcriptStore.createIndex("createdAt", "createdAt", {
					unique: false,
				});
			}
		};
	});
};

// 生成唯一ID
const generateId = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// 保存面试记录
const saveInterview = async (
	interview: Omit<Interview, "id" | "date" | "status"> | Interview,
): Promise<string> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.INTERVIEWS], "readwrite");
			const store = transaction.objectStore(STORES.INTERVIEWS);

			// 深拷贝对象，确保数组可以被正确克隆
			const interviewCopy = JSON.parse(JSON.stringify(interview));
			let request: IDBRequest;

			// 如果是新记录，生成 ID 和其他必要字段
			if (!("id" in interviewCopy)) {
				const id = generateId();
				const newInterview: Interview = {
					...interviewCopy,
					id,
					date: new Date().toISOString(),
					status: "已完成",
				};

				request = store.add(newInterview);

				request.onsuccess = () => {
					resolve(id);
				};
			} else {
				// 如果是更新现有记录
				request = store.put(interviewCopy);

				request.onsuccess = () => {
					resolve(interviewCopy.id);
				};
			}

			request.onerror = (event) => {
				console.error("保存面试记录失败:", event);
				reject("保存面试记录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("保存面试记录时发生错误:", error);
		throw error;
	}
};

// 保存视频记录
const saveVideo = async (videoData: {
	interviewId: string;
	blob: Blob;
}): Promise<string> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.VIDEOS], "readwrite");
			const store = transaction.objectStore(STORES.VIDEOS);

			const id = generateId();
			const videoRecord: VideoRecord = {
				id,
				interviewId: videoData.interviewId,
				blob: videoData.blob,
				createdAt: new Date().toISOString(),
			};

			const request = store.add(videoRecord);

			request.onsuccess = () => {
				resolve(id);
			};

			request.onerror = (event) => {
				console.error("保存视频记录失败:", event);
				reject("保存视频记录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("保存视频记录时发生错误:", error);
		throw error;
	}
};

// 保存转录文本
const saveTranscript = async (transcriptData: {
	interviewId: string;
	content: string;
}): Promise<string> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.TRANSCRIPTS], "readwrite");
			const store = transaction.objectStore(STORES.TRANSCRIPTS);

			const id = generateId();
			const transcript: Transcript = {
				id,
				interviewId: transcriptData.interviewId,
				content: transcriptData.content,
				createdAt: new Date().toISOString(),
			};

			const request = store.add(transcript);

			request.onsuccess = () => {
				resolve(id);
			};

			request.onerror = (event) => {
				console.error("保存转录失败:", event);
				reject("保存转录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("保存转录时发生错误:", error);
		throw error;
	}
};

// 获取所有面试记录
const getAllInterviews = async (): Promise<Interview[]> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.INTERVIEWS], "readonly");
			const store = transaction.objectStore(STORES.INTERVIEWS);
			const request = store.getAll();

			request.onsuccess = () => {
				resolve(request.result);
			};

			request.onerror = (event) => {
				console.error("获取面试记录失败:", event);
				reject("获取面试记录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("获取面试记录时发生错误:", error);
		throw error;
	}
};

// 根据ID获取面试记录
const getInterviewById = async (id: string): Promise<Interview | null> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.INTERVIEWS], "readonly");
			const store = transaction.objectStore(STORES.INTERVIEWS);
			const request = store.get(id);

			request.onsuccess = () => {
				resolve(request.result || null);
			};

			request.onerror = (event) => {
				console.error("获取面试记录失败:", event);
				reject("获取面试记录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("获取面试记录时发生错误:", error);
		throw error;
	}
};

// 获取面试视频
const getVideoByInterviewId = async (
	interviewId: string,
): Promise<VideoRecord | null> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.VIDEOS], "readonly");
			const store = transaction.objectStore(STORES.VIDEOS);
			const index = store.index("interviewId");
			const request = index.get(interviewId);

			request.onsuccess = () => {
				resolve(request.result || null);
			};

			request.onerror = (event) => {
				console.error("获取视频记录失败:", event);
				reject("获取视频记录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("获取视频记录时发生错误:", error);
		throw error;
	}
};

// 获取面试转录
const getTranscriptByInterviewId = async (
	interviewId: string,
): Promise<Transcript | null> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.TRANSCRIPTS], "readonly");
			const store = transaction.objectStore(STORES.TRANSCRIPTS);
			const index = store.index("interviewId");
			const request = index.get(interviewId);

			request.onsuccess = () => {
				resolve(request.result || null);
			};

			request.onerror = (event) => {
				console.error("获取转录记录失败:", event);
				reject("获取转录记录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("获取转录记录时发生错误:", error);
		throw error;
	}
};

// 删除面试记录及其相关数据
const deleteInterview = async (id: string): Promise<void> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(
				[STORES.INTERVIEWS, STORES.VIDEOS, STORES.TRANSCRIPTS],
				"readwrite",
			);

			// 删除面试记录
			const interviewStore = transaction.objectStore(STORES.INTERVIEWS);
			interviewStore.delete(id);

			// 删除相关视频记录
			const videoStore = transaction.objectStore(STORES.VIDEOS);
			const videoIndex = videoStore.index("interviewId");
			const videoRequest = videoIndex.getAll(id);

			videoRequest.onsuccess = () => {
				const videos = videoRequest.result;
				for (const video of videos) {
					videoStore.delete(video.id);
				}
			};

			// 删除相关转录记录
			const transcriptStore = transaction.objectStore(STORES.TRANSCRIPTS);
			const transcriptIndex = transcriptStore.index("interviewId");
			const transcriptRequest = transcriptIndex.getAll(id);

			transcriptRequest.onsuccess = () => {
				const transcripts = transcriptRequest.result;
				for (const transcript of transcripts) {
					transcriptStore.delete(transcript.id);
				}
			};

			transaction.oncomplete = () => {
				db.close();
				resolve();
			};

			transaction.onerror = (event) => {
				console.error("删除面试记录失败:", event);
				reject("删除面试记录失败");
			};
		});
	} catch (error) {
		console.error("删除面试记录时发生错误:", error);
		throw error;
	}
};

// 更新转录文本
const updateTranscript = async (id: string, content: string): Promise<void> => {
	try {
		const db = await initDb();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction([STORES.TRANSCRIPTS], "readwrite");
			const store = transaction.objectStore(STORES.TRANSCRIPTS);
			const request = store.get(id);

			request.onsuccess = () => {
				if (request.result) {
					const transcript = request.result;
					transcript.content = content;
					store.put(transcript);
					resolve();
				} else {
					reject("找不到转录记录");
				}
			};

			request.onerror = (event) => {
				console.error("更新转录失败:", event);
				reject("更新转录失败");
			};

			transaction.oncomplete = () => {
				db.close();
			};
		});
	} catch (error) {
		console.error("更新转录时发生错误:", error);
		throw error;
	}
};

export const indexedDbService = {
	saveInterview,
	saveVideo,
	saveTranscript,
	getAllInterviews,
	getInterviewById,
	getVideoByInterviewId,
	getTranscriptByInterviewId,
	deleteInterview,
	updateTranscript,
};

export default indexedDbService;
