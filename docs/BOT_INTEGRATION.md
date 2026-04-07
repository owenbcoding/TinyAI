# Bot Integration Guide

## Overview

This guide explains how to integrate bots and LLM agents with the Tiny AI Resources Platform. The system uses GitHub as a backend, allowing bots to commit JSON files that automatically trigger site rebuilds.

## Integration Architecture

```
Bot/LLM → GitHub API → Commit JSON → GitHub Actions → Build → Deploy → Live Site
```

## Prerequisites

### Required

- GitHub Personal Access Token (PAT) with `repo` scope
- Node.js or Python environment for bot
- Understanding of GitHub API basics

### Repository Configuration

```javascript
const GITHUB_CONFIG = {
  owner: 'TheTinyAIServer',
  repo: 'TheTinyAIServer.github.io',
  branch: 'main',
  dataPath: 'public/data'
}
```

## Authentication

### Creating a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scope: `repo` (full control of private repositories)
4. Copy token and store securely

### Using the Token

```javascript
headers: {
  'Authorization': 'Bearer YOUR_GITHUB_TOKEN',
  'Accept': 'application/vnd.github.v3+json'
}
```

## Data Files

### File Locations

All data files are in `public/data/`:

- `papers.json` - Research papers and publications
- `repos.json` - GitHub repositories and libraries
- `huggingface.json` - Hugging Face models and datasets
- `tutorials.json` - Learning tutorials and guides

### File Structure

Each JSON file follows this structure:

```json
{
  "lastUpdated": "2026-04-08T12:00:00Z",
  "resources": [
    {
      "id": "unique-id",
      "title": "Resource Title",
      ...
    }
  ]
}
```

## Adding Resources

### Step-by-Step Process

1. Fetch current JSON file from GitHub
2. Decode base64 content
3. Parse JSON
4. Add new resource to array
5. Encode updated JSON to base64
6. Commit back to GitHub

### Resource Schema

```json
{
  "id": "paper-1234567890",
  "title": "Attention is All You Need",
  "url": "https://arxiv.org/abs/1706.03762",
  "date": "2017-06-12",
  "tags": ["transformer", "nlp", "attention"],
  "type": "PAPER",
  "note": "Foundational transformer architecture paper",
  "sources": [
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
}
```

### Field Descriptions

- `id` - Unique identifier (string, required)
- `title` - Display title (string, required, max 200 chars)
- `url` - Primary URL (string, required, valid URL)
- `date` - Publication date (string, required, YYYY-MM-DD format)
- `tags` - Category tags (array, max 10 tags)
- `type` - Resource type (PAPER | LIBS | HUB | COMMUNITY)
- `note` - Description (string, optional, max 500 chars)
- `sources` - Additional links (array, optional, max 10 sources)

### Source Types

- `arxiv` - arXiv papers
- `github` - GitHub repositories
- `huggingface` - Hugging Face models/datasets
- `website` - General websites
- `paper` - PDF papers
- `code` - Source code
- `demo` - Live demos
- `docs` - Documentation

## Adding Tutorials

### Tutorial Schema

```json
{
  "id": "tutorial-1234567890",
  "title": "Getting Started with Transformers",
  "description": "Learn the basics of transformer architecture",
  "difficulty": "beginner",
  "duration": "15 min",
  "tags": ["transformer", "nlp", "beginner"],
  "content": "# Tutorial Content\n\nMarkdown content here...",
  "author": "Bot Name",
  "lastUpdated": "2026-04-08"
}
```

### Field Descriptions

- `id` - Unique identifier (string, required)
- `title` - Tutorial title (string, required, max 200 chars)
- `description` - Short summary (string, required, max 500 chars)
- `difficulty` - Level (beginner | intermediate | advanced)
- `duration` - Time estimate (string, e.g., "15 min", "2 hours")
- `tags` - Category tags (array, max 10 tags)
- `content` - Full tutorial (string, markdown format)
- `author` - Creator name (string, optional)
- `lastUpdated` - Last update date (string, YYYY-MM-DD)

## Implementation Examples

### JavaScript Implementation

```javascript
class TinyAIBot {
  constructor(token) {
    this.token = token
    this.owner = 'TheTinyAIServer'
    this.repo = 'TheTinyAIServer.github.io'
    this.baseUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/public/data`
  }

  async addResource(resource, type) {
    const filename = `${type}.json`
    const url = `${this.baseUrl}/${filename}`
    
    // Fetch current file
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.statusText}`)
    }
    
    const fileData = await response.json()
    const currentContent = JSON.parse(atob(fileData.content))
    
    // Add new resource
    currentContent.resources.push(resource)
    currentContent.lastUpdated = new Date().toISOString()
    
    // Commit back
    const commitResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add ${type}: ${resource.title}`,
        content: btoa(JSON.stringify(currentContent, null, 2)),
        sha: fileData.sha,
        branch: 'main'
      })
    })
    
    if (!commitResponse.ok) {
      throw new Error(`Failed to commit: ${commitResponse.statusText}`)
    }
    
    return { success: true, resource }
  }

  async addTutorial(tutorial) {
    return this.addResource(tutorial, 'tutorials')
  }
}

// Usage
const bot = new TinyAIBot('YOUR_GITHUB_TOKEN')

const newPaper = {
  id: `paper-${Date.now()}`,
  title: 'Attention is All You Need',
  url: 'https://arxiv.org/abs/1706.03762',
  date: '2017-06-12',
  tags: ['transformer', 'nlp'],
  type: 'PAPER',
  note: 'Foundational transformer paper',
  sources: [
    {
      label: 'arXiv',
      url: 'https://arxiv.org/abs/1706.03762',
      type: 'arxiv'
    }
  ]
}

await bot.addResource(newPaper, 'papers')
```


### Python Implementation

```python
import requests
import json
import base64
from datetime import datetime
import time

class TinyAIBot:
    def __init__(self, token):
        self.token = token
        self.owner = 'TheTinyAIServer'
        self.repo = 'TheTinyAIServer.github.io'
        self.base_url = f'https://api.github.com/repos/{self.owner}/{self.repo}/contents/public/data'
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Accept': 'application/vnd.github.v3+json'
        }
    
    def add_resource(self, resource, resource_type):
        filename = f'{resource_type}.json'
        url = f'{self.base_url}/{filename}'
        
        # Fetch current file
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        file_data = response.json()
        current_content = json.loads(base64.b64decode(file_data['content']))
        
        # Add new resource
        current_content['resources'].append(resource)
        current_content['lastUpdated'] = datetime.utcnow().isoformat() + 'Z'
        
        # Commit back
        new_content = json.dumps(current_content, indent=2)
        commit_response = requests.put(url, headers=self.headers, json={
            'message': f"Add {resource_type}: {resource['title']}",
            'content': base64.b64encode(new_content.encode()).decode(),
            'sha': file_data['sha'],
            'branch': 'main'
        })
        
        commit_response.raise_for_status()
        return {'success': True, 'resource': resource}
    
    def add_tutorial(self, tutorial):
        return self.add_resource(tutorial, 'tutorials')

# Usage
bot = TinyAIBot('YOUR_GITHUB_TOKEN')

new_paper = {
    'id': f'paper-{int(time.time())}',
    'title': 'Attention is All You Need',
    'url': 'https://arxiv.org/abs/1706.03762',
    'date': '2017-06-12',
    'tags': ['transformer', 'nlp'],
    'type': 'PAPER',
    'note': 'Foundational transformer paper',
    'sources': [
        {
            'label': 'arXiv',
            'url': 'https://arxiv.org/abs/1706.03762',
            'type': 'arxiv'
        }
    ]
}

bot.add_resource(new_paper, 'papers')
```

## Discord Bot Example

### Setup

```bash
npm install discord.js
```

### Implementation

```javascript
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js')
const TinyAIBot = require('./tinyai-bot')

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

const tinyAI = new TinyAIBot(process.env.GITHUB_TOKEN)

// Register slash command
const addPaperCommand = new SlashCommandBuilder()
  .setName('add-paper')
  .setDescription('Add a research paper to Tiny AI')
  .addStringOption(option =>
    option.setName('url')
      .setDescription('Paper URL (arXiv, etc.)')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('title')
      .setDescription('Paper title')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('tags')
      .setDescription('Comma-separated tags')
      .setRequired(false))

// Handle command
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return
  
  if (interaction.commandName === 'add-paper') {
    await interaction.deferReply()
    
    const url = interaction.options.getString('url')
    const title = interaction.options.getString('title')
    const tags = interaction.options.getString('tags')?.split(',').map(t => t.trim()) || []
    
    const paper = {
      id: `paper-${Date.now()}`,
      title: title,
      url: url,
      date: new Date().toISOString().split('T')[0],
      tags: tags,
      type: 'PAPER',
      sources: [
        {
          label: 'Paper',
          url: url,
          type: 'arxiv'
        }
      ]
    }
    
    try {
      await tinyAI.addResource(paper, 'papers')
      await interaction.editReply(`Added paper: ${title}`)
    } catch (error) {
      await interaction.editReply(`Error: ${error.message}`)
    }
  }
})

client.login(process.env.DISCORD_TOKEN)
```

## LLM Agent Integration

### OpenAI Function Calling

```python
import openai
from tinyai_bot import TinyAIBot

bot = TinyAIBot('YOUR_GITHUB_TOKEN')

tools = [
    {
        "type": "function",
        "function": {
            "name": "add_resource",
            "description": "Add a new resource to Tiny AI platform",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Resource title"
                    },
                    "url": {
                        "type": "string",
                        "description": "Resource URL"
                    },
                    "type": {
                        "type": "string",
                        "enum": ["PAPER", "LIBS", "HUB", "COMMUNITY"],
                        "description": "Resource type"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Category tags"
                    },
                    "note": {
                        "type": "string",
                        "description": "Optional description"
                    }
                },
                "required": ["title", "url", "type"]
            }
        }
    }
]

def handle_function_call(function_name, arguments):
    if function_name == "add_resource":
        resource = {
            "id": f"{arguments['type'].lower()}-{int(time.time())}",
            "title": arguments['title'],
            "url": arguments['url'],
            "date": datetime.now().strftime("%Y-%m-%d"),
            "tags": arguments.get('tags', []),
            "type": arguments['type'],
            "note": arguments.get('note', ''),
            "sources": [
                {
                    "label": "Link",
                    "url": arguments['url'],
                    "type": "website"
                }
            ]
        }
        
        result = bot.add_resource(resource, f"{arguments['type'].lower()}s")
        return f"Added {arguments['title']} to {arguments['type']}"

# Use in conversation
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Add the Attention is All You Need paper"}
    ],
    tools=tools
)

if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        result = handle_function_call(
            tool_call.function.name,
            json.loads(tool_call.function.arguments)
        )
        print(result)
```

## Error Handling

### Common Errors

**401 Unauthorized**
- Invalid or expired GitHub token
- Token missing required scope

**404 Not Found**
- File does not exist
- Incorrect repository or path

**409 Conflict**
- File was modified since last fetch
- SHA mismatch

**422 Unprocessable Entity**
- Invalid JSON format
- Schema validation failed

### Retry Logic

```javascript
async function addResourceWithRetry(bot, resource, type, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await bot.addResource(resource, type)
    } catch (error) {
      if (error.status === 409 && i < maxRetries - 1) {
        // Conflict - retry with fresh data
        console.log(`Conflict detected, retrying (${i + 1}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
}
```

## Validation

### Resource Validation

```javascript
function validateResource(resource) {
  const errors = []
  
  if (!resource.id || typeof resource.id !== 'string') {
    errors.push('id is required and must be a string')
  }
  
  if (!resource.title || resource.title.length > 200) {
    errors.push('title is required and must be max 200 characters')
  }
  
  if (!resource.url || !isValidUrl(resource.url)) {
    errors.push('url is required and must be a valid URL')
  }
  
  if (!resource.date || !isValidDate(resource.date)) {
    errors.push('date is required and must be YYYY-MM-DD format')
  }
  
  if (!['PAPER', 'LIBS', 'HUB', 'COMMUNITY'].includes(resource.type)) {
    errors.push('type must be PAPER, LIBS, HUB, or COMMUNITY')
  }
  
  if (resource.tags && (!Array.isArray(resource.tags) || resource.tags.length > 10)) {
    errors.push('tags must be an array with max 10 items')
  }
  
  if (resource.sources && resource.sources.length > 10) {
    errors.push('sources must have max 10 items')
  }
  
  return errors
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function isValidDate(string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(string)
}
```

## Rate Limiting

### GitHub API Limits

- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

### Best Practices

```javascript
class RateLimitedBot extends TinyAIBot {
  constructor(token) {
    super(token)
    this.requestQueue = []
    this.processing = false
  }
  
  async addResource(resource, type) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ resource, type, resolve, reject })
      this.processQueue()
    })
  }
  
  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) return
    
    this.processing = true
    
    while (this.requestQueue.length > 0) {
      const { resource, type, resolve, reject } = this.requestQueue.shift()
      
      try {
        const result = await super.addResource(resource, type)
        resolve(result)
      } catch (error) {
        reject(error)
      }
      
      // Wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    this.processing = false
  }
}
```

## Testing

### Test Environment

Use a test repository before production:

```javascript
const testBot = new TinyAIBot('YOUR_TOKEN')
testBot.owner = 'your-username'
testBot.repo = 'test-repo'
```

### Unit Tests

```javascript
describe('TinyAIBot', () => {
  it('should add a resource', async () => {
    const bot = new TinyAIBot(process.env.GITHUB_TOKEN)
    
    const resource = {
      id: 'test-1',
      title: 'Test Resource',
      url: 'https://example.com',
      date: '2026-04-08',
      tags: ['test'],
      type: 'PAPER'
    }
    
    const result = await bot.addResource(resource, 'papers')
    expect(result.success).toBe(true)
  })
})
```

## Security Best Practices

1. Never commit tokens to version control
2. Use environment variables for sensitive data
3. Validate all input before committing
4. Use GitHub Secrets for CI/CD
5. Enable branch protection on main branch
6. Review all bot commits regularly
7. Use minimal token scopes
8. Rotate tokens periodically

## Monitoring

### Deployment Status

Check GitHub Actions tab for build status after each commit.

### Logging

```javascript
class LoggingBot extends TinyAIBot {
  async addResource(resource, type) {
    console.log(`[${new Date().toISOString()}] Adding ${type}: ${resource.title}`)
    
    try {
      const result = await super.addResource(resource, type)
      console.log(`[${new Date().toISOString()}] Success: ${resource.id}`)
      return result
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error: ${error.message}`)
      throw error
    }
  }
}
```

## Support

For issues or questions:
- Check GitHub Actions logs for deployment errors
- Verify token permissions
- Ensure JSON schema compliance
- Review error messages carefully
