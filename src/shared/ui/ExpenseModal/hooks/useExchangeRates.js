import { useState, useEffect } from "react";

const CACHE_KEY = "exchange_rates_cache";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function useExchangeRates(isOpen) {
	const [exchangeRates, setExchangeRates] = useState(null);
	const [loadingRates, setLoadingRates] = useState(false);

	useEffect(() => {
		if (!isOpen) return;

		const fetchExchangeRates = async () => {
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

	return { exchangeRates, loadingRates };
}
