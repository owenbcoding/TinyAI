# Quick Start Guide

## Get Started in 5 Minutes

This guide will get you up and running with the Tiny AI Resources Platform quickly.

## Prerequisites

- Node.js 18 or higher (Node.js 24 recommended)
- npm or yarn
- Git
- GitHub account

## Local Development

### 1. Clone and Install

```bash
git clone https://github.com/TheTinyAIServer/TheTinyAIServer.github.io.git
cd TheTinyAIServer.github.io
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 3. Make Changes

Edit files in `src/` folder:
- `src/views/` - Page components
- `src/components/` - Reusable components
- `src/stores/` - State management
- `src/assets/styles/` - Styling

Changes will hot-reload automatically.

## Deploy to GitHub Pages

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to repository Settings
2. Navigate to Pages section
3. Under Source, select "GitHub Actions"
4. Save

### 3. Wait for Deployment

Check Actions tab for deployment progress. Site will be live at:
```
https://TheTinyAIServer.github.io/
```

## Add Content Manually

### Add a Resource

Edit `public/data/papers.json`:

```json
{
  "lastUpdated": "2026-04-08T12:00:00Z",
  "resources": [
    {
      "id": "paper-1",
      "title": "Your Paper Title",
      "url": "https://arxiv.org/abs/1234.5678",
      "date": "2024-01-15",
      "tags": ["nlp", "transformer"],
      "type": "PAPER",
      "note": "Brief description",
      "sources": [
        {
          "label": "arXiv",
          "url": "https://arxiv.org/abs/1234.5678",
          "type": "arxiv"
        }
      ]
    }
  ]
}
```

Commit and push to deploy.

### Add a Tutorial

Edit `public/data/tutorials.json`:

```json
{
  "lastUpdated": "2026-04-08T12:00:00Z",
  "resources": [
    {
      "id": "tutorial-1",
      "title": "Your Tutorial Title",
      "description": "Short description",
      "difficulty": "beginner",
      "duration": "15 min",
      "tags": ["tutorial", "beginner"],
      "content": "# Tutorial\n\nYour markdown content here...",
      "lastUpdated": "2026-04-08"
    }
  ]
}
```

## Bot Integration

### 1. Create GitHub Token

1. Go to GitHub Settings → Developer settings
2. Personal access tokens → Generate new token
3. Select `repo` scope
4. Copy token

### 2. Use Bot Helper

JavaScript example:

```javascript
class TinyAIBot {
  constructor(token) {
    this.token = token
    this.baseUrl = 'https://api.github.com/repos/TheTinyAIServer/TheTinyAIServer.github.io/contents/public/data'
  }

  async addResource(resource, type) {
    const url = `${this.baseUrl}/${type}.json`
    
    // Fetch current file
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    const fileData = await response.json()
    const content = JSON.parse(atob(fileData.content))
    
    // Add resource
    content.resources.push(resource)
    content.lastUpdated = new Date().toISOString()
    
    // Commit
    await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add ${type}: ${resource.title}`,
        content: btoa(JSON.stringify(content, null, 2)),
        sha: fileData.sha,
        branch: 'main'
      })
    })
  }
}

// Usage
const bot = new TinyAIBot('YOUR_GITHUB_TOKEN')
await bot.addResource({
  id: `paper-${Date.now()}`,
  title: 'Paper Title',
  url: 'https://arxiv.org/abs/1234.5678',
  date: '2024-01-15',
  tags: ['nlp'],
  type: 'PAPER'
}, 'papers')
```

## Project Structure

```
.
├── src/
│   ├── views/              # Pages (Home, Learn, Bot, About)
│   ├── components/         # Vue components
│   ├── stores/             # Pinia state management
│   ├── services/           # API services
│   ├── router/             # Vue Router
│   └── assets/             # Styles and assets
├── public/
│   └── data/               # JSON data files
│       ├── papers.json
│       ├── repos.json
│       ├── huggingface.json
│       └── tutorials.json
├── docs/                   # Documentation
└── dist/                   # Build output (auto-generated)
```

## Common Tasks

### Build for Production

```bash
npm run build
```

Output in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Update Dependencies

```bash
npm update
```

### Check for Issues

```bash
npm audit
```

## Resource Types

- `PAPER` - Research papers (papers.json)
- `LIBS` - Libraries and tools (repos.json)
- `HUB` - Hugging Face models (huggingface.json)
- `COMMUNITY` - Community resources (any file)

## Difficulty Levels

For tutorials:
- `beginner` - New to the topic
- `intermediate` - Some experience
- `advanced` - Expert level

## Next Steps

- Read `docs/ARCHITECTURE.md` for system design
- Read `docs/BOT_INTEGRATION.md` for bot setup
- Read `docs/API_REFERENCE.md` for complete API docs
- Read `docs/DEPLOYMENT.md` for deployment details

## Troubleshooting

### Build Fails

Check for:
- Syntax errors in code
- Invalid JSON in data files
- Missing dependencies

Fix: `npm install` and retry

### Site Not Loading

Check:
- GitHub Pages is enabled
- Deployment completed successfully
- Browser cache (hard refresh)

### Data Not Showing

Check:
- JSON files in `public/data/`
- Valid JSON format
- Correct file paths

## Support

- Check documentation in `docs/` folder
- Review GitHub Actions logs
- Test locally before deploying
- Validate JSON before committing

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push origin main     # Push to GitHub

# Dependencies
npm install              # Install dependencies
npm update               # Update dependencies
npm audit                # Check for vulnerabilities
npm audit fix            # Fix vulnerabilities
```

## Configuration Files

- `vite.config.js` - Build configuration
- `package.json` - Dependencies and scripts
- `.github/workflows/deploy.yml` - Deployment workflow
- `src/router/index.js` - Route configuration

## Data File Format

All data files follow this structure:

```json
{
  "lastUpdated": "ISO 8601 timestamp",
  "resources": [
    { "id": "...", "title": "...", ... }
  ]
}
```

Update `lastUpdated` when modifying resources.

## Tips

1. Test locally before pushing
2. Validate JSON before committing
3. Use meaningful commit messages
4. Check Actions tab after pushing
5. Clear browser cache if changes not visible
6. Keep data files under 1MB each
7. Use descriptive resource IDs
8. Add multiple sources when available
9. Tag resources appropriately
10. Write clear tutorial content

## Getting Help

- Documentation: `docs/` folder
- GitHub Issues: Report bugs and request features
- Actions Logs: Check deployment errors
- Local Testing: Run `npm run dev` to debug
