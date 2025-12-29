<template>
  <div>
    <div v-if="expenseStore.isLoading" class="flex h-screen items-center justify-center">
      <p class="text-lg animate-pulse">Memuat data pengeluaran...</p>
    </div>
    
    <NuxtPage v-else />
  </div>
</template>

<script setup>
import { useExpenseStore } from '~/store/expenseStore'

const expenseStore = useExpenseStore()

// Perintah untuk mengambil data segera setelah aplikasi dimuat di browser
onMounted(() => {
  expenseStore.fetchData()
})
</script>
