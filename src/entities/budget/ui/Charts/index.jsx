"use client";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
} from "recharts";
import { COLORS } from "@/shared/ui/colors";
import { currency } from "@/shared/lib/format";

export function Charts({ pieData, barData, currencyCode }) {
	const totalPie = Array.isArray(pieData)
		? pieData.reduce((s, d) => s + (Number(d?.value) || 0), 0)
		: 0;
	return (
		<section className={styles.grid2}>
			<div className={kit.card}>
				<h3 className={kit.cardTitle}>Распределение бюджета</h3>
				<div className={styles.chartH}>
					<ResponsiveContainer>
						<PieChart>
							<Pie
								data={pieData}
								dataKey="value"
								nameKey="name"
								outerRadius={100}
								label={false}
								labelLine={false}
							>
								{pieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								content={({ active, payload }) => {
									if (!active || !payload || !payload.length) return null;
									const p0 = payload[0];
									const name = p0?.payload?.name ?? p0?.name ?? "";
									const valueNum = Number(p0?.value) || 0;
									const pct = totalPie > 0 ? Math.round((valueNum / totalPie) * 100) : 0;
									return (
										<div style={{ background: "#0b1220", border: "1px solid #1f2a37", padding: 8, borderRadius: 6 }}>
											<div style={{ color: "#9fb3c8" }}>{name}</div>
											<div style={{ color: "#e6edf3", fontWeight: 600 }}>{currency(valueNum, currencyCode)} ({pct}%)</div>
										</div>
									);
								}}
							/>
						</PieChart>
					</ResponsiveContainer>
				</div>
			</div>
			<div className={kit.card}>
				<h3 className={kit.cardTitle}>План vs факт</h3>
				<div className={styles.chartH}>
					<ResponsiveContainer>
						<BarChart data={barData}>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="#213040"
							/>
							<XAxis dataKey="name" stroke="#9fb3c8" />
							<YAxis stroke="#9fb3c8" />
							<Tooltip
								formatter={(v) => currency(v, currencyCode)}
							/>
							<Legend />
							<Bar
								dataKey="allocated"
								name="План"
								fill="#57d9a3"
							/>
							<Bar dataKey="spent" name="Факт" fill="#6aa9ff" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</section>
	);
}
