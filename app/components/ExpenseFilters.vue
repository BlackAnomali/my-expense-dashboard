<template>
  <div class="p-3 md:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4 md:space-y-0">
    <!-- Mobile Layout (Stacked) -->
    <div class="block md:hidden space-y-3">
      <!-- Date Range Section -->
      <div class="space-y-2">
        <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Date Range</label>
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <label class="text-xs text-gray-500 dark:text-gray-400">From</label>
            <input
              type="date"
              v-model="localDateFrom"
              @change="updateDateRange"
              class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs text-gray-500 dark:text-gray-400">To</label>
            <input
              type="date"
              v-model="localDateTo"
              @change="updateDateRange"
              class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      <!-- Category and Refresh Section -->
      <div class="grid grid-cols-3 gap-2">
        <div class="col-span-2 space-y-1">
          <label class="text-xs font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select
            v-model="localCategory"
            @change="updateCategory"
            class="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="flex flex-col justify-end">
          <button
            @click="refreshData"
            :disabled="isLoading"
            class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-medium px-3 py-2 rounded-md transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <RotateCcw v-if="!isLoading" class="h-3 w-3" />
            <Loader2 v-else class="h-3 w-3 animate-spin" />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Layout (Horizontal) -->
    <div class="hidden md:flex md:items-end md:gap-4">
      <!-- Date Range Section -->
      <div class="flex flex-col min-w-0">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
        <div class="flex items-center gap-2">
          <input
            type="date"
            v-model="localDateFrom"
            @change="updateDateRange"
            class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400 px-1">to</span>
          <input
            type="date"
            v-model="localDateTo"
            @change="updateDateRange"
            class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <!-- Category Section -->
      <div class="flex flex-col min-w-0">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
        <select
          v-model="localCategory"
          @change="updateCategory"
          class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]"
        >
          <option value="all">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      
      <!-- Refresh Button -->
      <div class="flex-shrink-0">
        <button
          @click="refreshData"
          :disabled="isLoading"
          class="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-md transition-colors duration-200 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RotateCcw v-if="!isLoading" class="h-4 w-4" />
          <Loader2 v-else class="h-4 w-4 animate-spin" />
          <span class="hidden lg:inline">{{ isLoading ? 'Loading...' : 'Refresh' }}</span>
        </button>
      </div>
    </div>

    <!-- Quick Date Filters (Mobile Only) -->
    <div class="block md:hidden">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="preset in datePresets"
          :key="preset.label"
          @click="applyDatePreset(preset)"
          class="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { RotateCcw, Loader2 } from 'lucide-vue-next'

const expenseStore = useExpenseStore()

const localDateFrom = ref('')
const localDateTo = ref('')
const localCategory = ref('all')

const categories = computed(() => expenseStore.categories)
const isLoading = computed(() => expenseStore.isLoading)

// Date presets for quick selection (mobile)
const datePresets = [
  {
    label: 'Today',
    getValue: () => {
      const today = new Date()
      return { from: today, to: today }
    }
  },
  {
    label: 'This Week',
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()))
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6))
      return { from: firstDay, to: lastDay }
    }
  },
  {
    label: 'This Month',
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { from: firstDay, to: lastDay }
    }
  },
  {
    label: 'Last Month',
    getValue: () => {
      const today = new Date()
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: firstDay, to: lastDay }
    }
  }
]

// Initialize with current filters
watch(() => expenseStore.dateRange, (newRange) => {
  if (newRange.from) {
    localDateFrom.value = newRange.from.toISOString().split('T')[0]
  }
  if (newRange.to) {
    localDateTo.value = newRange.to.toISOString().split('T')[0]
  }
}, { immediate: true })

watch(() => expenseStore.selectedCategory, (newCategory) => {
  localCategory.value = newCategory
}, { immediate: true })

function updateDateRange() {
  if (localDateFrom.value && localDateTo.value) {
    expenseStore.updateDateRange(
      new Date(localDateFrom.value),
      new Date(localDateTo.value)
    )
  }
}

function updateCategory() {
  expenseStore.updateCategory(localCategory.value)
}

function refreshData() {
  expenseStore.refreshData()
}

function applyDatePreset(preset) {
  const dates = preset.getValue()
  localDateFrom.value = dates.from.toISOString().split('T')[0]
  localDateTo.value = dates.to.toISOString().split('T')[0]
  updateDateRange()
}
</script>