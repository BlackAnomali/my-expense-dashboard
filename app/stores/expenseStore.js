import { defineStore } from "pinia";
import { parse, isValid } from 'date-fns';

// Helper function to parse Indonesian Rupiah format
const parseRupiahValue = (value) => {
  if (!value) return 0;
  
  // Convert to string if it's not already
  const str = value.toString();
  
  // Remove "Rp", spaces, and dots (thousand separators)
  // Keep commas as decimal separators if any
  const cleanValue = str
    .replace(/Rp/gi, '')           // Remove "Rp" (case insensitive)
    .replace(/\s+/g, '')           // Remove all spaces
    .replace(/\./g, '')            // Remove dots (thousand separators)
    .replace(/,/g, '.')            // Replace comma with dot for decimal
    .trim();
  
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Replace the parseIndonesianDate function with:
const parseIndonesianDate = (dateStr) => {
  if (!dateStr) return null;
  
  const cleanDateStr = dateStr.trim();
  
  // Try parsing dd/mm/yyyy format
  try {
    const date = parse(cleanDateStr, 'dd/MM/yyyy', new Date());
    if (isValid(date)) {
      return date;
    }
  } catch (error) {
    // Continue to try other formats
  }
  
  // Try parsing dd-mm-yyyy format
  try {
    const date = parse(cleanDateStr, 'dd-MM-yyyy', new Date());
    if (isValid(date)) {
      return date;
    }
  } catch (error) {
    // Continue to try other formats
  }
  
  // Try parsing yyyy-mm-dd format
  try {
    const date = parse(cleanDateStr, 'yyyy-MM-dd', new Date());
    if (isValid(date)) {
      return date;
    }
  } catch (error) {
    // Log error
  }
  
  console.warn(`Could not parse date: ${dateStr}`);
  return null;
}

export const useExpenseStore = defineStore("expense", {
  state: () => ({
    allData: [],
    filteredData: [],
    categories: [],
    isLoading: false,
    dateRange: {
      from: null,
      to: null,
    },
    selectedCategory: "all",
    loadedQuarters: new Set(),
    availableSheets: [],
    sheetsAPI: null,
  }),

  getters: {
    availableQuarters: (state) => {
      const quarters = new Set();
      state.allData.forEach((item) => {
        if (item.quarter) quarters.add(item.quarter);
      });
      return Array.from(quarters).sort();
    },
    
    // Dashboard specific getters
    totalSpent: (state) => {
      return state.filteredData.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    },

    categoryBreakdown: (state) => {
      const breakdown = {};
      state.filteredData.forEach((item) => {
        const category = item.Category || 'Uncategorized';
        if (!breakdown[category]) {
          breakdown[category] = { total: 0, count: 0, items: [] };
        }
        breakdown[category].total += item.totalPrice || 0;
        breakdown[category].count += 1;
        breakdown[category].items.push(item);
      });
      return Object.entries(breakdown)
        .map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
          percentage: state.filteredData.length > 0 ? (data.total / state.totalSpent) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);
    },

    dailySpending: (state) => {
      const daily = {};
      state.filteredData.forEach((item) => {
        const date = item.rawDate.toISOString().split('T')[0];
        if (!daily[date]) {
          daily[date] = 0;
        }
        daily[date] += item.totalPrice || 0;
      });
      return Object.entries(daily)
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    topShops: (state) => {
      const shops = {};
      state.filteredData.forEach((item) => {
        const shop = item.shop || 'Unknown Shop';
        if (!shops[shop]) {
          shops[shop] = { total: 0, count: 0 };
        }
        shops[shop].total += item.totalPrice || 0;
        shops[shop].count += 1;
      });
      return Object.entries(shops)
        .map(([shop, data]) => ({ shop, ...data }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },

    averageDailySpending: (state) => {
      const daily = state.dailySpending;
      if (daily.length === 0) return 0;
      const totalSpent = daily.reduce((sum, day) => sum + day.total, 0);
      return totalSpent / daily.length;
    },

    spendingTrend: (state) => {
      const daily = state.dailySpending;
      if (daily.length < 7) return 'insufficient_data';
      
      const recent = daily.slice(-7).reduce((sum, day) => sum + day.total, 0) / 7;
      const previous = daily.slice(-14, -7).reduce((sum, day) => sum + day.total, 0) / 7;
      
      if (recent > previous * 1.1) return 'increasing';
      if (recent < previous * 0.9) return 'decreasing';
      return 'stable';
    }
  },

  actions: {
    async initializeGoogleAPI() {
      if (process.client && !this.sheetsAPI) {
        const config = useRuntimeConfig();
        
        // Load Google API library
        await new Promise((resolve) => {
          if (window.gapi) {
            resolve();
            return;
          }
          
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });

        // Initialize Google API
        await new Promise((resolve) => {
          window.gapi.load('client', resolve);
        });

        await window.gapi.client.init({
          apiKey: config.public.googleApiKey,
          discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        });

        this.sheetsAPI = window.gapi.client.sheets;
      }
    },

    async initializeSheets() {
      try {
        await this.initializeGoogleAPI();
        
        const config = useRuntimeConfig();
        
        // Get spreadsheet metadata
        const response = await this.sheetsAPI.spreadsheets.get({
          spreadsheetId: config.public.googleSheetId,
        });

        const quarterRegex = /Pengeluaran Q(\d)\/(\d{4})/;
        this.availableSheets = [];

        response.result.sheets.forEach((sheet) => {
          const match = sheet.properties.title.match(quarterRegex);
          if (match) {
            const quarter = parseInt(match[1]);
            const year = parseInt(match[2]);
            this.availableSheets.push({
              title: sheet.properties.title,
              quarter: `Q${quarter}/${year}`,
              quarterNum: quarter,
              year: year,
            });
          }
        });

        // Sort sheets by year and quarter
        this.availableSheets.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.quarterNum - b.quarterNum;
        });

      } catch (error) {
        console.error("Error initializing sheets:", error);
        throw error;
      }
    },

    getRequiredQuarters(fromDate, toDate) {
      if (!fromDate || !toDate) return [];

      const requiredQuarters = [];
      const startYear = fromDate.getFullYear();
      const endYear = toDate.getFullYear();
      const startQuarter = Math.ceil((fromDate.getMonth() + 1) / 3);
      const endQuarter = Math.ceil((toDate.getMonth() + 1) / 3);

      for (let year = startYear; year <= endYear; year++) {
        const firstQ = year === startYear ? startQuarter : 1;
        const lastQ = year === endYear ? endQuarter : 4;

        for (let quarter = firstQ; quarter <= lastQ; quarter++) {
          requiredQuarters.push(`Q${quarter}/${year}`);
        }
      }

      return requiredQuarters;
    },

    async loadQuarters(quarters) {
      if (!quarters.length) return;

      this.isLoading = true;

      try {
        const quartersToLoad = quarters.filter(
          (q) => !this.loadedQuarters.has(q)
        );

        if (quartersToLoad.length === 0) {
          this.isLoading = false;
          return;
        }

        if (!this.sheetsAPI) {
          await this.initializeSheets();
        }

        const config = useRuntimeConfig();
        const newData = [];

        for (const quarterStr of quartersToLoad) {
          const sheetInfo = this.availableSheets.find(
            (s) => s.quarter === quarterStr
          );

          if (sheetInfo) {
            try {
              // Get sheet data using Google Sheets API
              const response = await this.sheetsAPI.spreadsheets.values.get({
                spreadsheetId: config.public.googleSheetId,
                range: `${sheetInfo.title}!A:Z`,
              });

              const rows = response.result.values;
              if (rows && rows.length > 1) {
                const headers = rows[0]; // First row contains headers
                
                for (let i = 1; i < rows.length; i++) {
                  const row = rows[i];
                  const rowData = {};
                  
                  // Map row data to headers
                  headers.forEach((header, index) => {
                    rowData[header] = row[index] || '';
                  });

                  console.log("Row Data:", rowData);

                  const dateStr = rowData['Tanggal'] || rowData['tanggal'];
                  if (dateStr) {
                    const parsedDate = parseIndonesianDate(dateStr);
                    
                    if (parsedDate) {
                      newData.push({
                        id: `${sheetInfo.title}_${i}`,
                        tanggal: dateStr,
                        name: rowData['Name'] || rowData['Product'],
                        unit: rowData['Unit'],
                        pricePerUnit: parseRupiahValue(rowData['Price Per Unit'] || rowData['Price']),
                        qty: parseInt(rowData['Qty'] || 0),
                        totalPrice: parseRupiahValue(rowData['Total'] || rowData['TotalPrice']),
                        Category: rowData['Jenis'] || rowData['Category'],
                        shop: rowData['Shop'],
                        quarter: quarterStr,
                        rawDate: parsedDate,
                      });
                    } else {
                      console.warn(`Skipping row ${i} due to invalid date: ${dateStr}`);
                    }
                  }
                }
              }
              this.loadedQuarters.add(quarterStr);
            } catch (error) {
              console.error(`Error loading quarter ${quarterStr}:`, error);
            }
          }
        }

        console.log("New Data Loaded:", newData);

        this.allData = [...this.allData, ...newData];
        this.extractCategories();
        this.applyFilters();

      } catch (error) {
        console.error("Error loading quarters:", error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDataForDateRange(fromDate, toDate) {
      const requiredQuarters = this.getRequiredQuarters(fromDate, toDate);
      await this.loadQuarters(requiredQuarters);
    },

    extractCategories() {
      const categorySet = new Set();
      this.allData.forEach((item) => {
        if (item.Category) categorySet.add(item.Category);
      });
      this.categories = Array.from(categorySet).sort();
    },

    setDefaultFilters() {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      this.dateRange = {
        from: startOfMonth,
        to: endOfMonth,
      };
      this.selectedCategory = "all";
    },

    applyFilters() {
      let filtered = this.allData;

      // Filter by date range (exact date filtering)
      if (this.dateRange.from && this.dateRange.to) {
        filtered = filtered.filter((item) => {
          const itemDate = item.rawDate;
          return (
            itemDate >= this.dateRange.from && itemDate <= this.dateRange.to
          );
        });
      }

      // Filter by category
      if (this.selectedCategory !== "all") {
        filtered = filtered.filter(
          (item) => item.Category === this.selectedCategory
        );
      }

      this.filteredData = filtered;
    },

    async updateDateRange(from, to) {
      this.dateRange = { from, to };
      await this.fetchDataForDateRange(from, to);
      this.applyFilters();
    },

    updateCategory(category) {
      this.selectedCategory = category;
      this.applyFilters();
    },

    async initialize() {
      if (process.client) {
        this.setDefaultFilters();
        await this.fetchDataForDateRange(this.dateRange.from, this.dateRange.to);
      }
    },

    async refreshData() {
      this.allData = [];
      this.loadedQuarters.clear();
      this.availableSheets = [];
      this.sheetsAPI = null;
      await this.initialize();
    },
  },
});
