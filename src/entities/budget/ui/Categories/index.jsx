"use client";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { useMemo } from "react";
import { COLORS } from "@/shared/ui/colors";
import { currency } from "@/shared/lib/format";
import { useBudgetStore } from "@/shared/store/budgetStore";
import { postAction } from "@/shared/api/budget";

export function Categories({ onAfterChange }) {
	const {
		year,
		month,
		income,
		currency: currencyCode,
		categories,
		setSnapshot,
	} = useBudgetStore();

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

	return (
		<section className={kit.card}>
			<h3 className={kit.cardTitle}>Категории</h3>
			<div style={{ display: "grid", gap: 12 }}>
				{allocated.map((c, idx) => (
					<div key={c.id} className={styles.categoryItem}>
						<div className={styles.topRow}>
							<div className={styles.nameRow}>
								<div
									className={styles.dot}
									style={{
										background: COLORS[idx % COLORS.length],
									}}
								/>
								<div style={{ fontWeight: 500 }}>{c.name}</div>
								<label
									className={kit.label}
									style={{
										display: "flex",
										gap: 6,
										alignItems: "center",
										marginLeft: 10,
									}}
								>
									<input
										type="checkbox"
										checked={!!c.isSaving}
										onChange={(e) =>
											postAction("setCategorySaving", {
												year,
												month,
												categoryId: c.id,
												isSaving: e.target.checked,
											})
												.then((snap) => {
													setSnapshot(snap);
													onAfterChange?.();
													return postAction(
														"recalculateSavings",
														{ year, month }
													).catch(() => {});
												})
												.then(() => {
													window.dispatchEvent(
														new Event(
															"refresh-savings"
														)
													);
												})
												.catch(() => {})
										}
									/>
									Копить
								</label>
								<label
									className={kit.label}
									style={{
										display: "flex",
										gap: 6,
										alignItems: "center",
										marginLeft: 10,
									}}
								>
									<input
										type="checkbox"
										checked={!!c.rolloverEnabled}
										onChange={(e) =>
											postAction("setCategoryRollover", {
												year,
												month,
												categoryId: c.id,
												rolloverEnabled:
													e.target.checked,
												rolloverTargetId:
													c.rolloverTargetId || "",
											})
												.then((snap) => {
													setSnapshot(snap);
													return postAction(
														"recalculateSavings",
														{ year, month }
													).catch(() => {});
												})
												.then(() => {
													window.dispatchEvent(
														new Event(
															"refresh-savings"
														)
													);
													onAfterChange?.();
												})
												.catch(() => {})
										}
										disabled={c.isSaving}
									/>
									Переносить остаток →
								</label>
								{c.rolloverEnabled && (
									<select
										value={c.rolloverTargetId ?? ""}
										onChange={(e) =>
											postAction("setCategoryRollover", {
												year,
												month,
												categoryId: c.id,
												rolloverEnabled: true,
												rolloverTargetId:
													e.target.value || null,
											})
												.then((snap) => {
													setSnapshot(snap);
													return postAction(
														"recalculateSavings",
														{ year, month }
													).catch(() => {});
												})
												.then(() => {
													window.dispatchEvent(
														new Event(
															"refresh-savings"
														)
													);
													onAfterChange?.();
												})
												.catch(() => {})
										}
										className={kit.input}
										style={{ width: 200 }}
									>
										<option value="">
											Выберите копящую категорию
										</option>
										{categories
											.filter(
												(x) =>
													x.isSaving && x.id !== c.id
											)
											.map((opt) => (
												<option
													key={opt.id}
													value={opt.id}
												>
													{opt.name}
												</option>
											))}
									</select>
								)}
							</div>
							<div className={kit.label}>
								{c.percent}% →{" "}
								{currency(c.allocated, currencyCode)}
							</div>
							<div className={kit.label}>
								Потрачено:{" "}
								{currency((c.spent || 0) / 100, currencyCode)}
							</div>
							{c.isSaving && (
								<div style={{ color: "#57d9a3", fontSize: 13 }}>
									К накоплению:{" "}
									{currency(
										Math.max(
											0,
											c.allocated - (c.spent || 0) / 100
										),
										currencyCode
									)}
								</div>
							)}
							<button
								onClick={() =>
									postAction("removeCategory", {
										year,
										month,
										categoryId: c.id,
									})
										.then((snap) => {
											setSnapshot(snap);
											onAfterChange?.();
										})
										.catch(() => {})
								}
								className={`${kit.button} ${kit.buttonSecondary} ${kit.mlAuto}`}
							>
								Удалить
							</button>
						</div>
						<div>
							<div className={styles.progress}>
								<div
									className={styles.progressFill}
									style={{
										width: `${Math.min(100, (c.spent / 100 / (c.allocated || 1)) * 100)}%`,
										background: COLORS[idx % COLORS.length],
									}}
								/>
							</div>
							<div className={styles.percentRow}>
								<span
									className={kit.muted}
									style={{ fontSize: 12 }}
								>
									Изменить %
								</span>
								<input
									type="number"
									min="0"
									max="100"
									value={c.percent}
									onChange={(e) =>
										postAction("setCategoryPercent", {
											year,
											month,
											categoryId: c.id,
											percent:
												Number(e.target.value) || 0,
										})
											.then(setSnapshot)
											.catch(() => {})
									}
									className={kit.input}
									style={{ width: 100 }}
								/>
								<span
									className={`${kit.muted} ${kit.mlAuto}`}
									style={{ fontSize: 12 }}
								>
									Остаток:{" "}
									<b style={{ color: "#e6edf3" }}>
										{currency(c.remaining, currencyCode)}
									</b>
								</span>
							</div>
						</div>
					</div>
				))}
				{allocated.length === 0 && (
					<div className={kit.muted}>
						Добавьте хотя бы одну категорию
					</div>
				)}
			</div>
		</section>
	);
}
