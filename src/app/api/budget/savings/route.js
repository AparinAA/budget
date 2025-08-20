import { NextResponse } from "next/server";
import { getSavingsSummary } from "@/features/budget/server";
import { requireUserId } from "@/shared/auth/session";
export const dynamic = "force-dynamic";

export async function GET(req) {
	try {
		await requireUserId();
	const { searchParams } = new URL(req.url);
	const ownerId = searchParams.get("ownerId") || null;
	const data = await getSavingsSummary(ownerId);
		return NextResponse.json(data);
	} catch (e) {
		return NextResponse.json(
			{ error: e.message || "Server error" },
			{ status: 500 }
		);
	}
}
