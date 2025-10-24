"use client";
import { useEffect, useState } from "react";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { currency as fmt } from "@/shared/lib/format";
import { authAction, getMe } from "@/shared/api/auth";
import { shareBudgetWith, listAccessibleBudgets } from "@/shared/api/budget";
import Link from "next/link";

const MONTHS = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
];

export function BudgetHeader({ year, month, currencyCode, stat, ownerId }) {
    const [me, setMe] = useState(null);
    const [ownerEmail, setOwnerEmail] = useState(null);
    useEffect(() => {
        let mounted = true;
        getMe().then((u) => {
            if (!mounted) return;
            setMe(u);
        }).catch(() => setMe(null));
        return () => { mounted = false; };
    }, []);
    useEffect(() => {
        let active = true;
        async function loadOwner() {
            try {
                const meId = me?.id;
                if (!ownerId) {
                    setOwnerEmail(me?.email || null);
                    return;
                }
                if (meId && ownerId === meId) {
                    setOwnerEmail(me?.email || null);
                    return;
                }
                const owners = await listAccessibleBudgets();
                if (!active) return;
                const rec = owners.find((o) => o.ownerId === ownerId);
                setOwnerEmail(rec?.email || null);
            } catch {
                if (active) setOwnerEmail(null);
            }
        }
        loadOwner();
        return () => { active = false; };
    }, [ownerId, me]);

    const totalIncome = stat?.totalIncome ?? 0; // cents
    const totalExpenses = stat?.totalExpenses ?? 0; // cents
    const remaining = Math.max(0, totalIncome - totalExpenses);

    const handleLogout = async () => {
        try {
            await authAction("logout");
        } catch {}
        if (typeof window !== "undefined") window.location.href = "/view/auth";
    };

    const [shareOpen, setShareOpen] = useState(false);
    const [shareEmail, setShareEmail] = useState("");

    const isOwner = !ownerId || (me?.id && ownerId === me.id);
    return (
        <header className={styles.header}>
            <div className={styles.leftSection}>
                <Link href="/view/budgets" className={`${kit.button} ${styles.budgetsLink}`}>
                    Доступные бюджеты
                </Link>
                <div className={styles.title}>
                    Бюджет · {MONTHS[(month - 1) % 12]} {year}
                </div>
                <div className={`${kit.muted} ${styles.owner}`}>
                    Владелец: <b className={styles.ownerName}>{ownerEmail || (isOwner ? (me?.email || "Я") : "—")}</b>
                </div>
            </div>
            <div className={`${kit.label} ${styles.stats}`}>
                <span>
                    Доход: <b className={styles.statValue}>{fmt(totalIncome / 100, currencyCode)}</b>
                </span>
                <span>
                    Расходы: <b className={styles.statValue}>{fmt(totalExpenses / 100, currencyCode)}</b>
                </span>
                <span>
                    Остаток: <b className={styles.statValue}>{fmt(remaining / 100, currencyCode)}</b>
                </span>
            </div>
            <div className={styles.rightSection}>
                {isOwner && (
                <div className={styles.shareSection}>
                    {shareOpen && (
                        <>
                            <input
                                value={shareEmail}
                                onChange={(e) => setShareEmail(e.target.value)}
                                placeholder="email пользователя"
                                className={`${kit.input} ${styles.shareInput}`}
                            />
                            <button
                                className={kit.button}
                                onClick={async () => {
                                    if (!shareEmail) return;
                                    try {
                                        await shareBudgetWith(me?.id, shareEmail, "editor");
                                        alert("Доступ предоставлен");
                                        setShareEmail("");
                                        setShareOpen(false);
                                        if (typeof window !== "undefined") window.dispatchEvent(new Event("budget-share-updated"));
                                    } catch (e) {
                                        alert(e?.message || "Не удалось поделиться");
                                    }
                                }}
                            >
                                Отправить
                            </button>
                        </>
                    )}
                    <button className={kit.button} onClick={() => setShareOpen((v) => !v)}>
                        Поделиться
                    </button>
                </div>
                )}
                {me?.email ? (
                    <span className={`${kit.muted} ${styles.email}`} title={me.email}>
                        {me.email}
                    </span>
                ) : null}
                <button onClick={handleLogout} className={`${kit.button} ${styles.logoutButton}`}>
                    Выйти
                </button>
            </div>
        </header>
    );
}

export default BudgetHeader;
