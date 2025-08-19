"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { useBudgetStore } from "@/shared/store/budgetStore";
import { fetchSnapshot, fetchStats, postAction } from "@/shared/api/budget";
import { currency } from "@/shared/lib/format";
import { Charts } from "@/entities/budget/ui/Charts";
import { Controls } from "@/entities/budget/ui/Controls";
import { Categories } from "@/entities/budget/ui/Categories";
import { MonthlyStats } from "@/entities/budget/ui/MonthlyStats";
import { SavingsCard } from "@/entities/budget/ui/SavingsCard";

export default function HomePage() {
	const {
		year,
		month,
		income,
		currency: currencyCode,
		categories,
		setSnapshot,
	} = useBudgetStore();
	const [stats, setStats] = useState([]);

	useEffect(() => {
		fetchSnapshot(year, month).then((snap) => setSnapshot(snap));
	}, [year, month, setSnapshot]);

	const refreshStats = () =>
		fetchStats()
			.then(setStats)
			.catch(() => setStats([]));
	useEffect(() => {
		refreshStats();
	}, []);

	const allocated = useMemo(
		() =>
			categories.map((c) => ({
				...c,
				allocated: (income / 100) * (c.percent / 100),
				remaining: Math.max(
					0,
					(income / 100) * (c.percent / 100) - (c.spent || 0) / 100
				),
			})),
		[categories, income]
	);

	const totalSpent = useMemo(
		() => allocated.reduce((s, c) => s + (c.spent || 0) / 100, 0),
		[allocated]
	);
	const totalRemaining = Math.max(0, income / 100 - totalSpent);

	const pieData = allocated.map((c) => ({
		name: c.name,
		value: Math.round(c.allocated),
	}));
	const barData = allocated.map((c) => ({
		name: c.name,
		spent: Math.round((c.spent || 0) / 100),
		allocated: Math.round(c.allocated),
	}));

	return (
		<main className={styles.main}>
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
