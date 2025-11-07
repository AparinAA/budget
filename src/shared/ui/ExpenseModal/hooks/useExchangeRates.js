import { useState, useEffect } from "react";

const CACHE_KEY = "exchange_rates_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Дефолтные курсы валют к EUR (для предотвращения скачков UI)
const DEFAULT_RATES = {
	EUR: 1,
	RSD: 0.00853, // 1 RSD ≈ 0.00853 EUR
	USD: 0.92, // 1 USD ≈ 0.92 EUR
	RUB: 0.0095, // 1 RUB ≈ 0.0095 EUR
};

// Функция для получения курса валюты в EUR через наш API
async function fetchRate(from) {
	// Если валюта EUR, курс всегда 1
	if (from === "EUR") {
		return 1;
	}

	const response = await fetch(`/api/exchange-rate?from=${from}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch rate ${from} -> EUR`);
	}

	const result = await response.json();
	return result.rate;
}

export function useExchangeRates(
	isOpen,
	baseCurrency = "EUR",
	targetCurrency = "EUR"
) {
	const [exchangeRate, setExchangeRate] = useState(
		DEFAULT_RATES[targetCurrency] || 1
	);
	const [loadingRate, setLoadingRate] = useState(false);

	useEffect(() => {
		if (!isOpen) return;

		const fetchExchangeRate = async () => {
			try {
				// Создаем ключ кеша для валюты
				const cacheKey = `${CACHE_KEY}_${targetCurrency}`;

				// Проверяем кэш
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					const { data, timestamp } = JSON.parse(cached);
					const now = Date.now();

					// Если кэш не протух, используем его
					if (now - timestamp < CACHE_TTL) {
						setExchangeRate(data);
						return;
					}
				}

				// Делаем запрос к API (всегда конвертируем targetCurrency -> EUR)
				setLoadingRate(true);
				const rate = await fetchRate(targetCurrency);

				// Сохраняем в кэш
				localStorage.setItem(
					cacheKey,
					JSON.stringify({
						data: rate,
						timestamp: Date.now(),
					})
				);

				setExchangeRate(rate);
			} catch (err) {
				console.error("Error fetching exchange rate:", err);
				// Используем дефолтный курс при ошибке
				setExchangeRate(DEFAULT_RATES[targetCurrency] || 1);
			} finally {
				setLoadingRate(false);
			}
		};

		fetchExchangeRate();
	}, [isOpen, targetCurrency]);

	return { exchangeRate, loadingRate };
}
