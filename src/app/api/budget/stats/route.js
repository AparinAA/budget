import { NextResponse } from "next/server";
import {
	getMonthlyStats,
	getOrCreateBudget,
	saveMonthlyStats,
} from "@/features/budget/server";
import { requireUserId } from "@/shared/auth/session";

export async function GET() {
	try {
		await requireUserId();
		// Обновляем статистику для текущего месяца перед выдачей
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		await getOrCreateBudget(year, month);
		await saveMonthlyStats(year, month);
		const stats = await getMonthlyStats();
		return NextResponse.json(stats);
	} catch (e) {
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status: 500 }
		);
	}
}
