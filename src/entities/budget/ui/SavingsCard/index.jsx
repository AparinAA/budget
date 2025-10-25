"use client";
import { useEffect, useState } from "react";
import kit from "@/shared/ui/kit.module.css";
import { fetchSavings, postAction } from "@/shared/api/budget";
import { currency } from "@/shared/lib/format";
import { useBudgetStore } from "@/shared/store/budgetStore";
import { RefreshIcon } from "@/shared/ui/icons";

export function SavingsCard({ currencyCode, onAfterRecalculate }) {
	const { year, month, ownerId } = useBudgetStore();
	const [data, setData] = useState({ totalBank: 0, transfers: [] });

	const load = () =>
		fetchSavings(undefined, ownerId || null)
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
	}, [ownerId]);

	const { totalBank, transfers } = data;

	return (
		<section className={kit.card}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
				<h3 className={kit.cardTitle} style={{ marginBottom: 0, marginTop: 0 }}>
					Накопления
				</h3>
				<button
					className={kit.button}
					onClick={() =>
						postAction("recalculateSavings", { year, month, ownerId: ownerId || null })
							.then(() => {
								onAfterRecalculate?.();
								load();
							})
							.catch(() => {})
					}
					style={{ padding: "6px 10px", minHeight: "32px" }}
					title="Пересчитать за период"
				>
					<RefreshIcon size={14} />
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
