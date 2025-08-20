import { NextResponse } from "next/server";
import {
	getMonthlyStats,
	getOrCreateBudget,
	saveMonthlyStats,
} from "@/features/budget/server";
import { requireUserId } from "@/shared/auth/session";
export const dynamic = "force-dynamic";

export async function GET(req) {
	try {
		await requireUserId();
	const { searchParams } = new URL(req.url);
	const ownerId = searchParams.get("ownerId") || null;
	// Обновляем статистику для текущего месяца перед выдачей
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1;
	await getOrCreateBudget(year, month, ownerId);
	await saveMonthlyStats(year, month, ownerId);
	const stats = await getMonthlyStats(ownerId);
		return NextResponse.json(stats);
	} catch (e) {
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status: 500 }
		);
	}
}
