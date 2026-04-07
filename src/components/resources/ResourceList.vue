<template>
  <div class="resource-list-wrapper">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading resources...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>Failed to load resources</p>
      <button @click="retry" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="currentResources.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>No resources found</p>
    </div>

    <div v-else class="resource-list">
      <ResourceCard
        v-for="resource in currentResources"
        :key="resource.id"
        :resource="resource"
        :type="activeTab"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useResourcesStore } from '../../stores/resources'
import ResourceCard from './ResourceCard.vue'

const resourcesStore = useResourcesStore()
const activeTab = computed(() => resourcesStore.activeTab)
const currentResources = computed(() => resourcesStore.currentResources)
const isLoading = computed(() => resourcesStore.isLoading)
const error = computed(() => resourcesStore.error)

function retry() {
  resourcesStore.loadAllResources()
}

onMounted(() => {
  resourcesStore.loadAllResources()
})
</script>

<style scoped>
.resource-list-wrapper {
  min-height: 300px;
}

.resource-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary, #7d8590);
}

.loading-state i,
.error-state i,
.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.loading-state p,
.error-state p,
.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-primary, #30363d);
  border-top-color: var(--text-primary, #e6edf3);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--bg-tertiary, #21262d);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 6px;
  color: var(--text-primary, #e6edf3);
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--bg-secondary, #161b22);
  border-color: var(--text-secondary, #7d8590);
}

@media (max-width: 1024px) {
  .resource-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .resource-list {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
