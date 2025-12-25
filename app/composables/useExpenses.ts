export function useExpenses(dateRange: { start: string; end: string }) {
  return [
    { id: 1, date: "2025-11-01", amount: 100, category: "Food" },
    { id: 2, date: "2025-11-15", amount: 50, category: "Transport" },
  ];
}
