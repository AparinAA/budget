"use client";

import { MobileNavigation } from "@/shared/ui/MobileNavigation";
import styles from "./layout.module.css";

export default function ViewLayout({ children }) {
	return (
		<>
			<section className={styles.content}>{children}</section>
			<MobileNavigation />
		</>
	);
}
