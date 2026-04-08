<template>
  <div id="app">
    <AppHeader @theme-transition="handleThemeTransition" />
    <main>
      <router-view />
    </main>
    <footer v-if="!isChatPage" class="app-footer">
      <p>© 2026 Tiny AI. All rights reserved.</p>
    </footer>
    
    <!-- Theme transition overlay - shows new theme content -->
    <div 
      ref="transitionOverlay" 
      class="theme-transition-overlay"
      :data-theme="overlayTheme"
    >
      <AppHeader />
      <main>
        <router-view />
      </main>
      <footer v-if="!isChatPage" class="app-footer">
        <p>© 2026 Tiny AI. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from './stores/theme'
import AppHeader from './components/layout/AppHeader.vue'

const route = useRoute()
const themeStore = useThemeStore()
const transitionOverlay = ref(null)
const overlayTheme = ref('dark')

const isChatPage = computed(() => route.path === '/bot')

function handleThemeTransition({ x, y, isDark }) {
  if (!transitionOverlay.value) return
  
  // Set overlay to target theme
  overlayTheme.value = isDark ? 'dark' : 'light'
  
  // Calculate radius to cover entire screen
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )
  
  // Show overlay with clip-path starting from button
  transitionOverlay.value.style.clipPath = `circle(0px at ${x}px ${y}px)`
  transitionOverlay.value.style.display = 'flex'
  
  // Force reflow
  transitionOverlay.value.offsetHeight
  
  // Animate clip-path to reveal new theme
  transitionOverlay.value.style.transition = 'clip-path 0.6s ease-in-out'
  transitionOverlay.value.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`
  
  // Toggle theme immediately but keep overlay visible
  setTimeout(() => {
    themeStore.toggleTheme()
  }, 300)
  
  // Hide overlay after animation completes and theme has settled
  setTimeout(() => {
    if (transitionOverlay.value) {
      transitionOverlay.value.style.display = 'none'
      transitionOverlay.value.style.transition = 'none'
      transitionOverlay.value.style.clipPath = ''
    }
  }, 650)
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.app-footer {
  padding: 1.5rem 2rem;
  text-align: center;
  border-top: 1px solid var(--border-primary, #30363d);
}

.app-footer p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-secondary, #7d8590);
}

/* Theme Transition Overlay */
.theme-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  display: none;
  pointer-events: none;
  z-index: 10000;
  overflow: hidden;
  flex-direction: column;
}

.theme-transition-overlay[style*="display: flex"] {
  display: flex;
}

/* Apply theme styles to overlay - Light Mode (default) */
.theme-transition-overlay[data-theme="light"] {
  background: #ffffff;
  color: #24292f;
  
  /* Override CSS variables for light mode */
  --bg-primary: #ffffff;
  --bg-secondary: #f6f8fa;
  --bg-tertiary: #ffffff;
  --border-primary: #d0d7de;
  --border-secondary: #e8eaed;
  --text-primary: #24292f;
  --text-secondary: #57606a;
  --text-tertiary: #6e7781;
  --accent-blue: #0969da;
  --accent-green: #1a7f37;
  --accent-yellow: #9a6700;
  --accent-red: #cf222e;
  --card-bg: #ffffff;
  --card-border: #d0d7de;
  --card-hover-bg: #f6f8fa;
  --text-light: #24292f;
  --text-muted: #57606a;
}

/* Apply theme styles to overlay - Dark Mode */
.theme-transition-overlay[data-theme="dark"] {
  background: #0d1117;
  color: #e6edf3;
  
  /* Override CSS variables for dark mode */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --border-primary: #30363d;
  --border-secondary: #21262d;
  --text-primary: #e6edf3;
  --text-secondary: #7d8590;
  --text-tertiary: #484f58;
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;
  --accent-yellow: #d29922;
  --accent-red: #f85149;
  --card-bg: #161b22;
  --card-border: #30363d;
  --card-hover-bg: #21262d;
  --text-light: #e6edf3;
  --text-muted: #7d8590;
}

.theme-transition-overlay > * {
  pointer-events: none;
}
</style>
