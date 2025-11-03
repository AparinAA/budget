"use client";
import { useState, useEffect } from "react";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { useBudgetStore } from "@/shared/store/budgetStore";
import { currency } from "@/shared/lib/format";
import { ModalHeader } from "@/shared/ui/ModalHeader";

export function ExpensesListModal({
	isOpen,
	onClose,
	categoryId,
	categoryName,
}) {
	const { year, month, ownerId, currency: currencyCode } = useBudgetStore();
	const [expenses, setExpenses] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Блокировка скролла фона при открытии модального окна
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const loadExpenses = () => {
		if (!categoryId) return;

		setLoading(true);
		setError("");

		const params = new URLSearchParams({
			year: String(year),
			month: String(month),
			categoryId,
		});
		if (ownerId) params.set("ownerId", ownerId);

		fetch(`/api/budget/expenses?${params}`)
			.then((res) => {
				if (!res.ok) throw new Error("Не удалось загрузить расходы");
				return res.json();
			})
			.then((data) => {
				setExpenses(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	};

	useEffect(() => {
		if (!isOpen) return;
		loadExpenses();
	}, [isOpen, categoryId, year, month, ownerId]);

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const day = date.getDate();
		const months = [
			"янв",
			"фев",
			"мар",
			"апр",
			"мая",
			"июн",
			"июл",
			"авг",
			"сен",
			"окт",
			"ноя",
			"дек",
		];
		const monthName = months[date.getMonth()];
		return `${hours}:${minutes} ${day} ${monthName}`;
	};

	return (
		<div className={styles.backdrop} onClick={handleBackdropClick}>
			<div className={styles.modal}>
				<ModalHeader title={categoryName} onClose={onClose} />

				<div className={styles.subtitle}>Журнал расходов</div>

				{loading && <div className={styles.loading}>Загрузка...</div>}

				{error && <div className={styles.error}>{error}</div>}

				{!loading && !error && expenses.length === 0 && (
					<div className={styles.empty}>Расходов пока нет</div>
				)}

				{!loading && !error && expenses.length > 0 && (
					<div className={styles.list}>
						{expenses.map((expense) => {
							const amount = expense.amount / 100;
							const isExpense = amount > 0;
							const sign = isExpense ? "-" : "+";
							const displayAmount = Math.abs(amount);

							return (
								<div
									key={expense.id}
									className={styles.expenseItem}
								>
									<div
										className={styles.expenseAmount}
										style={{
											color: isExpense
												? "var(--text-primary)"
												: "#57d9a3",
										}}
									>
										{sign}{" "}
										{currency(displayAmount, currencyCode)}
									</div>
									<div className={styles.expenseDate}>
										{formatDate(expense.createdAt)}
									</div>
									{expense.note && (
										<div className={styles.expenseNote}>
											{expense.note}
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
