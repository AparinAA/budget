import { NextResponse } from "next/server";
import {
	getBudgetSnapshot,
	setIncome,
	addCategory,
	removeCategory,
	setCategoryPercent,
	addExpense,
	setCurrency,
} from "@/features/budget/server";
import { requireUserId } from "@/shared/auth/session";
export const dynamic = "force-dynamic";

export async function GET(req) {
	await requireUserId();
	const { searchParams } = new URL(req.url);
	const year = Number(searchParams.get("year")) || new Date().getFullYear();
	const month =
		Number(searchParams.get("month")) || new Date().getMonth() + 1;
	const snap = await getBudgetSnapshot(year, month);
	return NextResponse.json(snap);
}

export async function POST(req) {
	await requireUserId();
	const body = await req.json();
	const { action, payload } = body || {};
	try {
		switch (action) {
			case "setIncome":
				await setIncome(payload);
				break;
			case "setCurrency":
				await setCurrency(payload);
				break;
			case "addCategory":
				await addCategory(payload);
				break;
			case "removeCategory":
				await removeCategory(payload);
				break;
			case "setCategoryPercent":
				await setCategoryPercent(payload);
				break;
			case "setCategorySaving": {
				const { setCategorySaving } = await import(
					"@/features/budget/server"
				);
				await setCategorySaving(payload);
				break;
			}
			case "setCategoryRollover": {
				const { setCategoryRollover } = await import(
					"@/features/budget/server"
				);
				await setCategoryRollover(payload);
				break;
			}
			case "addExpense":
				await addExpense(payload);
				break;
			case "recalculateSavings":
				// пересчёт накоплений выполнится в общем блоке ниже
				break;
			default:
				return NextResponse.json(
					{ error: "Unknown action" },
					{ status: 400 }
				);
		}
		// Сохраняем статистику после любого изменения
		if (payload?.year && payload?.month) {
			const { saveMonthlyStats, calculateAndUpsertSavings } =
				await import("@/features/budget/server");
			await saveMonthlyStats(payload.year, payload.month);
			await calculateAndUpsertSavings(payload.year, payload.month);
		}
		const { year, month } = payload;
		const snap = await getBudgetSnapshot(year, month);
		return NextResponse.json(snap);
	} catch (e) {
		console.error(e);
		const status = e?.status === 400 ? 400 : 500;
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status }
		);
	}
}
