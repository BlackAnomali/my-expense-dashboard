<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div v-if="expenseStore.isLoading && !expenseStore.allData.length" class="flex h-screen items-center justify-center">
      <div class="text-center">
        <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p class="text-lg animate-pulse text-blue-600 font-medium">Sinkronisasi Database...</p>
      </div>
    </div>
    <NuxtPage v-else />
  </div>
</template>

<script setup>
import { useExpenseStore } from '~/store/expenseStore'

const expenseStore = useExpenseStore()

onMounted(async () => {
  try {
    await expenseStore.fetchData()
  } catch (error) {
    console.error("Gagal memuat data utama:", error)
  }
})
</script>
