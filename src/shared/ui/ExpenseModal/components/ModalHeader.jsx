import kit from "@/shared/ui/kit.module.css";

export function ModalHeader({ categoryName, isSubmitting, onClose }) {
	return (
		<div style={{ 
			display: "flex", 
			alignItems: "center", 
			justifyContent: "space-between", 
			marginBottom: "var(--spacing-md)" 
		}}>
			<button
				type="button"
				onClick={onClose}
				className={kit.button}
				disabled={isSubmitting}
			>
				← Назад
			</button>
			<h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{categoryName}</h3>
		</div>
	);
}
