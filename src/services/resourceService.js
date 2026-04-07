/**
 * Resource Service - Flexible data loading system
 * Supports multiple data sources: Static, Markdown, API
 */

// Resource Schema
export const ResourceSchema = {
  id: String,
  title: String,
  url: String,
  date: String,
  tags: Array,
  type: String, // 'PAPER', 'LIBS', 'HUB', 'COMMUNITY'
  note: String, // optional
  author: String, // optional
  description: String // optional
}

// Base Loader Interface
class ResourceLoader {
  async load() {
    throw new Error('load() must be implemented')
  }
}

// Static Loader - Current hardcoded data
export class StaticLoader extends ResourceLoader {
  constructor(data) {
    super()
    this.data = data
  }

  async load() {
    return this.data
  }
}

// Markdown Loader - For GitHub-based content
export class MarkdownLoader extends ResourceLoader {
  constructor(url) {
    super()
    this.url = url
  }

  async load() {
    try {
      const response = await fetch(this.url)
      if (!response.ok) throw new Error(`Failed to load: ${response.status}`)
      
      const text = await response.text()
      return this.parseMarkdown(text)
    } catch (error) {
      console.error('MarkdownLoader error:', error)
      return []
    }
  }

  parseMarkdown(text) {
    // Parse markdown format:
    // ## Title
    // - URL: https://...
    // - Date: 2024-01-01
    // - Tags: tag1, tag2
    // - Note: Optional note
    
    const resources = []
    const sections = text.split('## ').filter(s => s.trim())
    
    sections.forEach((section, index) => {
      const lines = section.split('\n').filter(l => l.trim())
      if (lines.length === 0) return
      
      const title = lines[0].trim()
      const resource = {
        id: Date.now() + index,
        title,
        url: '',
        date: '',
        tags: [],
        type: '',
        note: ''
      }
      
      lines.slice(1).forEach(line => {
        const match = line.match(/^-\s*(\w+):\s*(.+)$/)
        if (match) {
          const [, key, value] = match
          if (key === 'URL') resource.url = value.trim()
          else if (key === 'Date') resource.date = value.trim()
          else if (key === 'Tags') resource.tags = value.split(',').map(t => t.trim())
          else if (key === 'Type') resource.type = value.trim()
          else if (key === 'Note') resource.note = value.trim()
        }
      })
      
      if (resource.url) resources.push(resource)
    })
    
    return resources
  }
}

// JSON Loader - For JSON files (local or remote)
export class JSONLoader extends ResourceLoader {
  constructor(url) {
    super()
    this.url = url
  }

  async load() {
    try {
      const response = await fetch(this.url)
      if (!response.ok) throw new Error(`Failed to load: ${response.status}`)
      
      const data = await response.json()
      return this.parseJSON(data)
    } catch (error) {
      console.error('JSONLoader error:', error)
      return []
    }
  }

  parseJSON(data) {
    // Expect format: { resources: [...] }
    if (data.resources && Array.isArray(data.resources)) {
      return data.resources
    }
    // Fallback: if it's already an array
    if (Array.isArray(data)) {
      return data
    }
    return []
  }
}

// API Loader - For future API integration
export class APILoader extends ResourceLoader {
  constructor(endpoint, options = {}) {
    super()
    this.endpoint = endpoint
    this.options = options
  }

  async load() {
    try {
      const response = await fetch(this.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.options.headers
        }
      })
      
      if (!response.ok) throw new Error(`API error: ${response.status}`)
      
      const data = await response.json()
      return this.transformData(data)
    } catch (error) {
      console.error('APILoader error:', error)
      return []
    }
  }

  transformData(data) {
    // Transform API response to match ResourceSchema
    // Override this method for custom API formats
    return data
  }
}

// Resource Service - Main interface
export class ResourceService {
  constructor() {
    this.loaders = {
      papers: null,
      repos: null,
      huggingface: null
    }
  }

  setLoader(type, loader) {
    if (!this.loaders.hasOwnProperty(type)) {
      throw new Error(`Unknown resource type: ${type}`)
    }
    this.loaders[type] = loader
  }

  async loadResources(type) {
    const loader = this.loaders[type]
    if (!loader) {
      console.warn(`No loader configured for ${type}`)
      return []
    }
    
    return await loader.load()
  }

  async loadAll() {
    const results = {}
    for (const type of Object.keys(this.loaders)) {
      results[type] = await this.loadResources(type)
    }
    return results
  }
}

// Export singleton instance
export const resourceService = new ResourceService()
