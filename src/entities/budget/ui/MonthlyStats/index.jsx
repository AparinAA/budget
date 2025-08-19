"use client";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { currency } from "@/shared/lib/format";
import { useBudgetStore } from "@/shared/store/budgetStore";

export function MonthlyStats({ stats }) {
	const { year, month } = useBudgetStore();
	const safeStats = Array.isArray(stats) ? stats : [];
	const handlePick = (s) => {
		useBudgetStore.setState((st) => ({
			...st,
			year: s.year,
			month: s.month,
		}));
	};
	return (
		<section className={kit.card}>
			<h3 className={kit.cardTitle}>Статистика по месяцам</h3>
			<div className={kit.tableWrap}>
				<table className={kit.table}>
					<thead>
						<tr className={kit.tableHead}>
							<th className={kit.theadTh}>Месяц</th>
							<th className={kit.theadTh}>Год</th>
							<th className={kit.theadTh}>Доход</th>
							<th className={kit.theadTh}>Расходы</th>
							<th className={kit.theadTh}>Валюта</th>
						</tr>
					</thead>
					<tbody>
						{safeStats.map((s) => (
							<tr
								key={s.id}
								onClick={() => handlePick(s)}
								className={`${kit.trClickable} ${s.year === year && s.month === month ? styles.selected : ""}`}
							>
								<td className={kit.td}>{s.month}</td>
								<td className={kit.td}>{s.year}</td>
								<td className={kit.td}>
									{currency(
										s.totalIncome / 100,
										s.currencyCode
									)}
								</td>
								<td className={kit.td}>
									{currency(
										s.totalExpenses / 100,
										s.currencyCode
									)}
								</td>
								<td className={kit.td}>{s.currencyCode}</td>
							</tr>
						))}
						{safeStats.length === 0 && (
							<tr>
								<td colSpan={5} className={kit.empty}>
									Нет данных по месяцам
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
