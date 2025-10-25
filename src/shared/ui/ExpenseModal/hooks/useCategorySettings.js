import { useState, useEffect } from "react";
import { postAction } from "@/shared/api/budget";
import { useBudgetStore } from "@/shared/store/budgetStore";

export function useCategorySettings(isOpen, category, categoryId) {
	const { year, month, setSnapshot, ownerId } = useBudgetStore();
	const [isSaving, setIsSaving] = useState(false);
	const [rolloverEnabled, setRolloverEnabled] = useState(false);
	const [rolloverTargetId, setRolloverTargetId] = useState("");

	useEffect(() => {
		if (isOpen && category) {
			setIsSaving(!!category.isSaving);
			setRolloverEnabled(!!category.rolloverEnabled);
			setRolloverTargetId(category.rolloverTargetId || "");
		}
	}, [isOpen, category]);

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
			setIsSaving(!newValue);
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
			setRolloverEnabled(!newValue);
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

	return {
		isSaving,
		rolloverEnabled,
		rolloverTargetId,
		handleToggleSaving,
		handleToggleRollover,
		handleChangeRolloverTarget,
	};
}
