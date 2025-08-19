"use server";
import { prisma } from "@/shared/db";
import {
	createSession,
	destroySession,
	getSession,
} from "@/shared/auth/session";
import { createHash, timingSafeEqual } from "node:crypto";

function hashPassword(pw) {
	return createHash("sha256").update(pw).digest("hex");
}

export async function getCurrentUser() {
	const s = await getSession();
	if (!s?.userId) return null;
	return s.user;
}

export async function register({ email, password }) {
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) {
		const err = new Error("Пользователь уже существует");
		err.status = 400;
		throw err;
	}
	const user = await prisma.user.create({
		data: { email, passwordHash: hashPassword(password) },
	});
	await createSession(user.id);
	return { id: user.id, email: user.email };
}

export async function login({ email, password }) {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user?.passwordHash) {
		const err = new Error("Неверные учетные данные");
		err.status = 401;
		throw err;
	}
	const hash = hashPassword(password);
	const ok = timingSafeEqual(
		Buffer.from(hash),
		Buffer.from(user.passwordHash)
	);
	if (!ok) {
		const err = new Error("Неверные учетные данные");
		err.status = 401;
		throw err;
	}
	await createSession(user.id);
	return { id: user.id, email: user.email };
}

export async function logout() {
	await destroySession();
}
