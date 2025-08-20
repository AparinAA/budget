import { NextResponse } from "next/server";
import { requireUserId } from "@/shared/auth/session";
import { prisma } from "@/shared/db";
export const dynamic = "force-dynamic";

export async function POST(req) {
    const meId = await requireUserId();
    const { ownerId, memberEmail, role } = await req.json().catch(() => ({}));
    if (!ownerId || !memberEmail) {
        return NextResponse.json({ error: "ownerId и memberEmail обязательны" }, { status: 400 });
    }
    try {
        if (ownerId !== meId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const member = await prisma.user.findUnique({ where: { email: memberEmail } });
        if (!member) return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
        await prisma.budgetShare.upsert({
            where: { ownerId_memberId: { ownerId, memberId: member.id } },
            update: { role: role || "editor" },
            create: { ownerId, memberId: member.id, role: role || "editor" },
        });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}
