import { defineStore } from 'pinia'

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    allData: [],
    filteredData: [],
    isLoading: false,
    selectedCategory: 'all',
    dateRange: { from: null, to: null }
  }),

  getters: {
    categories: (state) => {
      const cats = state.allData.map(item => item.Category).filter(Boolean)
      return [...new Set(cats)]
    },
    totalSpent: (state) => {
      return state.filteredData.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0)
    },
    dailySpending: (state) => {
      const groups = state.filteredData.reduce((acc, item) => {
        const date = item.tanggal
        acc[date] = (acc[date] || 0) + (Number(item.totalPrice) || 0)
        return acc
      }, {})
      return Object.entries(groups).map(([date, total]) => ({ date, total }))
    }
  },

  actions: {
    async fetchData() {
      this.isLoading = true
      try {
        // GANTI URL INI dengan link CSV Google Sheets kamu yang baru jika perlu
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7YgN_O-M437C-p29NH-santas-projects-bf2b56a5/pub?output=csv'
        const response = await fetch(url)
        const csvText = await response.text()
        
        const lines = csvText.split('\n').map(line => line.split(','))
        const headers = lines[0].map(h => h.trim())
        
        const data = lines.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, i) => {
            let val = row[i]?.trim() || ''
            // Pembersih Angka: Hapus Rp, titik ribuan, dan spasi
            if (header === 'totalPrice' || header === 'pricePerUnit') {
              val = val.replace(/Rp/g, '').replace(/\./g, '').replace(/\s/g, '').replace(/,/g, '.')
            }
            obj[header] = val
          })
          return obj
        })

        this.allData = data
        this.applyFilters()
      } catch (error) {
        console.error('Gagal tarik data Sheets:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Fungsi yang tadi error karena tidak ada:
    updateDateRange(from, to) {
      this.dateRange = { from, to }
      this.applyFilters()
    },

    updateCategory(category) {
      this.selectedCategory = category
      this.applyFilters()
    },

    async refreshData() {
      await this.fetchData()
    },

    applyFilters() {
      let filtered = [...this.allData]

      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.Category === this.selectedCategory)
      }

      if (this.dateRange.from && this.dateRange.to) {
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.tanggal)
          return itemDate >= this.dateRange.from && itemDate <= this.dateRange.to
        })
      }

      this.filteredData = filtered
    }
  }
})
