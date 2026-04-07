import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTutorialsStore = defineStore('tutorials', () => {
  // State
  const tutorials = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Load tutorials from JSON
  async function loadTutorials() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch('./data/tutorials.json')
      if (response.ok) {
        const data = await response.json()
        tutorials.value = data.resources || []
      } else {
        throw new Error('Failed to load tutorials')
      }
    } catch (err) {
      error.value = err.message
      console.error('Failed to load tutorials:', err)
      // Fallback to empty array
      tutorials.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Add tutorial (for future API integration)
  function addTutorial(tutorial) {
    tutorials.value.push({
      ...tutorial,
      id: tutorial.id || `tutorial-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    })
  }

  return {
    // State
    tutorials,
    isLoading,
    error,
    // Actions
    loadTutorials,
    addTutorial
  }
})
