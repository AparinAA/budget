"use client";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
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
		ownerId,
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

	// Локальные правки для мгновенного отображения без ожидания сети
	const [localEdits, setLocalEdits] = useState({}); // { [catId]: { percent?: string, isSaving?: boolean, rolloverEnabled?: boolean, rolloverTargetId?: string|null } }
	useEffect(() => {
		setLocalEdits((prev) => {
			const next = {};
			for (const c of categories) {
				// переносим существующие локальные правки, если есть
				next[c.id] = prev[c.id] || {};
			}
			return next;
		});
	}, [categories]);

	// Рефы для дебаунса и отмены по полям
	const percentRefs = useRef(new Map()); // id -> { t, controller }
	const savingRefs = useRef(new Map());
	const rolloverRefs = useRef(new Map());
	const targetRefs = useRef(new Map());

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
								{(() => {
									const active = localEdits[c.id]?.isSaving ?? !!c.isSaving;
									return (
										<button
											type="button"
											aria-pressed={active}
											className={kit.button}
											style={{ marginLeft: 10, background: active ? "#256c43" : undefined, borderColor: active ? "#2b8857" : undefined }}
											onClick={() => {
												const isSaving = !active;
												setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), isSaving } }));
												const cell = savingRefs.current.get(c.id) || { t: null, controller: null };
												if (cell.t) clearTimeout(cell.t);
												if (cell.controller) cell.controller.abort();
												const controller = new AbortController();
												cell.controller = controller;
												cell.t = setTimeout(() => {
													postAction("setCategorySaving", { year, month, categoryId: c.id, isSaving, ownerId: ownerId || null }, { signal: controller.signal })
														.then((snap) => {
															setSnapshot(snap);
															onAfterChange?.();
															return postAction("recalculateSavings", { year, month, ownerId: ownerId || null }).catch(() => {});
														})
														.then(() => {
															window.dispatchEvent(new Event("refresh-savings"));
														})
														.catch(() => {})
														.finally(() => { cell.controller = null; setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), isSaving: undefined } })); });
												}, 1000);
												savingRefs.current.set(c.id, cell);
											}}
										>
											Копить
										</button>
									);
								})()}
								{(() => {
									const active = localEdits[c.id]?.rolloverEnabled ?? !!c.rolloverEnabled;
									return (
										<button
											type="button"
											aria-pressed={active}
											className={kit.button}
											style={{ marginLeft: 10, background: active ? "#374151" : undefined, borderColor: active ? "#4b5563" : undefined, opacity: c.isSaving ? 0.6 : 1, cursor: c.isSaving ? "not-allowed" : "pointer" }}
											disabled={c.isSaving}
											onClick={() => {
												const rolloverEnabled = !active;
												setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), rolloverEnabled } }));
												const controller = new AbortController();
												const rolloverTargetId = (localEdits[c.id]?.rolloverTargetId ?? c.rolloverTargetId) || "";
												postAction("setCategoryRollover", { year, month, categoryId: c.id, rolloverEnabled, rolloverTargetId, ownerId: ownerId || null }, { signal: controller.signal })
													.then((snap) => {
														setSnapshot(snap);
														return postAction("recalculateSavings", { year, month, ownerId: ownerId || null }).catch(() => {});
													})
													.then(() => {
														window.dispatchEvent(new Event("refresh-savings"));
														onAfterChange?.();
													})
													.catch(() => {})
													.finally(() => { setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), rolloverEnabled: undefined } })); });
											}}
										>
											Переносить остаток →
										</button>
									);
								})()}
								{c.rolloverEnabled && (
									<select
										value={(localEdits[c.id]?.rolloverTargetId ?? c.rolloverTargetId) ?? ""}
										onChange={(e) => {
											const val = e.target.value || null;
											setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), rolloverTargetId: val } }));
											const controller = new AbortController();
											postAction("setCategoryRollover", { year, month, categoryId: c.id, rolloverEnabled: true, rolloverTargetId: val, ownerId: ownerId || null }, { signal: controller.signal })
												.then((snap) => {
													setSnapshot(snap);
													return postAction("recalculateSavings", { year, month, ownerId: ownerId || null }).catch(() => {});
												})
												.then(() => {
													window.dispatchEvent(new Event("refresh-savings"));
													onAfterChange?.();
												})
												.catch(() => {})
												.finally(() => { setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), rolloverTargetId: undefined } })); });
										}}
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
										ownerId: ownerId || null,
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
													value={localEdits[c.id]?.percent ?? String(c.percent)}
													onChange={(e) => {
														const raw = e.target.value;
														setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), percent: raw } }));
														const cell = percentRefs.current.get(c.id) || { t: null, controller: null };
														if (cell.t) clearTimeout(cell.t);
														if (cell.controller) cell.controller.abort();
														const controller = new AbortController();
														cell.controller = controller;
														const value = Math.max(0, Math.min(100, Number(raw) || 0));
														cell.t = setTimeout(() => {
															postAction("setCategoryPercent", { year, month, categoryId: c.id, percent: value, ownerId: ownerId || null }, { signal: controller.signal })
																.then((snap) => setSnapshot(snap))
																.catch(() => {})
																.finally(() => { cell.controller = null; setLocalEdits((s) => ({ ...s, [c.id]: { ...(s[c.id] || {}), percent: undefined } })); });
														}, 1000);
														percentRefs.current.set(c.id, cell);
													}}
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
