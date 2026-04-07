# API Reference

## Overview

Complete API reference for integrating with the Tiny AI Resources Platform. This document covers all schemas, endpoints, and data structures.

## GitHub API Configuration

### Base Configuration

```javascript
const config = {
  owner: 'TheTinyAIServer',
  repo: 'TheTinyAIServer.github.io',
  branch: 'main',
  basePath: 'public/data'
}
```

### Authentication

```javascript
headers: {
  'Authorization': 'Bearer YOUR_GITHUB_TOKEN',
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
}
```

## Data Files

### File Paths

All data files are located in `public/data/`:

| File | Purpose | Schema |
|------|---------|--------|
| `papers.json` | Research papers | Resource Schema |
| `repos.json` | GitHub repositories | Resource Schema |
| `huggingface.json` | HF models/datasets | Resource Schema |
| `tutorials.json` | Learning tutorials | Tutorial Schema |

### File Structure

Each JSON file follows this structure:

```json
{
  "lastUpdated": "2026-04-08T12:00:00Z",
  "resources": [
    { ... },
    { ... }
  ]
}
```

## Resource Schema

### Complete Schema

```typescript
interface Resource {
  id: string                    // Unique identifier
  title: string                 // Display title
  url: string                   // Primary URL
  date: string                  // Publication date (YYYY-MM-DD)
  tags: string[]                // Category tags
  type: ResourceType            // Resource type
  note?: string                 // Optional description
  sources?: Source[]            // Additional links
}

type ResourceType = 'PAPER' | 'LIBS' | 'HUB' | 'COMMUNITY'

interface Source {
  label: string                 // Display name
  url: string                   // Full URL
  type: SourceType              // Source type
}

type SourceType = 
  | 'arxiv' 
  | 'github' 
  | 'huggingface' 
  | 'website' 
  | 'paper' 
  | 'code' 
  | 'demo' 
  | 'docs'
```

### Field Specifications

#### id (required)
- Type: string
- Format: `{type}-{timestamp}` or custom unique string
- Example: `paper-1712345678`, `repo-custom-id`
- Must be unique within the file

#### title (required)
- Type: string
- Max length: 200 characters
- Example: `"Attention is All You Need"`

#### url (required)
- Type: string
- Format: Valid URL
- Example: `"https://arxiv.org/abs/1706.03762"`

#### date (required)
- Type: string
- Format: YYYY-MM-DD
- Example: `"2017-06-12"`

#### tags (required)
- Type: array of strings
- Max items: 10
- Example: `["transformer", "nlp", "attention"]`

#### type (required)
- Type: enum
- Values: `PAPER`, `LIBS`, `HUB`, `COMMUNITY`
- Example: `"PAPER"`

#### note (optional)
- Type: string
- Max length: 500 characters
- Example: `"Foundational transformer architecture paper"`

#### sources (optional)
- Type: array of Source objects
- Max items: 10
- Example:
```json
[
  {
    "label": "arXiv Paper",
    "url": "https://arxiv.org/abs/1706.03762",
    "type": "arxiv"
  },
  {
    "label": "PDF",
    "url": "https://arxiv.org/pdf/1706.03762.pdf",
    "type": "paper"
  }
]
```

### Resource Examples

#### Paper Resource

```json
{
  "id": "paper-1712345678",
  "title": "Attention is All You Need",
  "url": "https://arxiv.org/abs/1706.03762",
  "date": "2017-06-12",
  "tags": ["transformer", "nlp", "attention", "deep-learning"],
  "type": "PAPER",
  "note": "Introduced the transformer architecture that revolutionized NLP",
  "sources": [
    {
      "label": "arXiv Paper",
      "url": "https://arxiv.org/abs/1706.03762",
      "type": "arxiv"
    },
    {
      "label": "PDF Download",
      "url": "https://arxiv.org/pdf/1706.03762.pdf",
      "type": "paper"
    },
    {
      "label": "Code Implementation",
      "url": "https://github.com/tensorflow/tensor2tensor",
      "type": "code"
    }
  ]
}
```

#### Repository Resource

```json
{
  "id": "repo-1712345679",
  "title": "Transformers by Hugging Face",
  "url": "https://github.com/huggingface/transformers",
  "date": "2024-01-15",
  "tags": ["library", "transformers", "pytorch", "tensorflow"],
  "type": "LIBS",
  "note": "State-of-the-art NLP library with pre-trained models",
  "sources": [
    {
      "label": "GitHub Repository",
      "url": "https://github.com/huggingface/transformers",
      "type": "github"
    },
    {
      "label": "Documentation",
      "url": "https://huggingface.co/docs/transformers",
      "type": "docs"
    },
    {
      "label": "Live Demo",
      "url": "https://huggingface.co/models",
      "type": "demo"
    }
  ]
}
```

#### Hugging Face Resource

```json
{
  "id": "hub-1712345680",
  "title": "Llama 3.1 8B Instruct",
  "url": "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
  "date": "2024-07-23",
  "tags": ["llm", "llama", "instruction-tuned", "8b"],
  "type": "HUB",
  "note": "Instruction-tuned version of Llama 3.1 8B model",
  "sources": [
    {
      "label": "Model Card",
      "url": "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
      "type": "huggingface"
    },
    {
      "label": "Model Files",
      "url": "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/tree/main",
      "type": "code"
    }
  ]
}
```

## Tutorial Schema

### Complete Schema

```typescript
interface Tutorial {
  id: string                    // Unique identifier
  title: string                 // Tutorial title
  description: string           // Short summary
  difficulty: Difficulty        // Difficulty level
  duration: string              // Time estimate
  tags: string[]                // Category tags
  content: string               // Markdown content
  author?: string               // Creator name
  lastUpdated: string           // Last update date (YYYY-MM-DD)
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced'
```

### Field Specifications

#### id (required)
- Type: string
- Format: `tutorial-{timestamp}` or custom unique string
- Example: `tutorial-1712345678`

#### title (required)
- Type: string
- Max length: 200 characters
- Example: `"Getting Started with Transformers"`

#### description (required)
- Type: string
- Max length: 500 characters
- Example: `"Learn the basics of transformer architecture and implementation"`

#### difficulty (required)
- Type: enum
- Values: `beginner`, `intermediate`, `advanced`
- Example: `"beginner"`

#### duration (required)
- Type: string
- Format: `"{number} min"` or `"{number} hours"`
- Example: `"15 min"`, `"2 hours"`

#### tags (required)
- Type: array of strings
- Max items: 10
- Example: `["transformer", "nlp", "beginner"]`

#### content (required)
- Type: string
- Format: Markdown
- Example: See tutorial example below

#### author (optional)
- Type: string
- Example: `"Tiny AI Bot"`

#### lastUpdated (required)
- Type: string
- Format: YYYY-MM-DD
- Example: `"2026-04-08"`

### Tutorial Example

```json
{
  "id": "tutorial-1712345678",
  "title": "Getting Started with Transformers",
  "description": "Learn the basics of transformer architecture and how to use them in your projects",
  "difficulty": "beginner",
  "duration": "15 min",
  "tags": ["transformer", "nlp", "beginner", "pytorch"],
  "content": "# Getting Started with Transformers\n\n## Introduction\n\nTransformers have revolutionized natural language processing...\n\n## Installation\n\n```bash\npip install transformers\n```\n\n## Basic Usage\n\n```python\nfrom transformers import pipeline\n\nclassifier = pipeline('sentiment-analysis')\nresult = classifier('I love transformers!')\nprint(result)\n```\n\n## Next Steps\n\n- Try different models\n- Fine-tune on your data\n- Explore advanced features",
  "author": "Tiny AI Team",
  "lastUpdated": "2026-04-08"
}
```

## GitHub API Operations

### Fetch File

```javascript
const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

const response = await fetch(url, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Accept': 'application/vnd.github.v3+json'
  }
})

const fileData = await response.json()
const content = JSON.parse(atob(fileData.content))
```

### Update File

```javascript
const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

await fetch(url, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Commit message',
    content: btoa(JSON.stringify(newContent, null, 2)),
    sha: fileData.sha,
    branch: 'main'
  })
})
```

## Validation Rules

### Resource Validation

```javascript
function validateResource(resource) {
  const errors = []
  
  // ID validation
  if (!resource.id || typeof resource.id !== 'string') {
    errors.push('id: required, must be string')
  }
  
  // Title validation
  if (!resource.title || resource.title.length > 200) {
    errors.push('title: required, max 200 characters')
  }
  
  // URL validation
  if (!resource.url || !isValidUrl(resource.url)) {
    errors.push('url: required, must be valid URL')
  }
  
  // Date validation
  if (!resource.date || !/^\d{4}-\d{2}-\d{2}$/.test(resource.date)) {
    errors.push('date: required, must be YYYY-MM-DD')
  }
  
  // Tags validation
  if (!Array.isArray(resource.tags) || resource.tags.length > 10) {
    errors.push('tags: required array, max 10 items')
  }
  
  // Type validation
  if (!['PAPER', 'LIBS', 'HUB', 'COMMUNITY'].includes(resource.type)) {
    errors.push('type: must be PAPER, LIBS, HUB, or COMMUNITY')
  }
  
  // Note validation
  if (resource.note && resource.note.length > 500) {
    errors.push('note: max 500 characters')
  }
  
  // Sources validation
  if (resource.sources) {
    if (!Array.isArray(resource.sources) || resource.sources.length > 10) {
      errors.push('sources: must be array, max 10 items')
    }
    
    resource.sources.forEach((source, i) => {
      if (!source.label || !source.url || !source.type) {
        errors.push(`sources[${i}]: label, url, and type required`)
      }
    })
  }
  
  return errors
}
```

### Tutorial Validation

```javascript
function validateTutorial(tutorial) {
  const errors = []
  
  if (!tutorial.id || typeof tutorial.id !== 'string') {
    errors.push('id: required, must be string')
  }
  
  if (!tutorial.title || tutorial.title.length > 200) {
    errors.push('title: required, max 200 characters')
  }
  
  if (!tutorial.description || tutorial.description.length > 500) {
    errors.push('description: required, max 500 characters')
  }
  
  if (!['beginner', 'intermediate', 'advanced'].includes(tutorial.difficulty)) {
    errors.push('difficulty: must be beginner, intermediate, or advanced')
  }
  
  if (!tutorial.duration || !/^\d+\s+(min|hours?)$/.test(tutorial.duration)) {
    errors.push('duration: required, format "X min" or "X hours"')
  }
  
  if (!Array.isArray(tutorial.tags) || tutorial.tags.length > 10) {
    errors.push('tags: required array, max 10 items')
  }
  
  if (!tutorial.content || typeof tutorial.content !== 'string') {
    errors.push('content: required, must be string')
  }
  
  if (!tutorial.lastUpdated || !/^\d{4}-\d{2}-\d{2}$/.test(tutorial.lastUpdated)) {
    errors.push('lastUpdated: required, must be YYYY-MM-DD')
  }
  
  return errors
}
```

## Error Responses

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Continue |
| 401 | Unauthorized | Check token |
| 404 | Not Found | Verify path |
| 409 | Conflict | Retry with fresh data |
| 422 | Invalid Data | Fix validation errors |
| 429 | Rate Limited | Wait and retry |

### Error Response Format

```json
{
  "message": "Error description",
  "documentation_url": "https://docs.github.com/rest/...",
  "status": "404"
}
```

## Rate Limits

### GitHub API Limits

- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

### Check Rate Limit

```javascript
const response = await fetch('https://api.github.com/rate_limit', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})

const data = await response.json()
console.log(data.rate)
```

## Best Practices

### ID Generation

```javascript
// Timestamp-based
const id = `paper-${Date.now()}`

// UUID-based
const id = `paper-${crypto.randomUUID()}`

// Custom format
const id = `paper-${year}-${month}-${counter}`
```

### Batch Operations

```javascript
async function addMultipleResources(resources, type) {
  // Fetch once
  const fileData = await fetchFile(type)
  const content = JSON.parse(atob(fileData.content))
  
  // Add all resources
  content.resources.push(...resources)
  content.lastUpdated = new Date().toISOString()
  
  // Commit once
  await commitFile(type, content, fileData.sha)
}
```

### Error Handling

```javascript
try {
  await addResource(resource, 'papers')
} catch (error) {
  if (error.status === 409) {
    // Retry with fresh data
    await addResourceWithRetry(resource, 'papers')
  } else if (error.status === 422) {
    // Validation error
    console.error('Invalid data:', error.message)
  } else {
    throw error
  }
}
```

## Testing

### Test Data

```javascript
const testResource = {
  id: 'test-1',
  title: 'Test Resource',
  url: 'https://example.com',
  date: '2026-04-08',
  tags: ['test'],
  type: 'PAPER',
  note: 'Test resource for validation'
}

const errors = validateResource(testResource)
console.log(errors.length === 0 ? 'Valid' : errors)
```

### Mock API

```javascript
class MockAPI {
  constructor() {
    this.data = { resources: [] }
  }
  
  async addResource(resource) {
    this.data.resources.push(resource)
    return { success: true }
  }
  
  async getResources() {
    return this.data.resources
  }
}
```

## Support

For API questions:
- Review this reference document
- Check validation rules
- Test with mock data first
- Verify GitHub token permissions
