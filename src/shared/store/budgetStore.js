"use client";
import create from "zustand";

export const useBudgetStore = create((set) => ({
	year: new Date().getFullYear(),
	month: new Date().getMonth() + 1,
	income: 0,
	currency: "EUR",
	categories: [],
	loading: false,
	ownerId: null,
	owners: [], // [{ ownerId, email, role, type }]
	setPeriod: (year, month) => set({ year, month }),
	setOwnerId: (ownerId) => set({ ownerId }),
	setOwners: (owners) => set({ owners }),
	setSnapshot: (snap) =>
		set({
			income: snap.income,
			categories: snap.categories,
			currency: snap.currencyCode || "EUR",
		}),
}));
