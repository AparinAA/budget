"use client";
import { useState, useEffect, useRef } from "react";
import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";
import { postAction } from "@/shared/api/budget";
import { useBudgetStore } from "@/shared/store/budgetStore";

export function ExpenseModal({ isOpen, onClose, categoryId, categoryName, category }) {
	const { year, month, setSnapshot, ownerId, categories, currency: baseCurrency } = useBudgetStore();
	const [amount, setAmount] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isTelegram, setIsTelegram] = useState(false);
	const [selectedCurrency, setSelectedCurrency] = useState("RSD");
	const [exchangeRates, setExchangeRates] = useState(null);
	const [loadingRates, setLoadingRates] = useState(false);
	
	// Локальные состояния для кнопок
	const [isSaving, setIsSaving] = useState(false);
	const [rolloverEnabled, setRolloverEnabled] = useState(false);
	const [rolloverTargetId, setRolloverTargetId] = useState("");

	// Используем useRef для хранения актуального значения amount и selectedCurrency
	const amountRef = useRef(amount);
	const selectedCurrencyRef = useRef(selectedCurrency);
	const exchangeRatesRef = useRef(exchangeRates);
	
	useEffect(() => {
		amountRef.current = amount;
	}, [amount]);
	
	useEffect(() => {
		selectedCurrencyRef.current = selectedCurrency;
	}, [selectedCurrency]);
	
	useEffect(() => {
		exchangeRatesRef.current = exchangeRates;
	}, [exchangeRates]);
	
	// Проверяем, запущено ли в Telegram Mini App
	useEffect(() => {
		setIsTelegram(!!window.Telegram?.WebApp?.initData);
	}, []);

	// Загружаем курсы валют при открытии модального окна
	useEffect(() => {
		if (!isOpen) return;

		const fetchExchangeRates = async () => {
			const CACHE_KEY = "exchange_rates_cache";
			const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

			try {
				// Проверяем кэш
				const cached = localStorage.getItem(CACHE_KEY);
				if (cached) {
					const { data, timestamp } = JSON.parse(cached);
					const now = Date.now();
					
					// Если кэш не протух, используем его
					if (now - timestamp < CACHE_TTL) {
						setExchangeRates(data);
						return;
					}
				}

				// Делаем запрос к API
				setLoadingRates(true);
				const response = await fetch(
					"https://api.fastforex.io/fetch-multi?from=EUR&to=EUR,RSD,USD,RUB&api_key=demo"
				);
				
				if (!response.ok) {
					throw new Error("Failed to fetch exchange rates");
				}

				const result = await response.json();
				
				// Сохраняем в кэш
				localStorage.setItem(
					CACHE_KEY,
					JSON.stringify({
						data: result.results,
						timestamp: Date.now(),
					})
				);

				setExchangeRates(result.results);
			} catch (err) {
				console.error("Error fetching exchange rates:", err);
				// Устанавливаем базовые курсы при ошибке
				setExchangeRates({ EUR: 1, RSD: 117.175, USD: 1.16274, RUB: 100.5 });
			} finally {
				setLoadingRates(false);
			}
		};

		fetchExchangeRates();
	}, [isOpen]);

	// Отдельный useEffect для управления состоянием MainButton в зависимости от amount (только в Telegram)
	useEffect(() => {
		if (!isOpen || !isTelegram) return;
		
		if (window.Telegram?.WebApp?.MainButton) {
			const mainButton = window.Telegram.WebApp.MainButton;
			const amountNum = Number(amount);
			
			if (!amount || !amountNum || amountNum <= 0) {
				mainButton.disable();
			} else {
				mainButton.enable();
			}
		}
	}, [amount, isOpen, isTelegram]);

	useEffect(() => {
		if (isOpen && category) {
			// Инициализируем состояния из категории
			setIsSaving(!!category.isSaving);
			setRolloverEnabled(!!category.rolloverEnabled);
			setRolloverTargetId(category.rolloverTargetId || "");
		}
		
		// Сброс валюты при открытии
		if (isOpen) {
			setSelectedCurrency("RSD");
		}
	}, [isOpen, category]);

	// Отдельный useEffect для MainButton, чтобы не пересоздавать при каждом изменении amount (только в Telegram)
	useEffect(() => {
		if (!isOpen || !isTelegram) {
			// Если не Telegram, только управляем скроллом
			if (isOpen) {
				const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
				document.body.style.overflow = "hidden";
				if (scrollbarWidth > 0) {
					document.body.style.paddingRight = `${scrollbarWidth}px`;
				}
				
				return () => {
					document.body.style.overflow = "";
					document.body.style.paddingRight = "";
				};
			}
			return;
		}

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

				// Конвертируем сумму в базовую валюту (EUR)
				let convertedAmount = amountNum;
				const currentCurrency = selectedCurrencyRef.current;
				const currentRates = exchangeRatesRef.current;
				
				if (currentCurrency !== "EUR" && currentRates && currentRates[currentCurrency]) {
					convertedAmount = amountNum / currentRates[currentCurrency];
				}

				const amountCents = Math.round(convertedAmount * 100);
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
	}, [isOpen, year, month, categoryId, ownerId, setSnapshot, onClose, isTelegram, selectedCurrency, exchangeRates]);

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
			if (selectedCurrency !== "EUR" && exchangeRates && exchangeRates[selectedCurrency]) {
				convertedAmount = amountNum / exchangeRates[selectedCurrency];
			}

			const amountCents = Math.round(convertedAmount * 100);
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
					<div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
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
							style={{ flex: 1 }}
						/>
						<select
							value={selectedCurrency}
							onChange={(e) => setSelectedCurrency(e.target.value)}
							className={kit.input}
							disabled={isSubmitting || loadingRates}
							style={{ width: "100px" }}
						>
							<option value="RSD">RSD</option>
							<option value="EUR">EUR</option>
							<option value="USD">USD</option>
							<option value="RUB">RUB</option>
						</select>
					</div>
					
					{selectedCurrency !== "EUR" && exchangeRates && (
						<div style={{ 
							fontSize: 12, 
							color: "var(--text-secondary)", 
							marginTop: "var(--spacing-xs)" 
						}}>
							1 {selectedCurrency} = {(1 / (exchangeRates[selectedCurrency] || 1)).toFixed(4)} EUR
							{amount && Number(amount) > 0 && (
								<> • {amount} {selectedCurrency} ≈ {(Number(amount) / (exchangeRates[selectedCurrency] || 1)).toFixed(2)} EUR</>
							)}
						</div>
					)}

					{error && <div className={styles.error}>{error}</div>}
					
					{!isTelegram && (
						<button
							type="button"
							onClick={handleAddExpense}
							disabled={isSubmitting || !amount || Number(amount) <= 0}
							className={kit.button}
							style={{ width: "100%", marginTop: "var(--spacing-md)" }}
						>
							{isSubmitting ? "Добавление..." : "Добавить расход"}
						</button>
					)}
				</form>
			</div>
		</div>
	);
}
