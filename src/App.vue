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
  background: #514483;
  color: #f5da99;
  
  /* Override CSS variables for light mode */
  --bg-primary: #514483;
  --bg-secondary: #5d4f92;
  --bg-tertiary: #685a9f;
  --border-primary: rgba(245, 218, 153, 0.18);
  --border-secondary: rgba(245, 218, 153, 0.1);
  --text-primary: #f5da99;
  --text-secondary: rgba(245, 218, 153, 0.78);
  --text-tertiary: rgba(245, 218, 153, 0.52);
  --accent-blue: #fb8c65;
  --accent-green: #1a7f37;
  --accent-yellow: #9a6700;
  --accent-red: #cf222e;
  --card-bg: rgba(28, 20, 55, 0.2);
  --card-border: rgba(245, 218, 153, 0.18);
  --card-hover-bg: rgba(28, 20, 55, 0.34);
  --text-light: #f5da99;
  --text-muted: rgba(245, 218, 153, 0.78);
  --header-bg: rgba(35, 24, 61, 0.94);
  --header-text: #f5da99;
  --header-hover: #fb8c65;
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
  --header-bg: rgba(13, 17, 23, 0.94);
  --header-text: #e6edf3;
  --header-hover: #58a6ff;
}

.theme-transition-overlay > * {
  pointer-events: none;
}
</style>
