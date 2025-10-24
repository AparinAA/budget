"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchBudgetList, shareBudget } from "@/shared/api/budget";
import { getMe } from "@/shared/api/auth";
import styles from "./budgets.module.css";
import kitStyles from "@/shared/ui/kit.module.css";

export default function BudgetsPage() {
	const router = useRouter();
	const [budgets, setBudgets] = useState([]);
	const [shareEmail, setShareEmail] = useState("");
	const [selectedBudgetId, setSelectedBudgetId] = useState(null);

	useEffect(() => {
		getMe()
			.then((user) => {
				if (!user?.userId) {
					window.location.href = "/auth";
				} else {
					fetchBudgetList().then(setBudgets).catch(console.error);
				}
			})
			.catch(() => {
				window.location.href = "/auth";
			});
	}, []);

	const handleShare = async (budgetId) => {
		if (!shareEmail.trim()) {
			alert("Введите email");
			return;
		}
		try {
			await shareBudget(budgetId, shareEmail);
			alert("Бюджет успешно расшарен");
			setShareEmail("");
			setSelectedBudgetId(null);
		} catch (err) {
			alert(err.message || "Ошибка при расшаривании");
		}
	};

	return (
		<main className={styles.budgetsPage}>
			<h1 className={styles.title}>Мои бюджеты</h1>
			<div className={styles.budgetsList}>
				{budgets.map((b) => (
					<div key={b.id} className={styles.budgetCard}>
						<div className={styles.budgetInfo}>
							<h3>
								{b.year}/{b.month}
							</h3>
							<p>Доход: {b.income / 100}</p>
							<p>Валюта: {b.currency}</p>
						</div>
						<div className={styles.budgetActions}>
							<button
								className={kitStyles.button}
								onClick={() => router.push(`/?ownerId=${b.ownerId}`)}
							>
								Открыть
							</button>
							<button
								className={kitStyles.buttonSecondary}
								onClick={() =>
									setSelectedBudgetId(
										selectedBudgetId === b.id ? null : b.id
									)
								}
							>
								{selectedBudgetId === b.id ? "Отмена" : "Поделиться"}
							</button>
						</div>
						{selectedBudgetId === b.id && (
							<div className={styles.shareForm}>
								<input
									className={kitStyles.input}
									type="email"
									placeholder="Email получателя"
									value={shareEmail}
									onChange={(e) => setShareEmail(e.target.value)}
								/>
								<button
									className={kitStyles.button}
									onClick={() => handleShare(b.id)}
								>
									Отправить
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</main>
	);
}