import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBotStore = defineStore('bot', () => {
  // State
  const botStatus = ref('offline') // 'online', 'offline', 'connecting'
  const botStats = ref({
    totalResources: 0,
    lastUpdate: null,
    uptime: 0
  })
  const logs = ref([])

  // Actions
  function updateBotStatus(status) {
    botStatus.value = status
    addLog(`Bot status changed to: ${status}`)
  }

  function updateStats(stats) {
    botStats.value = { ...botStats.value, ...stats }
  }

  function addLog(message) {
    logs.value.unshift({
      id: Date.now(),
      message,
      timestamp: new Date().toISOString()
    })
    // Keep only last 100 logs
    if (logs.value.length > 100) {
      logs.value = logs.value.slice(0, 100)
    }
  }

  return {
    // State
    botStatus,
    botStats,
    logs,
    // Actions
    updateBotStatus,
    updateStats,
    addLog
  }
})
