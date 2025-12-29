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
        if (date) {
          acc[date] = (acc[date] || 0) + (Number(item.totalPrice) || 0)
        }
        return acc
      }, {})
      return Object.entries(groups)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    }
  },

  actions: {
    async fetchData() {
      this.isLoading = true
      try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7YgN_O-M437C-p29NH-santas-projects-bf2b56a5/pub?output=csv'
        const response = await fetch(`${url}&t=${new Date().getTime()}`)
        const csvText = await response.text()
        
        const lines = csvText.split('\n').filter(line => line.trim() !== '')
        const rows = lines.map(line => line.split(','))
        const headers = rows[0].map(h => h.trim())
        
        const data = rows.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, i) => {
            let val = row[i]?.trim() || ''
            // Bersihkan format mata uang jika ada
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
        console.error('Gagal tarik data:', error)
      } finally {
        this.isLoading = false
      }
    },

    async refreshData() {
      await this.fetchData()
    },

    updateDateRange(from, to) {
      this.dateRange = { from, to }
      this.applyFilters()
    },

    updateCategory(category) {
      this.selectedCategory = category
      this.applyFilters()
    },

    applyFilters() {
      let filtered = [...this.allData]
      
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(item => item.Category === this.selectedCategory)
      }
      
      if (this.dateRange.from && this.dateRange.to) {
        const fromDate = new Date(this.dateRange.from)
        const toDate = new Date(this.dateRange.to)
        fromDate.setHours(0, 0, 0, 0)
        toDate.setHours(23, 59, 59, 999)
        
        filtered = filtered.filter(item => {
          const [d, m, y] = item.tanggal.split('/')
          const itemDate = new Date(`${y}-${m}-${d}`) // Format Indo DD/MM/YYYY ke Date
          return itemDate >= fromDate && itemDate <= toDate
        })
      }
      
      this.filteredData = filtered
    }
  }
})
