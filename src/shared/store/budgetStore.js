"use client";
import create from "zustand";

export const useBudgetStore = create((set) => ({
	year: new Date().getFullYear(),
	month: new Date().getMonth() + 1,
	income: 0,
	currency: "EUR",
	categories: [],
	loading: false,
	setPeriod: (year, month) => set({ year, month }),
	setSnapshot: (snap) =>
		set({
			income: snap.income,
			categories: snap.categories,
			currency: snap.currencyCode || "EUR",
		}),
}));
