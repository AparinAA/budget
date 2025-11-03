import kit from "@/shared/ui/kit.module.css";
import styles from "./styles.module.css";

export function ModalHeader({
	title,
	onClose,
	disabled = false,
	rightButton = null,
}) {
	return (
		<div className={styles.header}>
			<button
				type="button"
				onClick={onClose}
				className={kit.button}
				disabled={disabled}
			>
				← Назад
			</button>
			<h3 className={styles.title}>{title}</h3>
			{rightButton && (
				<div className={styles.rightButton}>{rightButton}</div>
			)}
		</div>
	);
}
