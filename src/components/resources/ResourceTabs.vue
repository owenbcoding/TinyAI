<template>
  <div class="resource-header">
    <div class="header-left">
      <h2 class="section-title" :class="`${activeTab}-title`">
        <i :class="currentIcon"></i>
        {{ currentTitle }}
      </h2>
      <p class="section-description">
        Tiny AI Discord bot will add more resources via PRs
      </p>
    </div>
    <div class="header-right">
      <span class="resource-count">{{ resourceCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useResourcesStore } from '../../stores/resources'

const resourcesStore = useResourcesStore()
const activeTab = computed(() => resourcesStore.activeTab)
const resourceCount = computed(() => resourcesStore.currentResources.length)

const currentTitle = computed(() => {
  const titles = {
    papers: 'Research Papers',
    repos: 'Github Repositories',
    huggingface: 'Hugging Face Models'
  }
  return titles[activeTab.value] || 'Resources'
})

const currentIcon = computed(() => {
  const icons = {
    papers: 'fas fa-file-alt',
    repos: 'fab fa-github',
    huggingface: 'fas fa-cube'
  }
  return icons[activeTab.value] || 'fas fa-book'
})
</script>

<style scoped>
.resource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary, #30363d);
}

.header-left {
  flex: 1;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary, #e6edf3);
}

.section-title i {
  font-size: 1.125rem;
}

.papers-title i {
  color: var(--accent-red, #f85149);
}

.repos-title i {
  color: var(--accent-blue, #58a6ff);
}

.huggingface-title i {
  color: var(--accent-yellow, #d29922);
}

.section-description {
  font-size: 0.8125rem;
  color: var(--text-secondary, #7d8590);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.resource-count {
  font-size: 0.875rem;
  color: var(--text-secondary, #7d8590);
  font-weight: 500;
}

@media (max-width: 768px) {
  .resource-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
