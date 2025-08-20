"use client";
import { useEffect, useState } from "react";
import kit from "@/shared/ui/kit.module.css";
import { listAccessibleBudgets } from "@/shared/api/budget";

export default function BudgetsListPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    listAccessibleBudgets().then(setItems).catch(() => setItems([]));
    const h = () => listAccessibleBudgets().then(setItems).catch(() => setItems([]));
    window.addEventListener("budget-share-updated", h);
    return () => window.removeEventListener("budget-share-updated", h);
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Доступные бюджеты</h2>
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
                <td className={kit.td}>{i.role}</td>
                <td className={kit.td}>
                  <a className={kit.button} href={`/view?ownerId=${encodeURIComponent(i.ownerId)}`}>
                    Открыть
                  </a>
                </td>
              </tr>
            )) : (
              <tr>
                <td className={kit.empty} colSpan={3}>Нет доступных бюджетов</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
