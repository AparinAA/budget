"use client";
import { useEffect } from "react";
import styles from "./styles.module.css";
import kit from "../kit.module.css";
import { ModalHeader } from "../ModalHeader";

export default function ConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	title = "Подтверждение",
	message,
	confirmText = "Удалить",
	cancelText = "Отменить",
}) {
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className={styles.backdrop} onClick={onClose}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<ModalHeader title={title} onClose={onClose} />

				<div className={styles.content}>
					<p className={styles.message}>{message}</p>

					<div className={styles.buttons}>
						<button
							onClick={onConfirm}
							className={`${kit.button} ${styles.confirmButton}`}
						>
							{confirmText}
						</button>
						<button onClick={onClose} className={kit.button}>
							{cancelText}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
