"use server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/shared/db";
import { getRedisClient } from "@/shared/redis";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_DAYS = 60;
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

// Префикс для ключей сессий в Redis
const SESSION_KEY_PREFIX = "session:";

export async function createSession(userId) {
	const sessionId = randomBytes(8).toString("hex");
	const redis = await getRedisClient();

	// Получаем данные пользователя из БД
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, email: true },
	});

	if (!user) {
		throw new Error("User not found");
	}

	// Сохраняем сессию в Redis с TTL 30 дней
	const sessionData = {
		userId: user.id,
		email: user.email,
	};

	await redis.setEx(
		`${SESSION_KEY_PREFIX}${sessionId}`,
		SESSION_MAX_AGE_SECONDS,
		JSON.stringify(sessionData)
	);

	// Устанавливаем cookie
	const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
	const cookieStore = cookies();
	cookieStore.set(SESSION_COOKIE, sessionId, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secure: process.env.NODE_ENV === "production",
		expires,
	});

	return sessionId;
}

export async function destroySession() {
	const sessionId = cookies().get(SESSION_COOKIE)?.value;
	if (sessionId) {
		const redis = await getRedisClient();
		await redis.del(`${SESSION_KEY_PREFIX}${sessionId}`);
		cookies().delete(SESSION_COOKIE);
	}
}

export async function getSession() {
	const sessionId = cookies().get(SESSION_COOKIE)?.value;
	if (!sessionId) return null;

	try {
		const redis = await getRedisClient();
		const sessionData = await redis.get(
			`${SESSION_KEY_PREFIX}${sessionId}`
		);

		if (!sessionData) {
			// Сессия не найдена или истекла
			cookies().delete(SESSION_COOKIE);
			return null;
		}

		const session = JSON.parse(sessionData);

		// Возвращаем данные в том же формате, что и раньше
		return {
			userId: session.userId,
			user: {
				id: session.userId,
				email: session.email,
			},
		};
	} catch (error) {
		console.error("Error getting session from Redis:", error);
		cookies().delete(SESSION_COOKIE);
		return null;
	}
}

export async function requireUserId() {
	const s = await getSession();
	if (!s?.userId) {
		const err = new Error("Unauthorized");
		err.status = 401;
		throw err;
	}
	return s.userId;
}
