import { NextResponse } from "next/server";
import { getCategoryExpenses } from "@/features/budget/server";
import { requireUserId } from "@/shared/auth/session";
export const dynamic = "force-dynamic";

export async function GET(req) {
	await requireUserId();
	const { searchParams } = new URL(req.url);
	const year = Number(searchParams.get("year")) || new Date().getFullYear();
	const month =
		Number(searchParams.get("month")) || new Date().getMonth() + 1;
	const categoryId = searchParams.get("categoryId");
	const ownerId = searchParams.get("ownerId") || null;

	if (!categoryId) {
		return NextResponse.json(
			{ error: "categoryId is required" },
			{ status: 400 }
		);
	}

	try {
		const expenses = await getCategoryExpenses({
			year,
			month,
			categoryId,
			ownerId,
		});
		return NextResponse.json(expenses);
	} catch (e) {
		console.error(e);
		const status = e?.status === 403 ? 403 : 500;
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status }
		);
	}
}
