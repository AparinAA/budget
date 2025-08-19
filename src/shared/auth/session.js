"use server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/shared/db";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_DAYS = 30;

export async function createSession(userId) {
	const token = randomBytes(32).toString("hex");
	const expires = new Date(
		Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
	);
	await prisma.session.create({ data: { token, userId, expires } });
	const cookieStore = cookies();
	cookieStore.set(SESSION_COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		secure: process.env.NODE_ENV === "production",
		expires,
	});
	return token;
}

export async function destroySession() {
	const token = cookies().get(SESSION_COOKIE)?.value;
	if (token) {
		await prisma.session.deleteMany({ where: { token } });
		cookies().delete(SESSION_COOKIE);
	}
}

export async function getSession() {
	const token = cookies().get(SESSION_COOKIE)?.value;
	if (!token) return null;
	const session = await prisma.session.findUnique({
		where: { token },
		include: { user: true },
	});
	if (!session) return null;
	if (session.expires < new Date()) {
		await prisma.session.delete({ where: { token } }).catch(() => {});
		cookies().delete(SESSION_COOKIE);
		return null;
	}
	return session;
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
