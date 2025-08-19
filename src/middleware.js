import { NextResponse } from "next/server";

export async function middleware(req) {
	const url = new URL(req.url);
	const pathname = url.pathname;
	// allow public paths
	if (pathname.startsWith("/api/auth") || pathname.startsWith("/view/auth")) {
		return NextResponse.next();
	}
	if (pathname.startsWith("/api")) return NextResponse.next();
	// Edge middleware: нельзя использовать Prisma. Проверяем только наличие cookie.
	const token = req.cookies.get("session")?.value;
	if (!token) return NextResponse.redirect(new URL("/view/auth", req.url));
	return NextResponse.next();
}

export const config = {
	matcher: ["/", "/view/:path*"],
};
