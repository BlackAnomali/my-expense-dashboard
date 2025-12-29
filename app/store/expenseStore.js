import { defineStore } from "pinia";
import { parse, isValid } from 'date-fns';

const parseRupiahValue = (value) => {
  if (!value) return 0;
  const str = value.toString();
  const cleanValue = str.replace(/Rp/gi, '').replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

const parseIndonesianDate = (dateStr) => {
  if (!dateStr) return null;
  const formats = ['dd/MM/yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd'];
  for (const fmt of formats) {
    try {
      const date = parse(dateStr.trim(), fmt, new Date());
      if (isValid(date)) return date;
    } catch (e) {}
  }
  return null;
}

export const useExpenseStore = defineStore("expense", {
  state: () => ({
    allData: [],
    filteredData: [],
    categories: [],
    isLoading: false,
    dateRange: { from: null, to: null },
    selectedCategory: "all"
  }),

  getters: {
    totalSpent: (state) => state.filteredData.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    dailySpending: (state) => {
      const daily = {};
      // PENGAMAN SSR: Jika data kosong, langsung balikkan array kosong
      if (!state.filteredData || state.filteredData.length === 0) return [];

      state.filteredData.forEach(item => {
        // Gunakan Optional Chaining (?.) agar tidak crash jika item/rawDate undefined
        const dateObj = item?.rawDate;
        if (dateObj instanceof Date && !isNaN(dateObj)) {
          const date = dateObj.toISOString().split('T')[0];
          daily[date] = (daily[date] || 0) + (item.totalPrice || 0);
        }
      });
      return Object.entries(daily)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  },

  actions: {
    async fetchData() {
      this.isLoading = true;
      try {
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1bcV0WpNrGn6YzAepGIIeIlhONT-XqX0itGfEchgRLNkL91g2gvJcu-JQFS4EtVkdQt0-6-l-aRrI/pub?gid=0&single=true&output=csv";
        
        const response = await fetch(url);
        const text = await response.text();
        
        if (!text || text.trim() === "" || text.includes('<!DOCTYPE html>')) {
          this.allData = [];
          return;
        }

        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));
        
        if (!rows || rows.length < 2 || !rows[0]) {
          this.allData = [];
          return;
        }

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const newData = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < headers.length) continue;

          const rowData = {};
          headers.forEach((header, index) => { rowData[header] = row[index]; });

          const dateStr = rowData['tanggal'];
          const parsedDate = parseIndonesianDate(dateStr);

          if (parsedDate) {
            newData.push({
              id: i,
              tanggal: dateStr,
              name: rowData['name'] || "Tanpa Nama",
              totalPrice: parseRupiahValue(rowData['total']),
              Category: rowData['jenis'] || "Lainnya",
              shop: rowData['shop'] || "-",
              rawDate: parsedDate
            });
          }
        }
        this.allData = newData;
        this.extractCategories();
        this.applyFilters();
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        this.isLoading = false;
      }
    },

    extractCategories() {
      if (!this.allData) return;
      this.categories = Array.from(new Set(this.allData.map(i => i.Category).filter(Boolean))).sort();
    },

    applyFilters() {
      let filtered = [...this.allData];
      if (this.dateRange.from && this.dateRange.to) {
        filtered = filtered.filter(i => i.rawDate >= this.dateRange.from && i.rawDate <= this.dateRange.to);
      }
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter(i => i.Category === this.selectedCategory);
      }
      this.filteredData = filtered;
    }
  }
});
