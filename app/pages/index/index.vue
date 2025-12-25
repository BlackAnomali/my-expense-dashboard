<template>
  <BasePage title="Dashboard">
    <!-- Date Range Filter -->
    <div class="mb-4 md:mb-6">
      <ExpenseFilters />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="text-muted-foreground">Loading dashboard data...</div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-4 md:space-y-6">
      <!-- Key Metrics Cards - Redesigned with better space usage -->
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <!-- Total Spent -->
        <Card class="relative overflow-hidden">
          <div class="p-4 md:p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <div
                    class="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30"
                  >
                    <DollarSign
                      class="h-3 w-3 md:h-4 md:w-4 text-green-600 dark:text-green-400"
                    />
                  </div>
                  <p
                    class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Total Spent
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-lg md:text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {{ formatCurrency(totalSpent, true) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ filteredData.length }} transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            class="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-green-50 to-transparent dark:from-green-900/10 opacity-50"
          ></div>
        </Card>

        <!-- Daily Average -->
        <Card class="relative overflow-hidden">
          <div class="p-4 md:p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <div class="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Calendar
                      class="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <p
                    class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Daily Average
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-lg md:text-2xl font-bold text-gray-900 dark:text-white"
                  >
                    {{ formatCurrency(averageDailySpending, true) }}
                  </p>
                  <div class="flex items-center gap-1">
                    <span class="text-xs" :class="trendClass">{{
                      trendTextMobile
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-blue-50 to-transparent dark:from-blue-900/10 opacity-50"
          ></div>
        </Card>

        <!-- Top Category -->
        <Card class="relative overflow-hidden">
          <div class="p-4 md:p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <div
                    class="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30"
                  >
                    <PieChart
                      class="h-3 w-3 md:h-4 md:w-4 text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <p
                    class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Top Category
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-sm md:text-xl font-bold text-gray-900 dark:text-white truncate"
                  >
                    {{ topCategory?.category || "N/A" }}
                  </p>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ Math.round(topCategory?.percentage || 0) }}% of total
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-purple-50 to-transparent dark:from-purple-900/10 opacity-50"
          ></div>
        </Card>

        <!-- Top Shop -->
        <Card class="relative overflow-hidden">
          <div class="p-4 md:p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <div
                    class="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30"
                  >
                    <Store
                      class="h-3 w-3 md:h-4 md:w-4 text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <p
                    class="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Most Visited
                  </p>
                </div>
                <div class="space-y-1">
                  <p
                    class="text-sm md:text-xl font-bold text-gray-900 dark:text-white truncate"
                  >
                    {{ topShop?.shop || "N/A" }}
                  </p>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ topShop?.count || 0 }} visits
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-orange-50 to-transparent dark:from-orange-900/10 opacity-50"
          ></div>
        </Card>
      </div>
      <!-- Charts - Stacked on mobile, side by side on desktop -->
      <div class="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <!-- Daily Spending Chart -->
        <Card>
          <CardHeader class="p-4 md:p-6">
            <CardTitle class="text-base md:text-lg"
              >Daily Spending Trend</CardTitle
            >
            <CardDescription class="text-sm"
              >Your spending pattern over time</CardDescription
            >
          </CardHeader>
          <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
            <div class="h-64 md:h-80">
              <canvas ref="dailyChart"></canvas>
            </div>
          </CardContent>
        </Card>

        <!-- Category Breakdown -->
        <Card>
          <CardHeader class="p-4 md:p-6">
            <CardTitle class="text-base md:text-lg"
              >Spending by Category</CardTitle
            >
            <CardDescription class="text-sm"
              >Distribution of your expenses</CardDescription
            >
          </CardHeader>
          <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
            <div class="h-64 md:h-80">
              <canvas ref="categoryChart"></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Category Details - Mobile optimized -->
      <Card>
        <CardHeader class="p-4 md:p-6">
          <CardTitle class="text-base md:text-lg">Category Breakdown</CardTitle>
          <CardDescription class="text-sm"
            >Detailed analysis of spending by category</CardDescription
          >
        </CardHeader>
        <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
          <div class="space-y-3 md:space-y-4">
            <div
              v-for="category in categoryBreakdown.slice(
                0,
                showAllCategories ? categoryBreakdown.length : 5
              )"
              :key="category.category"
              class="flex items-center justify-between p-3 md:p-4 border rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <h4 class="font-medium truncate">{{ category.category }}</h4>
                <p class="text-xs md:text-sm text-muted-foreground">
                  {{ category.count }} transactions
                </p>
              </div>
              <div class="text-right ml-2">
                <div class="font-bold text-sm md:text-base">
                  {{ formatCurrency(category.total, true) }}
                </div>
                <div class="text-xs md:text-sm text-muted-foreground">
                  {{ Math.round(category.percentage) }}%
                </div>
              </div>
              <div class="w-12 md:w-24 ml-2 md:ml-4">
                <div class="w-full bg-secondary rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min(category.percentage, 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Show more/less button -->
            <div v-if="categoryBreakdown.length > 5" class="text-center pt-2">
              <button
                @click="showAllCategories = !showAllCategories"
                class="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {{
                  showAllCategories
                    ? "Show Less"
                    : `Show ${categoryBreakdown.length - 5} More`
                }}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Shops - Mobile optimized -->
      <Card>
        <CardHeader class="p-4 md:p-6">
          <CardTitle class="text-base md:text-lg">Most Visited Shops</CardTitle>
          <CardDescription class="text-sm"
            >Your top shopping destinations</CardDescription
          >
        </CardHeader>
        <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
          <div class="space-y-2 md:space-y-3">
            <div
              v-for="(shop, index) in topShops"
              :key="shop.shop"
              class="flex items-center justify-between p-3 border rounded"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div
                  class="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium flex-shrink-0"
                >
                  {{ index + 1 }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium text-sm md:text-base truncate">
                    {{ shop.shop }}
                  </div>
                  <div class="text-xs md:text-sm text-muted-foreground">
                    {{ shop.count }} visits
                  </div>
                </div>
              </div>
              <div class="text-right ml-2">
                <div class="font-bold text-sm md:text-base">
                  {{ formatCurrency(shop.total, true) }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Insights & Recommendations - Mobile optimized -->
      <Card>
        <CardHeader class="p-4 md:p-6">
          <CardTitle class="text-base md:text-lg flex items-center gap-2">
            💡 Insights & Recommendations
          </CardTitle>
          <CardDescription class="text-sm"
            >AI-powered suggestions for next month</CardDescription
          >
        </CardHeader>
        <CardContent class="p-4 pt-0 md:p-6 md:pt-0">
          <div class="space-y-3 md:space-y-4">
            <div
              v-for="insight in insights"
              :key="insight.title"
              class="p-3 md:p-4 border rounded-lg"
              :class="
                insight.type === 'warning'
                  ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                  : insight.type === 'success'
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                  : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
              "
            >
              <h4
                class="font-medium flex items-center gap-2 text-sm md:text-base"
              >
                <span v-if="insight.type === 'warning'">⚠️</span>
                <span v-else-if="insight.type === 'success'">✅</span>
                <span v-else>💡</span>
                {{ insight.title }}
              </h4>
              <p class="text-xs md:text-sm text-muted-foreground mt-1">
                {{ insight.description }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </BasePage>
</template>

<script setup>
import { onMounted, computed, ref, nextTick, watch } from "vue";
import { useExpenseStore } from "@/stores/expenseStore";
import ExpenseFilters from "@/components/ExpenseFilters.vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Calendar, PieChart, Store } from "lucide-vue-next";
import Chart from "chart.js/auto";

const expenseStore = useExpenseStore();

// Mobile state
const showAllCategories = ref(false);

// Chart refs
const dailyChart = ref(null);
const categoryChart = ref(null);
let dailyChartInstance = null;
let categoryChartInstance = null;

// Computed properties
const isLoading = computed(() => expenseStore.isLoading);
const filteredData = computed(() => expenseStore.filteredData);
const totalSpent = computed(() => expenseStore.totalSpent);
const categoryBreakdown = computed(() => expenseStore.categoryBreakdown);
const dailySpending = computed(() => expenseStore.dailySpending);
const topShops = computed(() => expenseStore.topShops);
const averageDailySpending = computed(() => expenseStore.averageDailySpending);
const spendingTrend = computed(() => expenseStore.spendingTrend);

const topCategory = computed(() => categoryBreakdown.value[0] || null);
const topShop = computed(() => topShops.value[0] || null);

const trendClass = computed(() => {
  switch (spendingTrend.value) {
    case "increasing":
      return "text-red-600";
    case "decreasing":
      return "text-green-600";
    case "stable":
      return "text-yellow-600";
    default:
      return "text-muted-foreground";
  }
});

const trendText = computed(() => {
  switch (spendingTrend.value) {
    case "increasing":
      return "📈 Increasing trend";
    case "decreasing":
      return "📉 Decreasing trend";
    case "stable":
      return "📊 Stable spending";
    default:
      return "Analyzing trend...";
  }
});

// Mobile-optimized trend text
const trendTextMobile = computed(() => {
  switch (spendingTrend.value) {
    case "increasing":
      return "📈 Rising";
    case "decreasing":
      return "📉 Falling";
    case "stable":
      return "📊 Stable";
    default:
      return "Analyzing...";
  }
});

// Insights generator
const insights = computed(() => {
  const results = [];
  const data = filteredData.value;
  const categories = categoryBreakdown.value;

  if (categories.length > 0) {
    const topCat = categories[0];
    if (topCat.percentage > 40) {
      results.push({
        type: "warning",
        title: "High Category Concentration",
        description: `${Math.round(
          topCat.percentage
        )}% of your spending is on ${
          topCat.category
        }. Consider diversifying or budgeting for this category.`,
      });
    }
  }

  if (spendingTrend.value === "increasing") {
    results.push({
      type: "warning",
      title: "Increasing Spending Trend",
      description:
        "Your daily spending has been increasing. Consider reviewing your budget for next month.",
    });
  }

  if (
    topShops.value.length > 0 &&
    topShops.value[0].count > data.length * 0.3
  ) {
    results.push({
      type: "info",
      title: "Frequent Shop Visits",
      description: `You visit ${topShops.value[0].shop} frequently. Consider checking for loyalty programs or bulk discounts.`,
    });
  }

  const weekendSpending = data.filter((item) => {
    const day = item.rawDate.getDay();
    return day === 0 || day === 6;
  });

  if (weekendSpending.length > data.length * 0.4) {
    results.push({
      type: "info",
      title: "Weekend Spending Pattern",
      description:
        "You tend to spend more on weekends. Plan your weekend activities to manage expenses.",
    });
  }

  if (results.length === 0) {
    results.push({
      type: "success",
      title: "Healthy Spending Pattern",
      description:
        "Your spending appears well-distributed across categories and time. Keep up the good work!",
    });
  }

  return results;
});

// Helper functions
function formatCurrency(amount, compact = false) {
  if (!amount && amount !== 0) return "Rp 0";

  if (compact && amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`;
  } else if (compact && amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}K`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Chart creation functions
function createDailyChart() {
  if (dailyChartInstance) {
    dailyChartInstance.destroy();
  }

  const ctx = dailyChart.value.getContext("2d");
  const data = dailySpending.value;

  dailyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((d) => {
        const date = new Date(d.date);
        // Show shorter labels on mobile
        return window.innerWidth < 768
          ? `${date.getDate()}/${date.getMonth() + 1}`
          : date.toLocaleDateString("id-ID");
      }),
      datasets: [
        {
          label: "Daily Spending",
          data: data.map((d) => d.total),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (window.innerWidth < 768) {
                return value >= 1000000
                  ? `${(value / 1000000).toFixed(0)}M`
                  : value >= 1000
                  ? `${(value / 1000).toFixed(0)}K`
                  : value;
              }
              return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value);
            },
            font: {
              size: window.innerWidth < 768 ? 10 : 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: window.innerWidth < 768 ? 12 : 14,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return formatCurrency(context.parsed.y);
            },
          },
        },
      },
    },
  });
}

function createCategoryChart() {
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const ctx = categoryChart.value.getContext("2d");
  const data = categoryBreakdown.value;

  const colors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#84CC16",
    "#EC4899",
    "#6366F1",
  ];

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: data.map((d) => d.category),
      datasets: [
        {
          data: data.map((d) => d.total),
          backgroundColor: colors.slice(0, data.length),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: window.innerWidth < 768 ? "bottom" : "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: window.innerWidth < 768 ? 11 : 12,
            },
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = Math.round(
                    (value / totalSpent.value) * 100
                  );
                  // Truncate long labels on mobile
                  const displayLabel =
                    window.innerWidth < 768 && label.length > 12
                      ? label.substring(0, 12) + "..."
                      : label;

                  return {
                    text: `${displayLabel} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = formatCurrency(context.parsed);
              const percentage = Math.round(
                (context.parsed / totalSpent.value) * 100
              );
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// Watch for data changes and update charts
watch([dailySpending, categoryBreakdown], () => {
  nextTick(() => {
    if (dailyChart.value && dailySpending.value.length > 0) createDailyChart();
    if (categoryChart.value && categoryBreakdown.value.length > 0)
      createCategoryChart();
  });
});

// Handle window resize for responsive charts
const handleResize = () => {
  nextTick(() => {
    if (dailyChartInstance) createDailyChart();
    if (categoryChartInstance) createCategoryChart();
  });
};

// Initialize
onMounted(async () => {
  await expenseStore.initialize();

  window.addEventListener("resize", handleResize);

  nextTick(() => {
    if (dailySpending.value.length > 0) createDailyChart();
    if (categoryBreakdown.value.length > 0) createCategoryChart();
  });
});

// Cleanup
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (dailyChartInstance) dailyChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();
});
</script>
