import { NextResponse } from "next/server";
import { getSavingsSummary } from "@/features/budget/server";
import { requireUserId } from "@/shared/auth/session";

export async function GET() {
	try {
		await requireUserId();
		const data = await getSavingsSummary();
		return NextResponse.json(data);
	} catch (e) {
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status: 500 }
		);
	}
}
