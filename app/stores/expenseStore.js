import { defineStore } from "pinia";
import { parse, isValid } from 'date-fns';

// Helper: Membersihkan format Rupiah (Rp 10.000 -> 10000)
const parseRupiahValue = (value) => {
  if (!value) return 0;
  const str = value.toString();
  const cleanValue = str.replace(/Rp/gi, '').replace(/\s+/g, '').replace(/\./g, '').replace(/,/g, '.').trim();
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper: Memastikan tanggal terbaca dengan benar
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
      state.filteredData.forEach(item => {
        const date = item.rawDate.toISOString().split('T')[0];
        daily[date] = (daily[date] || 0) + item.totalPrice;
      });
      return Object.entries(daily).map(([date, total]) => ({ date, total })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  },

  actions: {
async fetchData() {
      this.isLoading = true;
      try {
        // Link yang sudah terbukti bisa dibuka
        const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ1bcV0WpNrGn6YzAepGIIeIlhONT-XqX0itGfEchgRLNkL91g2gvJcu-JQFS4EtVkdQt0-6-l-aRrI/pub?gid=0&single=true&output=csv";
        
        const response = await fetch(url);
        const text = await response.text();
        
        if (!text || text.trim() === "") {
          this.allData = [];
          return;
        }

        const rows = text.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '')));
        
        if (!rows || rows.length === 0 || !rows[0]) {
          this.allData = [];
          return;
        }

        const headers = rows[0];
        const newData = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < headers.length) continue;

          const rowData = {};
          headers.forEach((header, index) => { 
            rowData[header.trim()] = row[index]; 
          });

          const dateStr = rowData['Tanggal'];
          const parsedDate = parseIndonesianDate(dateStr);

          if (parsedDate) {
            newData.push({
              id: i,
              tanggal: dateStr,
              name: rowData['Name'] || "Tanpa Nama",
              totalPrice: parseRupiahValue(rowData['Total']),
              Category: rowData['Jenis'] || "Lainnya",
              shop: rowData['Shop'] || "-",
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
    }, // <--- Cek apakah tanda kurung dan koma ini sudah benar

    extractCategories() {
      this.categories = Array.from(new Set(this.allData.map(i => i.Category).filter(Boolean))).sort();
    },

    applyFilters() {
      let filtered = this.allData;
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