"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { postAction } from "@/shared/api/budget";
import { useBudgetStore } from "@/shared/store/budgetStore";
import {
	useExchangeRates,
	useTelegramMainButton,
	useTelegramMainButtonState,
	useCategorySettings,
} from "./hooks";
import { ModalHeader, CategoryControls, AmountInput } from "./components";

export function ExpenseModal({
	isOpen,
	onClose,
	categoryId,
	categoryName,
	category,
}) {
	const { year, month, setSnapshot, ownerId, categories } = useBudgetStore();
	const [amount, setAmount] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTelegram, setIsTelegram] = useState(false);
	const [selectedCurrency, setSelectedCurrency] = useState("RSD");
	const [operationType, setOperationType] = useState("add"); // 'add' или 'subtract'

	// Используем кастомные хуки
	const { exchangeRates, loadingRates } = useExchangeRates(isOpen);
	const {
		isSaving,
		rolloverEnabled,
		rolloverTargetId,
		handleToggleSaving,
		handleToggleRollover,
		handleChangeRolloverTarget,
	} = useCategorySettings(isOpen, category, categoryId);

	// Используем useRef для хранения актуального значения
	const amountRef = useRef(amount);
	const selectedCurrencyRef = useRef(selectedCurrency);
	const exchangeRatesRef = useRef(exchangeRates);
	const operationTypeRef = useRef(operationType);

	useEffect(() => {
		amountRef.current = amount;
	}, [amount]);

	useEffect(() => {
		selectedCurrencyRef.current = selectedCurrency;
	}, [selectedCurrency]);

	useEffect(() => {
		exchangeRatesRef.current = exchangeRates;
	}, [exchangeRates]);

	useEffect(() => {
		operationTypeRef.current = operationType;
	}, [operationType]);

	// Проверяем, запущено ли в Telegram Mini App
	useEffect(() => {
		setIsTelegram(!!window.Telegram?.WebApp?.initData);
	}, []);

	// Сброс валюты и типа операции при открытии
	useEffect(() => {
		if (isOpen) {
			setSelectedCurrency("RSD");
			setOperationType("add");
		}
	}, [isOpen]);

	// Функция для отправки расхода (стабильная с useCallback)
	const submitExpense = useCallback(
		async (amountCents, opType) => {
			setIsSubmitting(true);
			try {
				const action =
					opType === "subtract" ? "subtractExpense" : "addExpense";
				const snap = await postAction(action, {
					year,
					month,
					categoryId,
					amount: amountCents,
					ownerId: ownerId || null,
				});
				setSnapshot(snap);
				setAmount("");
				onClose();
			} finally {
				setIsSubmitting(false);
			}
		},
		[year, month, categoryId, ownerId, setSnapshot, onClose]
	);

	// Стабильная функция для установки ошибки
	const handleSetError = useCallback((message) => {
		setError(message);
	}, []);

	// Используем Telegram MainButton
	useTelegramMainButton({
		isOpen,
		isTelegram,
		amountRef,
		selectedCurrencyRef,
		exchangeRatesRef,
		operationTypeRef,
		onSubmit: submitExpense,
		onError: handleSetError,
	});

	useTelegramMainButtonState(isOpen, isTelegram, amount);

	// Обработчик для обычной кнопки (не Telegram)
	const handleAddExpense = async () => {
		const amountNum = Number(amount);
		if (!amountNum || amountNum <= 0) {
			setError("Неверная сумма");
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			// Конвертируем сумму в базовую валюту (EUR)
			let convertedAmount = amountNum;
			if (
				selectedCurrency !== "EUR" &&
				exchangeRates &&
				exchangeRates[selectedCurrency]
			) {
				convertedAmount = amountNum / exchangeRates[selectedCurrency];
			}

			const amountCents = Math.round(convertedAmount * 100);
			await submitExpense(amountCents, operationType);
		} catch (err) {
			setError("Неверные параметры");
			setIsSubmitting(false);
		}
	};

	const handleBackdropClick = (e) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className={styles.backdrop} onClick={handleBackdropClick}>
			<div className={styles.modal}>
				<ModalHeader
					categoryName={categoryName}
					isSubmitting={isSubmitting}
					onClose={onClose}
				/>

				<CategoryControls
					isSaving={isSaving}
					rolloverEnabled={rolloverEnabled}
					rolloverTargetId={rolloverTargetId}
					isSubmitting={isSubmitting}
					categories={categories}
					categoryId={categoryId}
					onToggleSaving={handleToggleSaving}
					onToggleRollover={handleToggleRollover}
					onChangeRolloverTarget={handleChangeRolloverTarget}
				/>

				<div className={styles.form}>
					<div className={styles.operationTypeToggle}>
						<button
							type="button"
							className={`${styles.toggleButton} ${operationType === "add" ? styles.active : ""}`}
							onClick={() => setOperationType("add")}
							disabled={isSubmitting}
						>
							+ Добавить расход
						</button>
						<button
							type="button"
							className={`${styles.toggleButton} ${operationType === "subtract" ? styles.active : ""}`}
							onClick={() => setOperationType("subtract")}
							disabled={isSubmitting}
						>
							− Вычесть сумму
						</button>
					</div>

					<AmountInput
						amount={amount}
						selectedCurrency={selectedCurrency}
						exchangeRates={exchangeRates}
						isSubmitting={isSubmitting}
						loadingRates={loadingRates}
						onAmountChange={(e) => {
							setAmount(e.target.value);
							setError("");
						}}
						onCurrencyChange={(e) =>
							setSelectedCurrency(e.target.value)
						}
					/>

					{error && <div className={styles.error}>{error}</div>}

					{!isTelegram && (
						<button
							type="button"
							onClick={handleAddExpense}
							disabled={
								isSubmitting || !amount || Number(amount) <= 0
							}
							className={kit.button}
							style={{
								width: "100%",
								marginTop: "var(--spacing-md)",
							}}
						>
							{isSubmitting
								? operationType === "subtract"
									? "Вычитание..."
									: "Добавление..."
								: operationType === "subtract"
									? "Вычесть сумму"
									: "Добавить расход"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
