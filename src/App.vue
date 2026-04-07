<template>
  <div id="app">
    <AppHeader />
    <main>
      <router-view />
    </main>
    <footer v-if="!isChatPage" class="app-footer">
      <p>© 2026 Tiny AI. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'

const route = useRoute()
const isChatPage = computed(() => route.path === '/bot')
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
</style>
