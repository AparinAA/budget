import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.USER_CASH_REDIS_URL,
});
redisClient.connect();

export async function getRedisClient() {
	if (!redisClient) {
		redisClient.on("error", (err) => {
			console.error("Redis Client Error", err);
		});
	}

	return redisClient;
}

// Закрытие подключения при завершении процесса
if (typeof process !== "undefined") {
	process.on("SIGTERM", async () => {
		if (redisClient) {
			await redisClient.quit();
		}
	});
}
