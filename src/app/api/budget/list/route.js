import { NextResponse } from "next/server";
import { prisma } from "@/shared/db";
import { requireUserId } from "@/shared/auth/session";
export const dynamic = "force-dynamic";

export async function GET() {
    const meId = await requireUserId();
    try {
        const owned = await prisma.budget.findMany({
            where: { userId: meId },
            select: { userId: true, year: true, month: true, currencyCode: true },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        });
        const shared = await prisma.budgetShare.findMany({
            where: { memberId: meId },
            include: {
                owner: true,
            },
        });
        // Собираем уникальных владельцев
        const owners = new Map();
        owned.forEach((b) => {
            owners.set(b.userId, { ownerId: b.userId, email: null, role: "owner" });
        });
        shared.forEach((s) => {
            owners.set(s.ownerId, { ownerId: s.ownerId, email: s.owner?.email || null, role: s.role || "editor" });
        });
        return NextResponse.json(Array.from(owners.values()));
    } catch (e) {
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}
