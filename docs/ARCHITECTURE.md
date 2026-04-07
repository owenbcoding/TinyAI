# Architecture Documentation

## System Overview

Tiny AI Resources Platform is a static Vue.js application hosted on GitHub Pages with a bot-driven content management system. The architecture is designed for simplicity, performance, and automated content updates.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         GitHub Repository                    │
│                                                              │
│  ┌──────────────┐         ┌─────────────┐                  │
│  │ public/data/ │────────▶│   GitHub    │                  │
│  │  *.json      │         │   Actions   │                  │
│  └──────────────┘         └─────────────┘                  │
│         ▲                        │                          │
│         │                        ▼                          │
│    ┌────────┐            ┌──────────────┐                  │
│    │  Bot   │            │ Build & Test │                  │
│    │ Commit │            │  npm build   │                  │
│    └────────┘            └──────────────┘                  │
│                                  │                          │
│                                  ▼                          │
│                          ┌──────────────┐                  │
│                          │ Deploy dist/ │                  │
│                          │ to GH Pages  │                  │
│                          └──────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │   GitHub Pages CDN       │
                    │ TheTinyAIServer.github.io│
                    └──────────────────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │   End Users  │
                          └──────────────┘
```

## Frontend Architecture

### Component Structure

```
App.vue (Root)
├── AppHeader.vue (Navigation + Theme Toggle)
├── Router View
│   ├── Home.vue (Resources)
│   │   ├── ResourceTabs.vue
│   │   └── ResourceList.vue
│   │       └── ResourceCard.vue (Multiple)
│   ├── Learn.vue (Tutorials)
│   │   └── Tutorial Cards / Content View
│   ├── Bot.vue (AI Chat)
│   │   ├── Model Selector Dropdown
│   │   ├── Message List
│   │   └── Input Container
│   └── About.vue
└── AppFooter.vue (Conditional)
```

### State Management (Pinia)

#### Resources Store (`stores/resources.js`)
- Manages resource data (papers, repos, Hugging Face models)
- Loads data from JSON files via ResourceService
- Provides filtering and search capabilities
- Handles loading and error states

#### Tutorials Store (`stores/tutorials.js`)
- Manages tutorial data
- Loads from `public/data/tutorials.json`
- Handles tutorial selection and content display

#### Bot Store (`stores/bot.js`)
- Manages chat messages and conversation state
- Handles model selection
- Integrates with Hugging Face API
- Manages chat history

#### Theme Store (`stores/theme.js`)
- Manages dark/light theme state
- Persists theme preference to localStorage
- Applies theme classes to document root

### Service Layer

#### ResourceService (`services/resourceService.js`)

Plugin-based data loading system supporting multiple sources:

```javascript
class ResourceService {
  constructor() {
    this.loaders = {
      static: new StaticLoader(),
      markdown: new MarkdownLoader(),
      json: new JSONLoader(),
      api: new APILoader()
    }
  }
}
```

**Loaders:**
- **StaticLoader** - Hardcoded data (development/testing)
- **MarkdownLoader** - Parse markdown files (legacy support)
- **JSONLoader** - Load from JSON files (primary method)
- **APILoader** - Fetch from external APIs (future enhancement)

**Current Configuration:**
- Default loader: JSONLoader
- Data source: `public/data/*.json`
- Fallback: Static data if JSON fails

### Routing

Vue Router with history mode:

```javascript
routes: [
  { path: '/', component: Home },
  { path: '/learn', component: Learn },
  { path: '/bot', component: Bot },
  { path: '/about', component: About }
]
```

## Data Flow

### Resource Loading Flow

```
1. Component Mount
   └─▶ Store Action (loadResources)
       └─▶ ResourceService.loadResources(type)
           └─▶ JSONLoader.load(path)
               └─▶ fetch('public/data/papers.json')
                   └─▶ Parse JSON
                       └─▶ Validate Schema
                           └─▶ Return to Store
                               └─▶ Update State
                                   └─▶ Component Re-renders
```

### Bot Content Update Flow

```
1. Bot/LLM Decision
   └─▶ GitHub API Request
       └─▶ Fetch current JSON file
           └─▶ Decode base64 content
               └─▶ Parse JSON
                   └─▶ Add new resource
                       └─▶ Encode to base64
                           └─▶ Commit to GitHub
                               └─▶ GitHub Actions Trigger
                                   └─▶ npm ci
                                       └─▶ npm run build
                                           └─▶ Deploy dist/
                                               └─▶ Live Site Updates
```

## Data Schema

### Resource Schema

```json
{
  "id": "string (unique identifier)",
  "title": "string (display title)",
  "url": "string (primary URL)",
  "date": "string (YYYY-MM-DD)",
  "tags": ["array", "of", "strings"],
  "type": "PAPER | LIBS | HUB | COMMUNITY",
  "note": "string (optional description)",
  "sources": [
    {
      "label": "string (display name)",
      "url": "string (full URL)",
      "type": "arxiv | github | huggingface | website | paper | code | demo | docs"
    }
  ]
}
```

### Tutorial Schema

```json
{
  "id": "string (unique identifier)",
  "title": "string (display title)",
  "description": "string (short summary)",
  "difficulty": "beginner | intermediate | advanced",
  "duration": "string (e.g., '15 min')",
  "tags": ["array", "of", "strings"],
  "content": "string (markdown content)",
  "author": "string (optional)",
  "lastUpdated": "string (YYYY-MM-DD)"
}
```

## Build Process

### Development Build

```bash
npm run dev
```

- Vite dev server with HMR
- Port 5173 (default)
- Source maps enabled
- Fast refresh for Vue components

### Production Build

```bash
npm run build
```

**Build Steps:**
1. Clean `dist/` directory
2. Compile Vue components to JavaScript
3. Bundle and minify JavaScript
4. Process and minify CSS
5. Optimize assets (images, fonts)
6. Copy `public/` contents to `dist/`
7. Generate index.html with asset links

**Output Structure:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-assets]
└── data/
    ├── papers.json
    ├── repos.json
    ├── huggingface.json
    └── tutorials.json
```

### Build Configuration

**vite.config.js:**
```javascript
{
  base: './',              // Relative paths for GitHub Pages
  build: {
    outDir: 'dist',        // Output directory
    assetsDir: 'assets',   // Assets subdirectory
    emptyOutDir: true      // Clean before build
  }
}
```

## Deployment Pipeline

### GitHub Actions Workflow

**Trigger:** Push to main branch or manual dispatch

**Jobs:**

1. **Build Job**
   - Checkout repository
   - Setup Node.js 20
   - Install dependencies (`npm ci`)
   - Run build (`npm run build`)
   - Upload `dist/` as artifact

2. **Deploy Job**
   - Download build artifact
   - Deploy to GitHub Pages
   - Update deployment URL

**Permissions:**
- `contents: read` - Read repository files
- `pages: write` - Write to GitHub Pages
- `id-token: write` - OIDC token for deployment

## Performance Considerations

### Code Splitting

Vite automatically splits code by route:
- Home page bundle
- Learn page bundle
- Bot page bundle
- Shared vendor bundle

### Asset Optimization

- JavaScript minification with Terser
- CSS minification with cssnano
- Tree shaking for unused code
- Dynamic imports for heavy components

### Caching Strategy

GitHub Pages CDN caching:
- Static assets (JS/CSS): 1 year cache
- HTML files: No cache
- JSON data files: No cache

### Loading Performance

- Lazy load routes
- Lazy load heavy dependencies (marked.js)
- Minimal initial bundle size
- Progressive enhancement

## Security Considerations

### Content Security

- All data validated against schema
- XSS prevention via Vue's template escaping
- No eval() or dangerous HTML rendering
- Markdown sanitization in tutorials

### API Security

- Bot authentication via GitHub PAT
- Tokens stored in GitHub Secrets
- No client-side token exposure
- Rate limiting via GitHub API

### Deployment Security

- HTTPS enforced by GitHub Pages
- No server-side code execution
- Static file serving only
- Branch protection for main branch

## Scalability

### Current Limits

- JSON file size: Recommended < 1MB per file
- Total resources: ~1000 per type (papers, repos, etc.)
- Tutorials: ~100 tutorials
- Build time: ~1-2 minutes

### Scaling Strategies

If limits are reached:

1. **Pagination** - Split JSON files by date/category
2. **API Backend** - Move to dedicated API server
3. **Database** - Use external database with API
4. **CDN** - Use external CDN for large assets

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android

## Development Guidelines

### Code Style

- Vue 3 Composition API preferred
- ES6+ JavaScript
- CSS custom properties for theming
- BEM-like naming for CSS classes

### Component Guidelines

- Single responsibility principle
- Props for data input
- Events for data output
- Composables for shared logic

### State Management

- Use Pinia stores for global state
- Local state for component-specific data
- Computed properties for derived state
- Actions for async operations

## Future Enhancements

### Planned Features

- Search functionality across all resources
- Advanced filtering (date range, multiple tags)
- User accounts and favorites
- Resource ratings and comments
- RSS feed generation
- API rate limiting and caching

### Technical Improvements

- Service worker for offline support
- IndexedDB for local caching
- WebSocket for real-time updates
- GraphQL API layer
- Automated testing suite
- Performance monitoring
