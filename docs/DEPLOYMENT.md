# Deployment Guide

## Overview

This project deploys automatically to GitHub Pages using GitHub Actions. Every push to the main branch triggers a build and deployment process.

## Initial Setup

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TheTinyAIServer/TheTinyAIServer.github.io.git
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Navigate to repository on GitHub
2. Go to Settings → Pages
3. Under "Source", select "GitHub Actions"
4. Save the configuration

### Step 3: Wait for Deployment

The first deployment will start automatically. Monitor progress in the Actions tab.

## Deployment Process

### Automatic Deployment

Every push to main branch triggers:

1. Checkout repository
2. Setup Node.js 20
3. Install dependencies with `npm ci`
4. Build project with `npm run build`
5. Upload dist folder as artifact
6. Deploy to GitHub Pages

### Manual Deployment

Trigger manually from GitHub Actions tab:

1. Go to Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select main branch
5. Click "Run workflow" button

## Build Configuration

### Vite Configuration

File: `vite.config.js`

```javascript
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})
```

Key settings:
- `base: './'` - Relative paths for GitHub Pages
- `outDir: 'dist'` - Build output directory
- `emptyOutDir: true` - Clean before each build

### Package Scripts

File: `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Local Testing

### Development Server

```bash
npm install
npm run dev
```

Access at: http://localhost:5173

### Production Build

```bash
npm run build
```

Output in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

Access at: http://localhost:4173

## Build Output

### Directory Structure

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

### File Copying

Files in `public/` are copied to `dist/` during build:

```
public/data/*.json → dist/data/*.json
```

## GitHub Actions Workflow

### File Location

`.github/workflows/deploy.yml`

### Workflow Configuration

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Permissions

- `contents: read` - Read repository files
- `pages: write` - Write to GitHub Pages
- `id-token: write` - OIDC authentication

### Concurrency

Only one deployment runs at a time. New deployments cancel in-progress ones.

## Deployment Timeline

Typical deployment takes 2-3 minutes:

1. Trigger: ~10 seconds
2. Checkout: ~5 seconds
3. Setup Node: ~10 seconds
4. Install dependencies: ~30 seconds
5. Build: ~60 seconds
6. Upload artifact: ~10 seconds
7. Deploy: ~30 seconds

## Monitoring Deployments

### GitHub Actions Tab

View all workflow runs:
1. Go to repository
2. Click Actions tab
3. View workflow runs and logs

### Deployment Status

Check deployment URL in:
- Actions workflow summary
- Settings → Pages

### Build Logs

Click on workflow run to view:
- Build output
- Error messages
- Deployment status

## Bot Integration

### Update Workflow

When bot commits to `public/data/*.json`:

1. Bot commits JSON file
2. GitHub Actions detects push
3. Workflow starts automatically
4. Build includes updated JSON
5. Deploy to GitHub Pages
6. Live site updates

### Commit Format

Recommended commit message format:

```
Add paper: [Title]
Add tutorial: [Title]
Update resources: [Description]
```

## Troubleshooting

### Build Fails

Check Actions log for errors:

```bash
# Common issues:
- Syntax errors in code
- Missing dependencies
- Invalid JSON in data files
- Node version mismatch
```

Fix and push again to retry.

### 404 Errors

Verify configuration:
- Base path in vite.config.js is `'./'`
- Data files in `public/data/` not `src/data/`
- Router uses correct history mode

### Data Not Loading

Check file paths:

```javascript
// Correct (relative to dist)
fetch('./data/papers.json')

// Incorrect (absolute path)
fetch('/data/papers.json')
```

### Changes Not Visible

Clear browser cache:
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

Or wait for CDN cache to expire (usually 5-10 minutes).

### Deployment Stuck

Cancel and retry:
1. Go to Actions tab
2. Click on stuck workflow
3. Click "Cancel workflow"
4. Push new commit or trigger manually

## Environment Variables

### GitHub Secrets

For bot authentication:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secret:
   - Name: `BOT_GITHUB_TOKEN`
   - Value: Your GitHub PAT

### Using Secrets

In workflow file:

```yaml
- name: Bot Action
  env:
    GITHUB_TOKEN: ${{ secrets.BOT_GITHUB_TOKEN }}
  run: node scripts/bot-action.js
```

## Custom Domain

### Setup

1. Add CNAME file to `public/` folder:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: TheTinyAIServer.github.io
   ```

3. Enable HTTPS in Settings → Pages

### Verification

Wait for DNS propagation (up to 24 hours), then verify:

```bash
dig yourdomain.com
```

## Performance

### Build Optimization

Vite automatically:
- Minifies JavaScript and CSS
- Splits code by route
- Optimizes assets
- Removes unused code

### Caching

GitHub Pages CDN caching:
- Static assets (JS/CSS): 1 year
- HTML files: No cache
- JSON data: No cache

### CDN

GitHub Pages uses Fastly CDN for global distribution.

## Rollback

### Revert to Previous Version

```bash
# Find working commit
git log

# Revert to that commit
git revert <commit-hash>

# Push to trigger deployment
git push origin main
```

### Manual Rollback

If automatic deployment fails:

```bash
# Build locally
npm run build

# Deploy with gh-pages
npm install -g gh-pages
gh-pages -d dist
```

## Security

### Best Practices

1. Never commit tokens or secrets
2. Use GitHub Secrets for sensitive data
3. Enable branch protection on main
4. Review bot commits regularly
5. Use minimal token permissions
6. Rotate tokens periodically

### Branch Protection

Recommended settings:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Monitoring

- Check Actions tab weekly
- Review deployment logs
- Monitor build times
- Check for failed deployments

## Access URLs

After deployment, site is available at:

```
https://TheTinyAIServer.github.io/
```

API endpoints (data files):

```
https://TheTinyAIServer.github.io/data/papers.json
https://TheTinyAIServer.github.io/data/repos.json
https://TheTinyAIServer.github.io/data/huggingface.json
https://TheTinyAIServer.github.io/data/tutorials.json
```

## Support

For deployment issues:
- Check GitHub Actions logs
- Review build output
- Verify configuration files
- Test build locally first
