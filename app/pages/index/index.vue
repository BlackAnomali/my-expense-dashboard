<template>
  <div class="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
    <header class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Dashboard Pengeluaran</h1>
      <ExpenseFilters />
    </header>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card class="p-4 bg-white shadow-sm border-none">
        <p class="text-sm text-gray-500">Total Pengeluaran</p>
        <p class="text-xl font-bold text-blue-600">{{ formatCurrency(totalSpent) }}</p>
      </Card>
      
      <Card class="p-4 bg-white shadow-sm border-none">
        <p class="text-sm text-gray-500">Rata-rata Harian</p>
        <p class="text-xl font-bold text-green-600">{{ formatCurrency(averageDaily) }}</p>
      </Card>

      <Card class="p-4 bg-white shadow-sm border-none">
        <p class="text-sm text-gray-500">Total Transaksi</p>
        <p class="text-xl font-bold">{{ expenseStore.filteredData.length }}</p>
      </Card>

      <Card class="p-4 bg-white shadow-sm border-none">
        <p class="text-sm text-gray-500">Kategori Teratas</p>
        <p class="text-xl font-bold text-purple-600 truncate">{{ topCategory }}</p>
      </Card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card class="p-6 bg-white shadow-sm">
        <h3 class="font-semibold mb-4">Tren Pengeluaran Harian</h3>
        <div class="h-64"><canvas ref="dailyChart"></canvas></div>
      </Card>

      <Card class="p-6 bg-white shadow-sm">
        <h3 class="font-semibold mb-4">Distribusi Kategori</h3>
        <div class="h-64"><canvas ref="categoryChart"></canvas></div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useExpenseStore } from '~/store/expenseStore'
import Chart from 'chart.js/auto'

const expenseStore = useExpenseStore()
const dailyChart = ref(null)
const categoryChart = ref(null)
let charts = { daily: null, category: null }

// Computed Data
const totalSpent = computed(() => expenseStore.totalSpent)
const averageDaily = computed(() => {
  const data = expenseStore.dailySpending
  return data.length ? totalSpent.value / data.length : 0
})
const topCategory = computed(() => {
  // Logika sederhana mencari kategori paling boros
  return expenseStore.allData[0]?.Category || "-"
})

// Fungsi Render Grafik
const renderCharts = () => {
  if (charts.daily) charts.daily.destroy()
  if (charts.category) charts.category.destroy()

  const dailyData = expenseStore.dailySpending
  charts.daily = new Chart(dailyChart.value, {
    type: 'line',
    data: {
      labels: dailyData.map(d => d.date),
      datasets: [{ label: 'Pengeluaran', data: dailyData.map(d => d.total), borderColor: '#3b82f6', fill: true }]
    },
    options: { maintainAspectRatio: false }
  })

  // Grafik Kategori (Doughnut)
  const catData = {}
  expenseStore.filteredData.forEach(i => {
    catData[i.Category] = (catData[i.Category] || 0) + i.totalPrice
  })
  
  charts.category = new Chart(categoryChart.value, {
    type: 'doughnut',
    data: {
      labels: Object.keys(catData),
      datasets: [{ data: Object.values(catData), backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'] }]
    },
    options: { maintainAspectRatio: false }
  })
}

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val)

// Pantau perubahan data untuk update grafik
watch(() => expenseStore.filteredData, () => nextTick(renderCharts))

onMounted(() => {
  if (expenseStore.filteredData.length) renderCharts()
})
</script>
