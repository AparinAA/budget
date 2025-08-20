"use client";
import { useEffect, useRef, useState } from "react";
import kit from "@/shared/ui/kit.module.css";
import { useBudgetStore } from "@/shared/store/budgetStore";
import { postAction } from "@/shared/api/budget";

export function Controls({ onAfterChange, totalRemaining }) {
	const {
		year,
		month,
		income,
		currency: currencyCode,
		categories,
		setSnapshot,
		ownerId,
	} = useBudgetStore();
	const [incomeRub, setIncomeRub] = useState("");
	const [newCat, setNewCat] = useState({ name: "", percent: "" });
	const [expense, setExpense] = useState({ catId: "", amount: "" });

	useEffect(() => {
		setIncomeRub(String(Math.round((income || 0) / 100)) || "");
	}, [income]);

	function handleAddCategory(e) {
		e.preventDefault();
		if (!newCat.name) return;
		postAction("addCategory", {
			year,
			month,
			name: newCat.name,
			percent: Number(newCat.percent) || 0,
			ownerId: ownerId || null,
		})
			.then((snap) => {
				setSnapshot(snap);
				onAfterChange?.();
				setNewCat({ name: "", percent: "" });
			})
			.catch(() => {});
	}

	function handleAddExpense(e) {
		e.preventDefault();
		if (!expense.catId || !expense.amount) return;
		const amountCents = Math.floor(Number(expense.amount) * 100);
		postAction("addExpense", {
			year,
			month,
			categoryId: expense.catId,
			amount: amountCents,
			ownerId: ownerId || null,
		})
			.then((snap) => {
				setSnapshot(snap);
				onAfterChange?.();
				setExpense({ catId: "", amount: "" });
			})
			.catch(() => {});
	}

	const incomeTimerRef = useRef(null);
	const incomeAbortRef = useRef(null);
	function handleSetIncome(e) {
		const v = e.target.value;
		setIncomeRub(v);
		const cents = Math.max(0, Math.floor(Number(v || 0) * 100));
		if (incomeTimerRef.current) clearTimeout(incomeTimerRef.current);
		if (incomeAbortRef.current) incomeAbortRef.current.abort();
		const controller = new AbortController();
		incomeAbortRef.current = controller;
		incomeTimerRef.current = setTimeout(() => {
			postAction("setIncome", { year, month, income: cents, ownerId: ownerId || null }, { signal: controller.signal })
				.then((snap) => {
					setSnapshot(snap);
					onAfterChange?.();
				})
				.catch(() => {})
				.finally(() => {
					incomeAbortRef.current = null;
				});
		}, 1000);
	}

	return (
		<section className={kit.card}>
			<div className={kit.rowLg}>
				<label className={kit.label}>Период</label>
				<MonthSelect />
				<YearSelect />
			</div>

			<div className={kit.rowLg}>
				<label className={kit.label}>Месячный доход</label>
				<input
					value={incomeRub}
					onChange={handleSetIncome}
					type="number"
					min="0"
					placeholder="e.g., 5000"
					className={kit.input}
				/>
				<div className={`${kit.mlAuto} ${kit.label}`}>
					Остаток:{" "}
					<b style={{ color: "#e6edf3" }}>{totalRemaining}</b>
				</div>
			</div>

			<div className={kit.row}>
				<label className={kit.label}>Валюта</label>
				<CurrencySelect onAfterChange={onAfterChange} />
			</div>

			<form onSubmit={handleAddCategory} className={kit.row}>
				<input
					value={newCat.name}
					onChange={(e) =>
						setNewCat((s) => ({ ...s, name: e.target.value }))
					}
					placeholder="Новая категория"
					className={kit.input}
				/>
				<input
					value={newCat.percent}
					onChange={(e) =>
						setNewCat((s) => ({ ...s, percent: e.target.value }))
					}
					type="number"
					min="0"
					max="100"
					placeholder="% от дохода"
					className={kit.input}
					style={{ width: 140 }}
				/>
				<button type="submit" className={kit.button}>
					Добавить категорию
				</button>
			</form>

			<form onSubmit={handleAddExpense} className={kit.row}>
				<select
					value={expense.catId}
					onChange={(e) =>
						setExpense((s) => ({ ...s, catId: e.target.value }))
					}
					className={kit.input}
					style={{ width: 220 }}
				>
					<option value="">Выбрать категорию</option>
					{categories.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
				<input
					value={expense.amount}
					onChange={(e) =>
						setExpense((s) => ({ ...s, amount: e.target.value }))
					}
					type="number"
					min="0"
					placeholder="Сумма траты"
					className={kit.input}
					style={{ width: 160 }}
				/>
				<button type="submit" className={kit.button}>
					Добавить расход
				</button>
			</form>
		</section>
	);
}

function MonthSelect() {
	const { month } = useBudgetStore();
	const monthOptions = [
		{ value: 1, label: "Январь" },
		{ value: 2, label: "Февраль" },
		{ value: 3, label: "Март" },
		{ value: 4, label: "Апрель" },
		{ value: 5, label: "Май" },
		{ value: 6, label: "Июнь" },
		{ value: 7, label: "Июль" },
		{ value: 8, label: "Август" },
		{ value: 9, label: "Сентябрь" },
		{ value: 10, label: "Октябрь" },
		{ value: 11, label: "Ноябрь" },
		{ value: 12, label: "Декабрь" },
	];
	const handleChangeMonth = (m) =>
		useBudgetStore.setState((s) => ({ ...s, month: m }));
	return (
		<select
			value={month}
			onChange={(e) => handleChangeMonth(Number(e.target.value))}
			className={kit.input}
			style={{ width: 180 }}
		>
			{monthOptions.map((m) => (
				<option key={m.value} value={m.value}>
					{m.label}
				</option>
			))}
		</select>
	);
}

function YearSelect() {
	const { year } = useBudgetStore();
	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 7 }).map(
		(_, i) => currentYear - 3 + i
	);
	const handleChangeYear = (y) =>
		useBudgetStore.setState((s) => ({ ...s, year: y }));
	return (
		<select
			value={year}
			onChange={(e) => handleChangeYear(Number(e.target.value))}
			className={kit.input}
			style={{ width: 120 }}
		>
			{yearOptions.map((y) => (
				<option key={y} value={y}>
					{y}
				</option>
			))}
		</select>
	);
}

function CurrencySelect({ onAfterChange }) {
	const {
		currency: currencyCode,
		year,
		month,
	ownerId,
		setSnapshot,
	} = useBudgetStore();
	const options = [
		{ code: "RUB", label: "RUB — ₽" },
		{ code: "EUR", label: "EUR — €" },
		{ code: "USD", label: "USD — $" },
		{ code: "GBP", label: "GBP — £" },
	];
	const timerRef = useRef(null);
	const abortRef = useRef(null);
	return (
		<select
			value={currencyCode}
			onChange={(e) => {
				if (timerRef.current) clearTimeout(timerRef.current);
				if (abortRef.current) abortRef.current.abort();
				const controller = new AbortController();
				abortRef.current = controller;
				const value = e.target.value;
				// Мгновенно обновляем UI валюту, сеть — с дебаунсом
				useBudgetStore.setState((s) => ({ ...s, currency: value }));
				timerRef.current = setTimeout(() => {
					postAction("setCurrency", { year, month, currencyCode: value, ownerId: ownerId || null }, { signal: controller.signal })
						.then((snap) => { setSnapshot(snap); typeof onAfterChange === "function" && onAfterChange(); })
						.catch(() => {})
						.finally(() => { abortRef.current = null; });
				}, 1000);
			}}
			className={kit.input}
			style={{ width: 180 }}
		>
			{options.map((o) => (
				<option key={o.code} value={o.code}>
					{o.label}
				</option>
			))}
		</select>
	);
}
