"use client";
export default function Error({ error }) {
	return (
		<div style={{ color: "#f78c6c" }}>
			Ошибка: {error?.message || "Неизвестная"}
		</div>
	);
}
