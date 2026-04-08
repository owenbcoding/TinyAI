import { defineStore } from 'pinia'
import { ref } from 'vue'

// Fallback tutorials if fetch fails
const fallbackTutorials = [
  {
    id: 'tutorial-001',
    title: 'Getting Started with Transformers',
    description: 'Learn the basics of transformer models and how to use them for NLP tasks.',
    difficulty: 'beginner',
    duration: '15 min',
    tags: ['transformers', 'nlp', 'basics'],
    author: 'Tiny AI Team',
    lastUpdated: '2026-04-08',
    content: '# Getting Started with Transformers\n\n## Introduction\n\nTransformers have revolutionized natural language processing.'
  }
]

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
      // Try multiple paths for compatibility with different environments
      const paths = [
        '/data/tutorials.json',
        './data/tutorials.json',
        '../data/tutorials.json',
        'data/tutorials.json'
      ]
      
      let response = null
      let lastError = null
      
      for (const path of paths) {
        try {
          response = await fetch(path)
          if (response.ok) {
            break
          }
        } catch (err) {
          lastError = err
          continue
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error(`HTTP error! status: ${response?.status}`)
      }
      
      const data = await response.json()
      tutorials.value = data.resources || []
    } catch (err) {
      console.error('Failed to load tutorials:', err)
      error.value = err.message
      // Use fallback tutorials
      tutorials.value = fallbackTutorials
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
