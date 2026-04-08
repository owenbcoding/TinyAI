<template>
  <section class="resources-section">
    <div class="container">
      <ResourceTabs />
      <Transition name="fade" mode="out-in">
        <ResourceList :key="activeTab" />
      </Transition>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useResourcesStore } from '../stores/resources'
import ResourceTabs from '../components/resources/ResourceTabs.vue'
import ResourceList from '../components/resources/ResourceList.vue'

const resourcesStore = useResourcesStore()
const activeTab = computed(() => resourcesStore.activeTab)

onMounted(() => {
  resourcesStore.useJSONLoaders('./data')
})
</script>

<style scoped>
.resources-section {
  padding: 100px 2rem 80px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
