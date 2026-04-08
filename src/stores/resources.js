import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { resourceService, StaticLoader, MarkdownLoader, JSONLoader } from '../services/resourceService'

// Default static data as fallback
const defaultPapers = [
  {
    id: 1,
    title: 'Attention is All You Need',
    url: 'https://arxiv.org/abs/1706.03762',
    date: '2017-06-12',
    tags: ['transformer', 'nlp'],
    type: 'PAPER',
    sources: [
      {
        label: 'arXiv Paper',
        url: 'https://arxiv.org/abs/1706.03762',
        type: 'arxiv'
      },
      {
        label: 'PDF Download',
        url: 'https://arxiv.org/pdf/1706.03762.pdf',
        type: 'paper'
      },
      {
        label: 'GitHub Code',
        url: 'https://github.com/tensorflow/tensor2tensor',
        type: 'github'
      },
      {
        label: 'Blog Post',
        url: 'https://ai.googleblog.com/2017/08/transformer-novel-neural-network.html',
        type: 'website'
      }
    ]
  }
]

const defaultRepos = [
  {
    id: 1,
    title: 'Tiny AI Github Repo',
    url: 'https://github.com/TheTinyAIServer/TinyAI',
    date: '2024-04-07',
    tags: ['github', 'tiny ai'],
    type: 'LIBS',
    sources: [
      {
        label: 'GitHub Repository',
        url: 'https://github.com/TheTinyAIServer/TinyAI',
        type: 'github'
      },
      {
        label: 'Documentation',
        url: 'https://github.com/TheTinyAIServer/TinyAI#readme',
        type: 'docs'
      },
      {
        label: 'Issues',
        url: 'https://github.com/TheTinyAIServer/TinyAI/issues',
        type: 'code'
      }
    ]
  },
  {
    id: 2,
    title: 'Tiny AI — Community',
    url: 'https://github.com/TheTinyAIServer',
    date: '2024-01-06',
    tags: ['community'],
    type: 'COMMUNITY',
    note: 'Placeholder entry: replace URL with your org on Discord invite policy page.'
  }
]

const defaultHuggingFace = [
  {
    id: 1,
    title: 'Tiny AI Hugging Face Page',
    url: 'https://huggingface.co/TheTinyAIServer',
    date: '2024-04-07',
    tags: ['hugging face', 'tiny ai'],
    type: 'HUB'
  }
]

export const useResourcesStore = defineStore('resources', () => {
  // State
  const activeTab = ref('papers')
  const papers = ref([])
  const repos = ref([])
  const huggingFace = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Initialize loaders - can be configured to use Markdown or API loaders
  function initializeLoaders() {
    // Try to use JSON loaders first (for production)
    try {
      useJSONLoaders('./data')
    } catch (err) {
      // Fallback to static loaders with default data
      resourceService.setLoader('papers', new StaticLoader(defaultPapers))
      resourceService.setLoader('repos', new StaticLoader(defaultRepos))
      resourceService.setLoader('huggingface', new StaticLoader(defaultHuggingFace))
    }
  }

  // Configure to use markdown files from GitHub
  function useMarkdownLoaders(baseUrl) {
    resourceService.setLoader('papers', new MarkdownLoader(`${baseUrl}/papers.md`))
    resourceService.setLoader('repos', new MarkdownLoader(`${baseUrl}/repos.md`))
    resourceService.setLoader('huggingface', new MarkdownLoader(`${baseUrl}/huggingface.md`))
  }

  // Configure to use JSON files (local or remote)
  function useJSONLoaders(baseUrl) {
    resourceService.setLoader('papers', new JSONLoader(`${baseUrl}/papers.json`))
    resourceService.setLoader('repos', new JSONLoader(`${baseUrl}/repos.json`))
    resourceService.setLoader('huggingface', new JSONLoader(`${baseUrl}/huggingface.json`))
  }

  // Load all resources
  async function loadAllResources() {
    isLoading.value = true
    error.value = null
    
    try {
      const results = await resourceService.loadAll()
      papers.value = results.papers || []
      repos.value = results.repos || []
      huggingFace.value = results.huggingface || []
    } catch (err) {
      error.value = err.message
      console.error('Failed to load resources:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Load specific resource type
  async function loadResources(type) {
    isLoading.value = true
    error.value = null
    
    try {
      const data = await resourceService.loadResources(type)
      
      switch (type) {
        case 'papers':
          papers.value = data
          break
        case 'repos':
          repos.value = data
          break
        case 'huggingface':
          huggingFace.value = data
          break
      }
    } catch (err) {
      error.value = err.message
      console.error(`Failed to load ${type}:`, err)
    } finally {
      isLoading.value = false
    }
  }

  // Getters
  const currentResources = computed(() => {
    switch (activeTab.value) {
      case 'papers':
        return papers.value
      case 'repos':
        return repos.value
      case 'huggingface':
        return huggingFace.value
      default:
        return []
    }
  })

  // Actions
  function setActiveTab(tab) {
    activeTab.value = tab
  }

  function addPaper(paper) {
    papers.value.push({ ...paper, id: Date.now() })
  }

  function addRepo(repo) {
    repos.value.push({ ...repo, id: Date.now() })
  }

  function addHuggingFace(item) {
    huggingFace.value.push({ ...item, id: Date.now() })
  }

  // Initialize with default loaders
  initializeLoaders()

  return {
    // State
    activeTab,
    papers,
    repos,
    huggingFace,
    isLoading,
    error,
    // Getters
    currentResources,
    // Actions
    setActiveTab,
    addPaper,
    addRepo,
    addHuggingFace,
    loadAllResources,
    loadResources,
    useMarkdownLoaders,
    useJSONLoaders,
    initializeLoaders
  }
})
