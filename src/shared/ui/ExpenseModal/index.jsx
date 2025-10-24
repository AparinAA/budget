"use client";
import { useState, useEffect } from "react";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { postAction } from "@/shared/api/budget";
import { useBudgetStore } from "@/shared/store/budgetStore";

export function ExpenseModal({ isOpen, onClose, categoryId, categoryName }) {
	const { year, month, setSnapshot, ownerId } = useBudgetStore();
	const [amount, setAmount] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			// Блокируем скролл при открытии модалки
			document.body.style.overflow = "hidden";
		} else {
			// Восстанавливаем скролл при закрытии
			document.body.style.overflow = "";
		}

		// Очищаем при размонтировании компонента
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		const amountNum = Number(amount);
		if (!amountNum || amountNum <= 0) {
			setError("Неверные параметры");
			return;
		}

		setIsSubmitting(true);
		try {
			const amountCents = Math.floor(amountNum * 100);
			const snap = await postAction("addExpense", {
				year,
				month,
				categoryId,
				amount: amountCents,
				ownerId: ownerId || null,
			});
			setSnapshot(snap);
			setAmount("");
			onClose();
		} catch (err) {
			setError("Неверные параметры");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div className={styles.backdrop} onClick={handleBackdropClick}>
			<div className={styles.modal}>
				<div className={styles.header}>
					<button
						type="button"
						onClick={onClose}
						className={kit.button}
						disabled={isSubmitting}
					>
						← Назад
					</button>
					<h3 className={styles.title}>{categoryName}</h3>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					<label className={kit.label}>Сумма расхода</label>
					<input
						type="number"
						min="0"
						step="0.01"
						value={amount}
						onChange={(e) => {
							setAmount(e.target.value);
							setError("");
						}}
						placeholder="Введите сумму"
						className={kit.input}
						disabled={isSubmitting}
						autoFocus
					/>

					{error && <div className={styles.error}>{error}</div>}

					<button
						type="submit"
						className={kit.button}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Добавление..." : "Добавить расход"}
					</button>
				</form>
			</div>
		</div>
	);
}
