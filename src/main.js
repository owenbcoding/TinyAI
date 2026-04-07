import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

// Optional: Configure resource loaders after mount
// Uncomment to use JSON files (RECOMMENDED for Discord bot):
/*
import { useResourcesStore } from './stores/resources'

const resourcesStore = useResourcesStore()

// For local JSON files in public/data/
resourcesStore.useJSONLoaders('./data')

// For GitHub raw files (when Discord bot commits to repo)
// resourcesStore.useJSONLoaders('https://raw.githubusercontent.com/TheTinyAIServer/resources/main/data')

// Load resources
resourcesStore.loadAllResources()
*/

// Alternative: Use markdown files instead
/*
resourcesStore.useMarkdownLoaders('./data')
resourcesStore.loadAllResources()
*/
