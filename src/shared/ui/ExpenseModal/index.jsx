"use client";
import { useState, useEffect, useRef } from "react";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { postAction } from "@/shared/api/budget";
import { useBudgetStore } from "@/shared/store/budgetStore";

export function ExpenseModal({ isOpen, onClose, categoryId, categoryName, category }) {
	const { year, month, setSnapshot, ownerId, categories } = useBudgetStore();
	const [amount, setAmount] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	
	// Локальные состояния для кнопок
	const [isSaving, setIsSaving] = useState(false);
	const [rolloverEnabled, setRolloverEnabled] = useState(false);
	const [rolloverTargetId, setRolloverTargetId] = useState("");

	// Используем useRef для хранения актуального значения amount
	const amountRef = useRef(amount);
	
	useEffect(() => {
		amountRef.current = amount;
	}, [amount]);

	// Отдельный useEffect для управления состоянием MainButton в зависимости от amount
	useEffect(() => {
		if (!isOpen) return;
		
		if (window.Telegram?.WebApp?.MainButton) {
			const mainButton = window.Telegram.WebApp.MainButton;
			const amountNum = Number(amount);
			
			if (!amount || !amountNum || amountNum <= 0) {
				mainButton.disable();
			} else {
				mainButton.enable();
			}
		}
	}, [amount, isOpen]);

	useEffect(() => {
		if (isOpen && category) {
			// Инициализируем состояния из категории
			setIsSaving(!!category.isSaving);
			setRolloverEnabled(!!category.rolloverEnabled);
			setRolloverTargetId(category.rolloverTargetId || "");
		}
	}, [isOpen, category]);

	// Отдельный useEffect для MainButton, чтобы не пересоздавать при каждом изменении amount
	useEffect(() => {
		if (!isOpen) return;

		// Получаем ширину scrollbar
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		
		// Блокируем скролл при открытии модалки
		document.body.style.overflow = "hidden";
		
		// Компенсируем ширину scrollbar, чтобы избежать скачков
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}

		// Настраиваем Telegram MainButton
		if (window.Telegram?.WebApp?.MainButton) {
			const mainButton = window.Telegram.WebApp.MainButton;
			mainButton.setText("Добавить расход");
			mainButton.show();
			mainButton.enable();
			
			// Обработчик клика
			const handleMainButtonClick = () => {
				const amountNum = Number(amountRef.current);
				if (!amountNum || amountNum <= 0) {
					setError("Неверная сумма");
					// Haptic feedback для ошибки
					if (window.Telegram?.WebApp?.HapticFeedback) {
						window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
					}
					return;
				}

				setIsSubmitting(true);
				mainButton.showProgress();
				mainButton.disable();

				const amountCents = Math.floor(amountNum * 100);
				postAction("addExpense", {
					year,
					month,
					categoryId,
					amount: amountCents,
					ownerId: ownerId || null,
				})
					.then((snap) => {
						setSnapshot(snap);
						setAmount("");
						// Haptic feedback для успеха
						if (window.Telegram?.WebApp?.HapticFeedback) {
							window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
						}
						mainButton.hideProgress();
						mainButton.enable();
						onClose();
					})
					.catch(() => {
						setError("Неверные параметры");
						// Haptic feedback для ошибки
						if (window.Telegram?.WebApp?.HapticFeedback) {
							window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
						}
						mainButton.hideProgress();
						mainButton.enable();
					})
					.finally(() => {
						setIsSubmitting(false);
					});
			};

			mainButton.onClick(handleMainButtonClick);

			return () => {
				mainButton.offClick(handleMainButtonClick);
				mainButton.hide();
				document.body.style.overflow = "";
				document.body.style.paddingRight = "";
			};
		}

		return () => {
			document.body.style.overflow = "";
			document.body.style.paddingRight = "";
		};
	}, [isOpen, year, month, categoryId, ownerId, setSnapshot, onClose]);	if (!isOpen) return null;

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

	const handleToggleSaving = async () => {
		const newValue = !isSaving;
		setIsSaving(newValue);
		
		try {
			const snap = await postAction("setCategorySaving", {
				year,
				month,
				categoryId,
				isSaving: newValue,
				ownerId: ownerId || null,
			});
			setSnapshot(snap);
			await postAction("recalculateSavings", { year, month, ownerId: ownerId || null });
			window.dispatchEvent(new Event("refresh-savings"));
		} catch (err) {
			setIsSaving(!newValue); // Откатываем при ошибке
		}
	};

	const handleToggleRollover = async () => {
		const newValue = !rolloverEnabled;
		setRolloverEnabled(newValue);
		
		try {
			const snap = await postAction("setCategoryRollover", {
				year,
				month,
				categoryId,
				rolloverEnabled: newValue,
				rolloverTargetId: rolloverTargetId || "",
				ownerId: ownerId || null,
			});
			setSnapshot(snap);
			await postAction("recalculateSavings", { year, month, ownerId: ownerId || null });
			window.dispatchEvent(new Event("refresh-savings"));
		} catch (err) {
			setRolloverEnabled(!newValue); // Откатываем при ошибке
		}
	};

	const handleChangeRolloverTarget = async (e) => {
		const val = e.target.value || null;
		setRolloverTargetId(val);
		
		try {
			const snap = await postAction("setCategoryRollover", {
				year,
				month,
				categoryId,
				rolloverEnabled: true,
				rolloverTargetId: val,
				ownerId: ownerId || null,
			});
			setSnapshot(snap);
			await postAction("recalculateSavings", { year, month, ownerId: ownerId || null });
			window.dispatchEvent(new Event("refresh-savings"));
		} catch (err) {
			// При ошибке можно откатить
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

				<div className={styles.controls}>
					<button
						type="button"
						aria-pressed={isSaving}
						className={kit.button}
						style={{
							background: isSaving ? "#256c43" : undefined,
							borderColor: isSaving ? "#2b8857" : undefined,
						}}
						onClick={handleToggleSaving}
						disabled={isSubmitting}
					>
						Копить
					</button>

					<button
						type="button"
						aria-pressed={rolloverEnabled}
						className={kit.button}
						style={{
							background: rolloverEnabled ? "#374151" : undefined,
							borderColor: rolloverEnabled ? "#4b5563" : undefined,
							opacity: isSaving ? 0.6 : 1,
							cursor: isSaving ? "not-allowed" : "pointer",
						}}
						onClick={handleToggleRollover}
						disabled={isSubmitting || isSaving}
					>
						Переносить остаток →
					</button>

					{rolloverEnabled && (
						<select
							value={rolloverTargetId}
							onChange={handleChangeRolloverTarget}
							className={kit.input}
							disabled={isSubmitting}
						>
							<option value="">Выберите копящую категорию</option>
							{categories
								.filter((x) => x.isSaving && x.id !== categoryId)
								.map((opt) => (
									<option key={opt.id} value={opt.id}>
										{opt.name}
									</option>
								))}
						</select>
					)}
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
				</form>
			</div>
		</div>
	);
}
