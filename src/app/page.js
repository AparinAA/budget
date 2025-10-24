"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { useBudgetStore } from "@/shared/store/budgetStore";
import { fetchSnapshot, fetchStats } from "@/shared/api/budget";
import { currency } from "@/shared/lib/format";
import { Charts } from "@/entities/budget/ui/Charts";
import { Controls } from "@/entities/budget/ui/Controls";
import { Categories } from "@/entities/budget/ui/Categories";
import { MonthlyStats } from "@/entities/budget/ui/MonthlyStats";
import { SavingsCard } from "@/entities/budget/ui/SavingsCard";
import { BudgetHeader } from "@/entities/budget/ui/Header";

export default function HomePage() {
	const {
		year,
		month,
		income,
		currency: currencyCode,
		categories,
		setSnapshot,
		ownerId,
		setOwnerId,
	} = useBudgetStore();
	const [stats, setStats] = useState([]);

	// ownerId из query
	useEffect(() => {
		if (typeof window === "undefined") return;
		const sp = new URLSearchParams(window.location.search);
		const qOwner = sp.get("ownerId");
		if (qOwner) setOwnerId(qOwner);
	}, [setOwnerId]);

	useEffect(() => {
		// Дебаунс 1s и отмена предыдущего запроса снапшота при смене периода
		let timer = null;
		const controller = new AbortController();
		timer = setTimeout(() => {
			fetchSnapshot(year, month, controller.signal, ownerId || null)
				.then((snap) => setSnapshot(snap))
				.catch(() => {});
		}, 1000);
		return () => {
			if (timer) clearTimeout(timer);
			controller.abort();
		};
	}, [year, month, ownerId, setSnapshot]);

	const refreshStats = () =>
		fetchStats(undefined, ownerId || null)
			.then(setStats)
			.catch(() => setStats([]));
	useEffect(() => {
		refreshStats();
	}, [ownerId]);

	const allocated = useMemo(
		() =>
			categories.map((c) => ({
				...c,
				allocated: (Number(c.amount) || 0) / 100,
				remaining: Math.max(0, ((Number(c.amount) || 0) - (c.spent || 0)) / 100),
			})),
		[categories]
	);

	const totalSpent = useMemo(
		() => allocated.reduce((s, c) => s + (c.spent || 0) / 100, 0),
		[allocated]
	);
	const totalAllocated = allocated.reduce((s, c) => s + c.allocated, 0);
	const totalRemaining = Math.max(0, income / 100 - totalAllocated);

	const pieData = allocated.map((c) => ({
		name: c.name,
		value: c.allocated, // оставляем дробные значения, чтобы проценты считались точнее
	}));
	const barData = allocated.map((c) => ({
		name: c.name,
		spent: Math.round((c.spent || 0) / 100),
		allocated: Math.round(c.allocated),
	}));

	const currentStat = useMemo(() => {
		if (!Array.isArray(stats)) return null;
		return stats.find((s) => s.year === year && s.month === month) || null;
	}, [stats, year, month]);

	return (
		<main className={styles.main}>
			<BudgetHeader year={year} month={month} currencyCode={currencyCode} stat={currentStat} ownerId={ownerId || undefined} />
			<Controls
				onAfterChange={refreshStats}
				totalRemaining={currency(totalRemaining, currencyCode)}
			/>
			<Charts
				pieData={pieData}
				barData={barData}
				currencyCode={currencyCode}
			/>
			<Categories onAfterChange={refreshStats} />
			<MonthlyStats stats={stats} />
			<SavingsCard
				currencyCode={currencyCode}
				onAfterRecalculate={refreshStats}
			/>
		</main>
	);
}
