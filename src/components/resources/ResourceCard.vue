<template>
  <article class="resource-card">
    <div class="card-content">
      <div class="card-header">
        <div class="badge-group">
          <span class="badge" :class="`badge-${type}`">
            {{ badgeText }}
          </span>
          <span class="date">{{ formatDate(resource.date) }}</span>
        </div>
      </div>
      
      <h3 class="card-title">{{ resource.title }}</h3>
      
      <p v-if="resource.note" class="card-description">
        {{ resource.note }}
      </p>
      
      <div class="card-footer">
        <div class="card-tags">
          <span v-for="tag in resource.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
        
        <div class="view-button-wrapper" v-if="hasMultipleSources">
          <button 
            @click="toggleSourceMenu" 
            class="card-button"
            :class="{ active: showSourceMenu }"
          >
            <span>View</span>
            <i class="fas fa-chevron-down" :class="{ rotated: showSourceMenu }"></i>
          </button>
          
          <div v-if="showSourceMenu" class="source-menu">
            <a 
              v-for="(source, index) in resource.sources" 
              :key="index"
              :href="source.url" 
              class="source-item"
              target="_blank" 
              rel="noopener noreferrer"
              @click="closeSourceMenu"
            >
              <i :class="getSourceIcon(source.type)"></i>
              <span>{{ source.label }}</span>
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        
        <a 
          v-else
          :href="getSingleUrl" 
          class="card-button" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <span>View</span>
          <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  resource: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  }
})

const showSourceMenu = ref(false)

const badgeText = computed(() => {
  if (props.resource.type) return props.resource.type
  const badges = {
    papers: 'PAPER',
    repos: 'LIBS',
    huggingface: 'HUB'
  }
  return badges[props.type] || 'RESOURCE'
})

const hasMultipleSources = computed(() => {
  return props.resource.sources && props.resource.sources.length > 0
})

const getSingleUrl = computed(() => {
  return props.resource.url || '#'
})

function toggleSourceMenu() {
  showSourceMenu.value = !showSourceMenu.value
}

function closeSourceMenu() {
  showSourceMenu.value = false
}

function getSourceIcon(type) {
  const icons = {
    arxiv: 'fas fa-file-pdf',
    github: 'fab fa-github',
    huggingface: 'fas fa-cube',
    website: 'fas fa-globe',
    paper: 'fas fa-file-alt',
    code: 'fas fa-code',
    demo: 'fas fa-play-circle',
    docs: 'fas fa-book'
  }
  return icons[type] || 'fas fa-link'
}

function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}
</script>

<style scoped>
.resource-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card-bg, #1c1c1c);
  border: 1px solid var(--card-border, #2d2d2d);
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color var(--transition-base);
}

.resource-card:hover {
  border-color: var(--text-tertiary, #404040);
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.badge-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-papers {
  background: rgba(248, 81, 73, 0.1);
  color: var(--accent-red, #f85149);
}

.badge-repos {
  background: rgba(88, 166, 255, 0.1);
  color: var(--accent-blue, #58a6ff);
}

.badge-huggingface {
  background: rgba(210, 153, 34, 0.1);
  color: var(--accent-yellow, #d29922);
}

.date {
  font-size: 0.8rem;
  color: var(--text-secondary, #7d8590);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #e6edf3);
  line-height: 1.4;
  margin: 0;
}

.card-description {
  font-size: 0.875rem;
  color: var(--text-secondary, #7d8590);
  line-height: 1.5;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-secondary, #21262d);
  margin-top: auto;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  flex: 1;
}

.tag {
  background: transparent;
  color: var(--text-secondary, #7d8590);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid var(--border-primary, #30363d);
}

.view-button-wrapper {
  position: relative;
}

.card-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary, #e6edf3);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: transparent;
  border-radius: 6px;
  border: 1px solid var(--border-primary, #30363d);
  transition: all 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
}

.card-button:hover,
.card-button.active {
  background: var(--bg-tertiary, #21262d);
  border-color: var(--text-tertiary, #484f58);
}

.card-button i.fa-chevron-down {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.card-button i.fa-chevron-down.rotated {
  transform: rotate(180deg);
}

.source-menu {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-secondary, #161b22);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.source-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-primary, #e6edf3);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-secondary, #21262d);
}

.source-item:last-child {
  border-bottom: none;
}

.source-item:hover {
  background: var(--bg-tertiary, #21262d);
}

.source-item i:first-child {
  color: var(--text-secondary, #7d8590);
  width: 16px;
  text-align: center;
}

.source-item span {
  flex: 1;
}

.source-item i.fa-external-link-alt {
  font-size: 0.75rem;
  color: var(--text-secondary, #7d8590);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.source-item:hover i.fa-external-link-alt {
  opacity: 1;
}

@media (max-width: 768px) {
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-button {
    width: 100%;
    justify-content: center;
  }
  
  .view-button-wrapper {
    width: 100%;
  }
  
  .source-menu {
    right: 0;
    left: 0;
  }
}
</style>
