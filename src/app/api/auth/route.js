import { NextResponse } from "next/server";
import {
	login,
	register,
	logout,
	getCurrentUser,
} from "@/features/auth/server";

export async function GET() {
	const user = await getCurrentUser();
	return NextResponse.json(user ? { id: user.id, email: user.email } : null);
}

export async function POST(req) {
	const body = await req.json().catch(() => ({}));
	const { action, payload } = body || {};
	try {
		switch (action) {
			case "login":
				return NextResponse.json(await login(payload));
			case "register":
				return NextResponse.json(await register(payload));
			case "logout":
				await logout();
				return NextResponse.json({ ok: true });
			default:
				return NextResponse.json(
					{ error: "Unknown action" },
					{ status: 400 }
				);
		}
	} catch (e) {
		const status = e?.status || 500;
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status }
		);
	}
}
