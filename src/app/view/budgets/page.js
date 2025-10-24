"use client";
import { useEffect, useState } from "react";
import kit from "@/shared/ui/kit.module.css";
import { listAccessibleBudgets } from "@/shared/api/budget";

export default function BudgetsListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadBudgets();
    const h = () => loadBudgets();
    window.addEventListener("budget-share-updated", h);
    return () => window.removeEventListener("budget-share-updated", h);
  }, []);
  
  const loadBudgets = () => {
    setLoading(true);
    listAccessibleBudgets()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  return (
    <main style={{ padding: "var(--spacing-lg)" }}>
      <div className={kit.card} style={{ marginBottom: "var(--spacing-lg)" }}>
        <h2 className={kit.cardTitle}>Доступные бюджеты</h2>
      </div>
      
      {loading ? (
        <div className={kit.card} style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
          <span className={kit.muted}>Загрузка...</span>
        </div>
      ) : (
        <div className={kit.tableWrap}>
          <table className={kit.table}>
            <thead>
              <tr className={kit.tableHead}>
                <th className={kit.theadTh}>Владелец</th>
                <th className={kit.theadTh}>Роль</th>
                <th className={kit.theadTh}></th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((i) => (
                <tr key={i.ownerId} className={kit.tr}>
                  <td className={kit.td}>{i.email || i.ownerId}</td>
                  <td className={kit.td}>
                    <span style={{ 
                      padding: "4px 8px", 
                      background: "var(--accent-bg)",
                      color: "var(--accent-primary)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 12,
                      fontWeight: 500
                    }}>
                      {i.role}
                    </span>
                  </td>
                  <td className={kit.td}>
                    <a 
                      className={`${kit.button} ${kit.buttonPrimary}`} 
                      href={`/view?ownerId=${encodeURIComponent(i.ownerId)}`}
                      style={{ textDecoration: "none" }}
                    >
                      Открыть
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className={kit.empty} colSpan={3}>
                    Нет доступных бюджетов
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
