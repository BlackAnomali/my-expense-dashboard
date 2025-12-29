<template>
  <div class="min-h-screen bg-background">
    <div v-if="expenseStore.isLoading && !expenseStore.allData.length" class="flex h-screen items-center justify-center">
      <div class="text-center">
        <div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p class="text-lg animate-pulse text-primary">Menghubungkan ke Google Sheets...</p>
      </div>
    </div>
    
    <NuxtPage v-else />
  </div>
</template>

<script setup>
import { useExpenseStore } from '~/store/expenseStore'

const expenseStore = useExpenseStore()

// Ambil data hanya sekali di sini, tidak perlu di setiap halaman
onMounted(async () => {
  try {
    await expenseStore.initialize()
  } catch (error) {
    console.error("Gagal inisialisasi aplikasi:", error)
  }
})
</script>
