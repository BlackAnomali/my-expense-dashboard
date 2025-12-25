<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4">
      <div class="flex items-start gap-3">
        <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Download class="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-medium text-gray-900 dark:text-white">Install App</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add to home screen for quick access and offline use
          </p>
          <div class="flex gap-2 mt-3">
            <button 
              @click="installPWA"
              class="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
            >
              Install
            </button>
            <button 
              @click="dismissPrompt"
              class="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button @click="dismissPrompt" class="text-gray-400 hover:text-gray-600">
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Download, X } from 'lucide-vue-next'

const showInstallPrompt = ref(false)
let deferredPrompt = null

onMounted(() => {
  if (typeof window === 'undefined') return

  // Check if already installed
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App is already installed')
    return
  }

  // Check if running as PWA
  if (window.navigator && window.navigator.standalone) {
    console.log('App is running as PWA on iOS')
    return
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired')
    e.preventDefault()
    deferredPrompt = e
    
    // Show custom install prompt after a delay
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  })

  console.log('PWA Install component initialized')
})

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult) => {
      console.log('Install choice:', choiceResult.outcome)
      deferredPrompt = null
      showInstallPrompt.value = false
    })
  } else {
    console.log('No install prompt available')
    showManualInstructions()
  }
}

function showManualInstructions() {
  const userAgent = navigator.userAgent.toLowerCase()
  let instructions = 'To install this app:\n\n'
  
  if (userAgent.includes('chrome')) {
    instructions += 'Chrome: Look for the install icon (⚬) in the address bar'
  } else if (userAgent.includes('safari')) {
    instructions += 'Safari: Tap Share → Add to Home Screen'
  } else if (userAgent.includes('firefox')) {
    instructions += 'Firefox: Look for "Install" in the page menu'
  } else {
    instructions += 'Look for "Install" or "Add to Home Screen" option in your browser menu'
  }
  
  alert(instructions)
}

function dismissPrompt() {
  showInstallPrompt.value = false
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }
}
</script>