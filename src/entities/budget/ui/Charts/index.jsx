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
								label
							>
								{pieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip
								formatter={(v) => currency(v, currencyCode)}
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
