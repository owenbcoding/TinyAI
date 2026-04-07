# Tiny AI Resources Platform

A modern Vue.js-based platform for curating and sharing AI/ML resources, papers, repositories, and tutorials. Built with GitHub Pages and designed for seamless bot integration.

## Overview

This platform provides a clean, modern interface for browsing AI resources with support for automated content updates via bots and LLM agents. The architecture uses GitHub as a backend, allowing bots to commit JSON files that automatically trigger rebuilds and deployments.

## Features

- Modern Vue.js 3 application with Vite build system
- Resource management with multi-source link support
- Tutorial system with markdown rendering
- AI chat interface with Hugging Face model integration (work in progress)
- Dark mode with clean GitHub-style design
- Automated deployment via GitHub Actions
- Bot-friendly API for content management

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

The project automatically deploys to GitHub Pages on every push to the main branch. See `docs/DEPLOYMENT.md` for detailed setup instructions.

## Project Structure

```
.
├── src/
│   ├── components/       # Vue components
│   │   ├── layout/       # Header, footer components
│   │   └── resources/    # Resource cards, lists, tabs
│   ├── views/            # Page views (Home, Learn, Bot, About)
│   ├── stores/           # Pinia state management
│   ├── services/         # API and resource services
│   ├── router/           # Vue Router configuration
│   └── assets/           # Styles and static assets
├── public/
│   └── data/             # JSON data files (bot updates here)
│       ├── papers.json
│       ├── repos.json
│       ├── huggingface.json
│       └── tutorials.json
├── docs/                 # Documentation
└── dist/                 # Build output (auto-generated)
```

## Data Management

Resources and tutorials are stored as JSON files in `public/data/`. Bots and LLM agents can update these files via the GitHub API, triggering automatic rebuilds.

### Resource Types

- **PAPER** - Research papers and academic publications
- **LIBS** - Libraries, frameworks, and tools
- **HUB** - Hugging Face models and datasets
- **COMMUNITY** - Community resources and guides

### Multi-Source Support

Each resource can have multiple sources (arXiv, GitHub, Hugging Face, etc.) displayed in a dropdown menu for easy access.

## Bot Integration

The platform is designed for automated content management. Bots can add resources and tutorials by committing to JSON files in `public/data/`.

See `docs/BOT_INTEGRATION.md` for implementation details and code examples.

## Documentation

- `docs/ARCHITECTURE.md` - Project architecture and design decisions
- `docs/BOT_INTEGRATION.md` - Bot and LLM integration guide
- `docs/DEPLOYMENT.md` - Deployment setup and configuration
- `docs/API_REFERENCE.md` - Complete API reference with schemas

## Technology Stack

- Vue.js 3 - Progressive JavaScript framework
- Vite - Next-generation frontend tooling
- Pinia - State management
- Vue Router - Client-side routing
- Marked - Markdown parsing for tutorials
- GitHub Actions - CI/CD pipeline
- GitHub Pages - Static site hosting

## Current Status

- Resources Page: Fully functional
- Learn Page: Fully functional
- About Page: Fully functional
- Chat Page: Work in progress, not yet ready for use

## Color Palette

- Primary Purple: `#433972`
- Accent Yellow: `#F5DA99`
- Accent Orange: `#FB8C65`
- Dark Background: `#0d1117`
- Dark Cards: `#161b22`

## Contributing

This project is designed to be updated primarily through bot integration. For manual contributions, please ensure all changes follow the existing code style and architecture.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.
