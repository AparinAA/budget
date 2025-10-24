import { NextResponse } from "next/server";

export async function middleware(req) {
	const url = new URL(req.url);
	const pathname = url.pathname;
	// allow auth api
	if (pathname.startsWith("/api/auth")) {
		return NextResponse.next();
	}
	if (pathname.startsWith("/api")) return NextResponse.next();
	// Проверка валидности сессии через внутренний API (cookie пробрасываем вручную)
	async function checkAuth() {
		try {
			const res = await fetch(new URL("/api/auth", req.url), {
				headers: { cookie: req.headers.get("cookie") || "" },
				cache: "no-store",
			});
			if (!res.ok) return false;
			const data = await res.json().catch(() => null);
			return !!(data && data.id);
		} catch {
			return false;
		}
	}

	if (pathname.startsWith("/auth")) {
		const authed = await checkAuth();
		if (authed) return NextResponse.redirect(new URL("/", req.url));
		return NextResponse.next();
	}

	const authed = await checkAuth();
	if (!authed) return NextResponse.redirect(new URL("/auth", req.url));
	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/budgets", "/auth"],
};
