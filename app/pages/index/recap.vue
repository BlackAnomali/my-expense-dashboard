<template>
  <BasePage title="Expense Tracker">
    <ExpenseFilters />
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="text-gray-500">Loading data...</div>
    </div>
    <div v-else>
      <!-- Data summary -->
      <div class="mb-4 p-4 bg-blue-50 rounded-lg">
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredData.length }} records
            <span v-if="dateRange.from && dateRange.to">
              from {{ formatDate(dateRange.from) }} to
              {{ formatDate(dateRange.to) }}
            </span>
          </div>
          <div class="text-sm text-gray-500">
            Loaded quarters: {{ loadedQuarters.join(", ") }}
          </div>
        </div>
        <div
          v-if="filteredData.length > 0"
          class="mt-2 text-lg font-semibold text-blue-700"
        >
          Total: {{ formatCurrency(totalAmount) }}
        </div>
      </div>

      <!-- Data Table -->
      <DataTable :columns="columns" :data="filteredData" />
    </div>
  </BasePage>
</template>

<script setup>
import { onMounted, computed } from "vue";
import DataTable from "@/components/DataTable.vue";
import ExpenseFilters from "@/components/ExpenseFilters.vue";
import { useExpenseStore } from "@/stores/expenseStore";

const expenseStore = useExpenseStore();

// Computed properties from store
const filteredData = computed(() => expenseStore.filteredData);
const isLoading = computed(() => expenseStore.isLoading);
const dateRange = computed(() => expenseStore.dateRange);
const loadedQuarters = computed(() =>
  Array.from(expenseStore.loadedQuarters).sort()
);

// Calculate total amount
const totalAmount = computed(() => {
  return filteredData.value.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );
});

// Table columns configuration
const columns = [
  {
    accessorKey: "tanggal",
    header: "Tanggal",
    cell: ({ row }) => formatDate(row.original.rawDate),
  },
  {
    accessorKey: "name",
    header: "Product",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
  {
    accessorKey: "pricePerUnit",
    header: "Price Per Unit",
    cell: ({ row }) => formatCurrency(row.original.pricePerUnit),
  },
  {
    accessorKey: "qty",
    header: "Qty",
  },
  {
    accessorKey: "Category",
    header: "Category",
  },
  {
    accessorKey: "shop",
    header: "Shop",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => formatCurrency(row.original.totalPrice),
  },
];

// Helper functions
function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
}

// Initialize store on component mount
onMounted(async () => {
  try {
    await expenseStore.initialize();
  } catch (error) {
    console.error("Failed to initialize expense data:", error);
    // You might want to show a toast/notification here
  }
});
</script>
