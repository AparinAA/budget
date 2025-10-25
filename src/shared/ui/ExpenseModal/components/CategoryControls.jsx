import kit from "@/shared/ui/kit.module.css";

export function CategoryControls({
	isSaving,
	rolloverEnabled,
	rolloverTargetId,
	isSubmitting,
	categories,
	categoryId,
	onToggleSaving,
	onToggleRollover,
	onChangeRolloverTarget,
}) {
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-md)" }}>
			<button
				type="button"
				aria-pressed={isSaving}
				className={kit.button}
				style={{
					background: isSaving ? "#256c43" : undefined,
					borderColor: isSaving ? "#2b8857" : undefined,
				}}
				onClick={onToggleSaving}
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
				onClick={onToggleRollover}
				disabled={isSubmitting || isSaving}
			>
				Переносить остаток →
			</button>

			{rolloverEnabled && (
				<select
					value={rolloverTargetId}
					onChange={onChangeRolloverTarget}
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
	);
}
