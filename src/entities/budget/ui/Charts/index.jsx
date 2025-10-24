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
			<div className={styles.chartH}>
				<h3 className={kit.cardTitle}>Распределение бюджета</h3>
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
									<div style={{ 
										background: "var(--bg-secondary)", 
										border: "1px solid var(--border-primary)", 
										padding: "8px 12px", 
										borderRadius: "var(--radius-md)" 
									}}>
										<div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{name}</div>
										<div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
											{currency(valueNum, currencyCode)} ({pct}%)
										</div>
									</div>
								);
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className={styles.chartH}>
				<h3 className={kit.cardTitle}>План vs факт</h3>
				<ResponsiveContainer>
					<BarChart data={barData}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="var(--border-primary)"
						/>
						<XAxis dataKey="name" stroke="var(--text-secondary)" />
						<YAxis stroke="var(--text-secondary)" />
						<Tooltip
							formatter={(v) => currency(v, currencyCode)}
							contentStyle={{
								background: "var(--bg-secondary)",
								border: "1px solid var(--border-primary)",
								borderRadius: "var(--radius-md)"
							}}
							labelStyle={{ color: "var(--text-primary)" }}
							itemStyle={{ color: "var(--text-primary)" }}
						/>
						<Legend 
							wrapperStyle={{ color: "var(--text-primary)" }}
						/>
						<Bar
							dataKey="allocated"
							name="План"
							fill="var(--success)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar 
							dataKey="spent" 
							name="Факт" 
							fill="var(--accent-primary)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}
