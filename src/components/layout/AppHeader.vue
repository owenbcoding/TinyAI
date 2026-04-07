<template>
  <header>
    <nav>
      <router-link to="/" class="logo">
        <div class="logo-icon"></div>
        <span class="logo-text">TINY AI</span>
      </router-link>
      <ul class="nav-links">
        <li><router-link to="/about"><i class="fas fa-info-circle"></i> ABOUT</router-link></li>
        <li class="dropdown">
          <a href="#" class="dropdown-toggle"><i class="fas fa-book"></i> RESOURCES</a>
          <ul class="dropdown-menu">
            <li><a href="#" @click.prevent="switchTab('papers')"><i class="fas fa-file-alt"></i> Papers</a></li>
            <li><a href="#" @click.prevent="switchTab('repos')"><i class="fab fa-github"></i> Github Repos</a></li>
            <li><a href="#" @click.prevent="switchTab('huggingface')"><i class="fas fa-smile-beam"></i> Hugging Face</a></li>
          </ul>
        </li>
        <li><router-link to="/learn"><i class="fas fa-graduation-cap"></i> LEARN</router-link></li>
        <li><router-link to="/bot"><i class="fas fa-comments"></i> CHAT</router-link></li>
        <li>
          <button @click="toggleTheme" class="theme-toggle" :aria-label="isDarkMode ? 'Switch to Normal Mode' : 'Switch to Dark Mode'">
            <i class="fas fa-sun sun-icon" :class="{ 'hidden': isDarkMode }"></i>
            <i class="fas fa-moon moon-icon" :class="{ 'visible': isDarkMode }"></i>
          </button>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResourcesStore } from '../../stores/resources'
import { useThemeStore } from '../../stores/theme'

const router = useRouter()
const resourcesStore = useResourcesStore()
const themeStore = useThemeStore()

const isDarkMode = computed(() => themeStore.isDarkMode)

function switchTab(tab) {
  resourcesStore.setActiveTab(tab)
  router.push('/')
}

function toggleTheme() {
  themeStore.toggleTheme()
}
</script>

<style scoped>
header {
  background-color: transparent;
  color: var(--text-light);
  padding: var(--spacing-sm) 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-light);
}

.logo-icon {
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.2);
}

.logo-text {
  font-family: 'Arial Black', 'Impact', sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #f5e6b3;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}

.nav-links > li {
  position: relative;
}

.nav-links a {
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  transition: color var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) 0;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-yellow);
}

.dropdown-toggle::after {
  content: '\f078';
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  font-size: 0.7rem;
  margin-left: 0.3rem;
  transition: transform var(--transition-base);
}

.dropdown:hover .dropdown-toggle::after {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: rgba(45, 38, 80, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: var(--spacing-xs) 0;
  min-width: 180px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-base);
  box-shadow: var(--shadow-lg);
  list-style: none;
  margin-top: var(--spacing-xs);
}

.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu a {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  margin: 0.2rem 0.5rem;
}

.dropdown-menu a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Theme Toggle */
.theme-toggle {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  position: relative;
  transition: all var(--transition-base);
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.sun-icon,
.moon-icon {
  position: absolute;
  font-size: 1.2rem;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.sun-icon {
  color: #f5e6b3;
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.sun-icon.hidden {
  opacity: 0;
  transform: rotate(180deg) scale(0);
}

.moon-icon {
  color: #f5e6b3;
  opacity: 0;
  transform: rotate(-180deg) scale(0);
}

.moon-icon.visible {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
</style>
