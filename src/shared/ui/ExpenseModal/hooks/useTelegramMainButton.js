import { useEffect, useRef } from "react";

export function useTelegramMainButton({
	isOpen,
	isTelegram,
	amountRef,
	selectedCurrencyRef,
	exchangeRatesRef,
	onSubmit,
	onError,
}) {
	useEffect(() => {
		if (!isOpen || !isTelegram) {
			// Управляем скроллом для не-Telegram
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
					onError("Неверная сумма");
					// Haptic feedback для ошибки
					if (window.Telegram?.WebApp?.HapticFeedback) {
						window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
					}
					return;
				}

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

				onSubmit(amountCents)
					.then(() => {
						// Haptic feedback для успеха
						if (window.Telegram?.WebApp?.HapticFeedback) {
							window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
						}
						mainButton.hideProgress();
						mainButton.enable();
					})
					.catch(() => {
						onError("Неверные параметры");
						// Haptic feedback для ошибки
						if (window.Telegram?.WebApp?.HapticFeedback) {
							window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
						}
						mainButton.hideProgress();
						mainButton.enable();
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
	}, [isOpen, isTelegram, amountRef, selectedCurrencyRef, exchangeRatesRef, onSubmit, onError]);
}

export function useTelegramMainButtonState(isOpen, isTelegram, amount) {
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
}
