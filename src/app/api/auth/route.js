import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
	const { getCurrentUser } = await import("@/features/auth/server");
	const user = await getCurrentUser();
	return NextResponse.json(user ? { id: user.id, email: user.email } : null);
}

export async function POST(req) {
	const body = await req.json().catch(() => ({}));
	const { action, payload } = body || {};
	console.info(body)
	try {
		switch (action) {
			case "login":
				return NextResponse.json(
					await (
						await import("@/features/auth/server")
					).login(payload)
				);
			case "register":
				if (process.env.NODE_ENV !== "development") {
					return NextResponse.json(
						{ error: "Registration disabled" },
						{ status: 403 }
					);
				}
				return NextResponse.json(
					await (
						await import("@/features/auth/server")
					).register(payload)
				);
			case "logout":
				await (await import("@/features/auth/server")).logout();
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
