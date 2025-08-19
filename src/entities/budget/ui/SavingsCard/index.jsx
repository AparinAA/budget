"use client";
import { useEffect, useState } from "react";
import kit from "@/shared/ui/kit.module.css";
import { fetchSavings, postAction } from "@/shared/api/budget";
import { currency } from "@/shared/lib/format";
import { useBudgetStore } from "@/shared/store/budgetStore";

export function SavingsCard({ currencyCode, onAfterRecalculate }) {
	const { year, month } = useBudgetStore();
	const [data, setData] = useState({ totalBank: 0, transfers: [] });

	const load = () =>
		fetchSavings()
			.then((d) =>
				setData(
					d && typeof d === "object"
						? d
						: { totalBank: 0, transfers: [] }
				)
			)
			.catch(() => setData({ totalBank: 0, transfers: [] }));

	useEffect(() => {
		load();
		const handler = () => load();
		window.addEventListener("refresh-savings", handler);
		return () => window.removeEventListener("refresh-savings", handler);
	}, []);

	const { totalBank, transfers } = data;

	return (
		<section className={kit.card}>
			<div className={kit.rowLg} style={{ marginBottom: 8 }}>
				<h3 className={kit.cardTitle} style={{ marginBottom: 0 }}>
					Накопления
				</h3>
				<button
					className={kit.button}
					onClick={() =>
						postAction("recalculateSavings", { year, month })
							.then(() => {
								onAfterRecalculate?.();
								load();
							})
							.catch(() => {})
					}
				>
					Пересчитать за период
				</button>
			</div>
			<div className={kit.muted} style={{ marginBottom: 8 }}>
				Всего накоплено:{" "}
				<b style={{ color: "#e6edf3" }}>
					{currency(totalBank / 100, currencyCode)}
				</b>
			</div>
			<div className={kit.tableWrap}>
				<table className={kit.table}>
					<thead>
						<tr className={kit.tableHead}>
							<th className={kit.theadTh}>Месяц</th>
							<th className={kit.theadTh}>Год</th>
							<th className={kit.theadTh}>Категория</th>
							<th className={kit.theadTh}>Сумма</th>
						</tr>
					</thead>
					<tbody>
						{Array.isArray(transfers) && transfers.length > 0 ? (
							transfers.slice(0, 20).map((t) => (
								<tr key={t.id} className={kit.tr}>
									<td className={kit.td}>{t.month}</td>
									<td className={kit.td}>{t.year}</td>
									<td className={kit.td}>
										{t.category?.name || "—"}
									</td>
									<td className={kit.td}>
										{currency(
											t.amount / 100,
											t.currencyCode || currencyCode
										)}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={4} className={kit.empty}>
									Пока нет накоплений
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
