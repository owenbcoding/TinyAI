<template>
  <main class="learn-page">
    <div class="learn-container">
      <!-- Tutorial Cards Grid -->
      <div v-if="!selectedTutorial" class="tutorials-section">
        <div class="resource-header">
          <div class="header-left">
            <h2 class="section-title learn-title">
              <i class="fas fa-graduation-cap"></i>
              Learn
            </h2>
            <p class="section-description">
              Tiny AI Discord bot will add more tutorials via PRs
            </p>
          </div>
          <div class="header-right">
            <span class="resource-count">{{ tutorials.length }}</span>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading tutorials...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load tutorials</p>
          <button @click="retryLoad" class="retry-btn">Retry</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="tutorials.length === 0" class="empty-state">
          <i class="fas fa-book-open"></i>
          <p>No tutorials available yet</p>
        </div>
        
        <!-- Tutorials Grid -->
        <div v-else class="tutorials-grid">
          <article 
            v-for="tutorial in tutorials" 
            :key="tutorial.id"
            class="tutorial-card"
          >
            <div class="card-content">
              <div class="card-header">
                <div class="badge-group">
                  <span class="badge" :class="`badge-${tutorial.difficulty}`">
                    {{ tutorial.difficulty }}
                  </span>
                  <span class="duration">{{ tutorial.duration }}</span>
                </div>
              </div>
              
              <h3 class="card-title">{{ tutorial.title }}</h3>
              
              <p class="card-description">{{ tutorial.description }}</p>
              
              <div class="card-footer">
                <div class="card-tags">
                  <span v-for="tag in tutorial.tags" :key="tag" class="tag">
                    {{ tag }}
                  </span>
                </div>
                
                <button @click="openTutorial(tutorial)" class="card-button">
                  <span>View</span>
                  <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- Tutorial Content View -->
      <div v-else class="tutorial-content">
        <div class="content-header">
          <button @click="closeTutorial" class="back-button">
            <i class="fas fa-arrow-left"></i>
            <span>Back to Tutorials</span>
          </button>
          
          <div class="tutorial-meta">
            <span class="badge" :class="`badge-${selectedTutorial.difficulty}`">
              {{ selectedTutorial.difficulty }}
            </span>
            <span class="duration">
              <i class="fas fa-clock"></i>
              {{ selectedTutorial.duration }}
            </span>
          </div>
        </div>

        <div class="content-body">
          <h1 class="tutorial-title">{{ selectedTutorial.title }}</h1>
          
          <div class="tutorial-tags">
            <span v-for="tag in selectedTutorial.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>

          <div class="markdown-content" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import { useTutorialsStore } from '../stores/tutorials'

const tutorialsStore = useTutorialsStore()
const selectedTutorial = ref(null)

const tutorials = computed(() => tutorialsStore.tutorials)
const isLoading = computed(() => tutorialsStore.isLoading)
const error = computed(() => tutorialsStore.error)

const renderedContent = computed(() => {
  if (!selectedTutorial.value) return ''
  return marked(selectedTutorial.value.content)
})

function openTutorial(tutorial) {
  selectedTutorial.value = tutorial
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeTutorial() {
  selectedTutorial.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function retryLoad() {
  tutorialsStore.loadTutorials()
}

onMounted(() => {
  tutorialsStore.loadTutorials()
})
</script>

<style scoped>
.learn-page {
  min-height: calc(100vh - 200px);
  padding: 100px 2rem 80px;
  display: flex;
  flex-direction: column;
}

.learn-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  flex: 1;
  width: 100%;
}

/* Tutorials Grid Section */
.tutorials-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

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

.learn-title i {
  color: var(--accent-green, #3fb950);
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

.tutorials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
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

.tutorial-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--card-bg, #1c1c1c);
  border: 1px solid var(--card-border, #2d2d2d);
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.tutorial-card:hover {
  border-color: var(--text-tertiary, #404040);
  transform: translateY(-2px);
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

.badge-beginner {
  background: rgba(46, 160, 67, 0.15);
  color: #3fb950;
  border: 1px solid rgba(46, 160, 67, 0.3);
}

.badge-intermediate {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
  border: 1px solid rgba(88, 166, 255, 0.3);
}

.badge-advanced {
  background: rgba(219, 109, 40, 0.15);
  color: #db6d28;
  border: 1px solid rgba(219, 109, 40, 0.3);
}

.duration {
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

.card-button:hover {
  background: var(--bg-tertiary, #21262d);
  border-color: var(--text-tertiary, #484f58);
}

/* Tutorial Content View */
.tutorial-content {
  animation: fadeIn 0.3s ease;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-secondary, #21262d);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-primary, #30363d);
  color: var(--text-primary, #e6edf3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--bg-tertiary, #21262d);
  border-color: var(--text-tertiary, #484f58);
}

.tutorial-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.content-body {
  max-width: 900px;
  margin: 0 auto;
}

.tutorial-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary, #e6edf3);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.tutorial-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.markdown-content {
  color: var(--text-primary, #e6edf3);
  line-height: 1.7;
  font-size: 1rem;
}

.markdown-content :deep(h1) {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary, #e6edf3);
}

.markdown-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary, #e6edf3);
}

.markdown-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #e6edf3);
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5rem;
}

.markdown-content :deep(code) {
  background: var(--bg-tertiary, #21262d);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
  font-family: 'Courier New', monospace;
  color: var(--accent-blue, #58a6ff);
}

.markdown-content :deep(pre) {
  background: var(--bg-tertiary, #21262d);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: var(--text-primary, #e6edf3);
}

.markdown-content :deep(a) {
  color: var(--accent-blue, #58a6ff);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .tutorials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .resource-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .tutorials-grid {
    grid-template-columns: 1fr;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .tutorial-title {
    font-size: 2rem;
  }
}
</style>
