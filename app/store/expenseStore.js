// ... (bagian atas tetap sama)

  actions: {
    async fetchData() {
      this.isLoading = true
      try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7YgN_O-M437C-p29NH-santas-projects-bf2b56a5/pub?output=csv'
        const response = await fetch(`${url}&t=${new Date().getTime()}`)
        const csvText = await response.text()
        
        const rows = csvText.split('\n').filter(line => line.trim() !== '').map(line => line.split(','))
        
        // PEMBERSIH HEADER OTOMATIS: Menghapus tanda '#' dan spasi
        const headers = rows[0].map(h => h.replace('#', '').trim())
        
        const data = rows.slice(1).map(row => {
          const obj = {}
          headers.forEach((header, i) => {
            let val = row[i]?.trim() || ''
            // Gunakan nama kolom bersih (tanpa #) untuk pengecekan
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
    
    // Pastikan fungsi ini tetap ada di bagian actions:
    async refreshData() {
      await this.fetchData()
    },

    updateDateRange(from, to) {
      this.dateRange = { from, to }
      this.applyFilters()
    },

    // ... (sisanya tetap sama)
