import { useEffect, useCallback } from "react";

export function useTelegramMainButton({
	isOpen,
	isTelegram,
	amountRef,
	selectedCurrencyRef,
	exchangeRatesRef,
	operationTypeRef,
	onSubmit,
	onError,
}) {
	// Стабилизируем функции через useCallback
	const handleError = useCallback(
		(message) => {
			onError(message);
			if (window.Telegram?.WebApp?.HapticFeedback) {
				window.Telegram.WebApp.HapticFeedback.notificationOccurred(
					"error"
				);
			}
		},
		[onError]
	);

	const handleSuccess = useCallback(() => {
		if (window.Telegram?.WebApp?.HapticFeedback) {
			window.Telegram.WebApp.HapticFeedback.notificationOccurred(
				"success"
			);
		}
	}, []);

	useEffect(() => {
		if (!isOpen || !isTelegram) {
			// Управляем скроллом для не-Telegram
			if (isOpen) {
				const scrollbarWidth =
					window.innerWidth - document.documentElement.clientWidth;
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
		const scrollbarWidth =
			window.innerWidth - document.documentElement.clientWidth;

		// Блокируем скролл при открытии модалки
		document.body.style.overflow = "hidden";

		// Компенсируем ширину scrollbar, чтобы избежать скачков
		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		}

		// Настраиваем Telegram MainButton
		if (window.Telegram?.WebApp?.MainButton) {
			const mainButton = window.Telegram.WebApp.MainButton;
			const buttonText =
				operationTypeRef?.current === "subtract"
					? "Вычесть сумму"
					: "Добавить расход";
			mainButton.setText(buttonText);
			mainButton.show();

			// Проверяем начальное состояние amount
			const initialAmount = Number(amountRef.current);
			if (!amountRef.current || !initialAmount || initialAmount <= 0) {
				mainButton.disable();
			} else {
				mainButton.enable();
			}

			// Обработчик клика
			const handleMainButtonClick = () => {
				const amountNum = Number(amountRef.current);
				if (!amountNum || amountNum <= 0) {
					handleError("Неверная сумма");
					return;
				}

				mainButton.showProgress();
				mainButton.disable();

				// Конвертируем сумму в базовую валюту (EUR)
				let convertedAmount = amountNum;
				const currentCurrency = selectedCurrencyRef.current;
				const currentRates = exchangeRatesRef.current;

				if (
					currentCurrency !== "EUR" &&
					currentRates &&
					currentRates[currentCurrency]
				) {
					convertedAmount = amountNum / currentRates[currentCurrency];
				}

				const amountCents = Math.round(convertedAmount * 100);
				const opType = operationTypeRef?.current || "add";

				onSubmit(amountCents, opType)
					.then(() => {
						handleSuccess();
						mainButton.hideProgress();
						mainButton.enable();
					})
					.catch(() => {
						handleError("Неверные параметры");
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
	}, [isOpen, isTelegram, onSubmit, handleError, handleSuccess]);
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
