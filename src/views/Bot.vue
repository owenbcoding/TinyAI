<template>
  <section class="chat-section" :class="{ 'centered': messages.length === 0 }">
    <div class="wip-notice">
      <i class="fas fa-tools"></i>
      <span>This chat interface is under development. Due to CORS restrictions, it requires a browser extension or backend proxy to work properly.</span>
    </div>
    
    <!-- API Token Input -->
    <div v-if="showTokenInput" class="token-input-overlay">
      <div class="token-input-card">
        <h3>
          <i class="fas fa-key"></i>
          Hugging Face API Token Required
        </h3>
        <p>To use the chat feature, you need a Hugging Face API token.</p>
        <ol>
          <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener">Hugging Face Settings</a></li>
          <li>Create a new token with "Read" access</li>
          <li>Paste it below</li>
        </ol>
        <div class="token-input-group">
          <input 
            v-model="API_TOKEN" 
            type="password" 
            placeholder="hf_..." 
            class="token-input"
            @keydown.enter="saveApiToken"
          />
          <button @click="saveApiToken" class="btn-save-token" :disabled="!API_TOKEN.trim()">
            Save Token
          </button>
        </div>
        <p class="token-note">
          <i class="fas fa-lock"></i>
          Your token is stored locally in your browser and never sent to our servers.
        </p>
      </div>
    </div>
    
    <div class="chat-messages" ref="messagesContainer" v-if="messages.length > 0">
      <div class="messages-inner">
        <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
          <div class="message-content">
            <div class="message-text">{{ message.content }}</div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <div class="input-container">
        <div class="chat-input-wrapper">
          <textarea
            v-model="userInput"
            placeholder="Ask Tiny AI..."
            class="chat-input"
            rows="1"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
            ref="inputField"
            :disabled="!API_TOKEN"
          ></textarea>
        </div>

        <div class="input-footer">
          <div class="footer-left">
            <button class="btn-icon-footer" title="Attach file">
              <i class="fas fa-paperclip"></i>
            </button>
            
            <button class="btn-footer">
              <i class="fas fa-wrench"></i>
              Tools
            </button>
            
            <button v-if="API_TOKEN" @click="clearApiToken" class="btn-footer" title="Clear API token">
              <i class="fas fa-key"></i>
              Clear Token
            </button>
          </div>
          
          <div class="footer-right">
            <div class="model-select-wrapper" @click="toggleModelDropdown">
              <span class="model-label">{{ getModelLabel(selectedModel) }}</span>
              <i class="fas fa-chevron-up" :class="{ 'rotated': showModelDropdown }"></i>
              
              <div v-if="showModelDropdown" class="model-dropdown" @click.stop>
                <div class="model-search-wrapper">
                  <i class="fas fa-search"></i>
                  <input 
                    type="text" 
                    v-model="modelSearchQuery"
                    placeholder="Search models..."
                    class="model-search-input"
                    @click.stop
                  />
                  <button 
                    v-if="modelSearchQuery" 
                    @click.stop="modelSearchQuery = ''"
                    class="clear-search"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div v-if="isLoadingModels" class="model-loading">
                  <div class="spinner-small"></div>
                  <span>Loading models...</span>
                </div>
                
                <div v-else-if="filteredModels.length === 0" class="no-models">
                  <i class="fas fa-search"></i>
                  <span>No models found</span>
                </div>
                
                <div v-else class="model-list">
                  <div 
                    v-for="model in filteredModels" 
                    :key="model.value"
                    @click.stop="selectModel(model.value)"
                    class="model-option"
                    :class="{ active: selectedModel === model.value }"
                  >
                    <div class="model-option-content">
                      <div class="model-option-header">
                        <span class="model-option-label">{{ model.label }}</span>
                        <div class="model-badges">
                          <span 
                            class="model-badge"
                            :class="`badge-${getModelRecommendation(model).color}`"
                          >
                            {{ getModelRecommendation(model).text }}
                          </span>
                          <span 
                            v-if="getModelRecommendation(model).strict"
                            class="model-badge badge-strict"
                            title="Strict hardware requirements"
                          >
                            <i class="fas fa-exclamation-triangle"></i>
                          </span>
                        </div>
                      </div>
                      <span class="model-option-id">{{ model.fullId }}</span>
                      <div class="model-option-meta">
                        <span v-if="model.estimatedVRAM" class="model-size">
                          ~{{ model.estimatedVRAM }}GB VRAM
                        </span>
                        <span v-if="model.parameters" class="model-params">
                          {{ formatParameters(model.parameters) }} params
                        </span>
                        <span v-if="model.note && !model.estimatedVRAM" class="model-option-note">
                          {{ model.note }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              v-if="!userInput.trim()" 
              class="btn-icon-footer" 
              title="Voice input"
            >
              <i class="fas fa-microphone"></i>
            </button>
            
            <button 
              v-else
              @click="sendMessage" 
              :disabled="isLoading" 
              class="btn-send-footer"
              title="Send message"
            >
              <i class="fas fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted, watch, computed } from 'vue'

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const selectedModel = ref(null)
const showModelDropdown = ref(false)
const messagesContainer = ref(null)
const inputField = ref(null)
const availableModels = ref([])
const isLoadingModels = ref(false)
const modelSearchQuery = ref('')
const filteredModels = ref([])

// System specs for model recommendations
const systemSpecs = ref({
  estimatedVRAM: 8, // GB - can be detected or user-configured
  preferSpeed: true,
  tier: 'consumer' // 'mobile', 'consumer', 'professional', 'datacenter'
})

// Hardware tier definitions (similar to HF)
const hardwareTiers = {
  mobile: { vram: 4, name: 'Mobile/Edge', icon: 'fa-mobile-alt' },
  consumer: { vram: 12, name: 'Consumer GPU', icon: 'fa-desktop' },
  professional: { vram: 24, name: 'Professional', icon: 'fa-server' },
  datacenter: { vram: 80, name: 'Datacenter', icon: 'fa-database' }
}

// API token management - stored in localStorage
const API_TOKEN = ref(localStorage.getItem('hf_api_token') || '')
const showTokenInput = ref(!API_TOKEN.value)

function saveApiToken() {
  if (API_TOKEN.value.trim()) {
    localStorage.setItem('hf_api_token', API_TOKEN.value.trim())
    showTokenInput.value = false
  }
}

function clearApiToken() {
  localStorage.removeItem('hf_api_token')
  API_TOKEN.value = ''
  showTokenInput.value = true
}

// Model size estimates (in GB VRAM)
const modelSizeEstimates = {
  '1B': 2,
  '3B': 4,
  '7B': 8,
  '8B': 10,
  '13B': 16,
  '70B': 80
}

// Get model size from name or metadata
function estimateModelSize(model) {
  // First check if we have actual VRAM estimate from API
  if (model.estimatedVRAM) {
    return model.estimatedVRAM
  }
  
  // Fallback to name-based estimation
  const modelName = model.label || model.value || ''
  for (const [size, vram] of Object.entries(modelSizeEstimates)) {
    if (modelName.includes(size)) {
      return vram
    }
  }
  return 8 // default
}

// Get hardware tier for model
function getModelHardwareTier(model) {
  const modelSize = estimateModelSize(model)
  
  if (modelSize <= 4) return 'mobile'
  if (modelSize <= 12) return 'consumer'
  if (modelSize <= 24) return 'professional'
  return 'datacenter'
}

// Check if model fits system
function modelFitsSystem(model) {
  const modelTier = getModelHardwareTier(model)
  const systemTier = systemSpecs.value.tier
  
  const tierOrder = ['mobile', 'consumer', 'professional', 'datacenter']
  return tierOrder.indexOf(modelTier) <= tierOrder.indexOf(systemTier)
}

// Get recommendation badge
function getModelRecommendation(model) {
  const modelSize = estimateModelSize(model)
  const modelTier = getModelHardwareTier(model)
  const systemTier = systemSpecs.value.tier
  
  // Strict compatibility check
  if (modelTier === systemTier) {
    return { text: 'Recommended', color: 'blue', strict: false }
  } else if (modelTier === 'mobile' && systemTier !== 'mobile') {
    return { text: 'Fast', color: 'green', strict: false }
  } else if (modelSize <= systemSpecs.value.estimatedVRAM * 0.5) {
    return { text: 'Fast', color: 'green', strict: false }
  } else if (modelSize <= systemSpecs.value.estimatedVRAM) {
    return { text: 'Compatible', color: 'blue', strict: false }
  } else {
    return { text: 'Requires ' + hardwareTiers[modelTier].name, color: 'orange', strict: true }
  }
}

// Load available models from Hugging Face Hub API
async function loadModelsFromHuggingFace() {
  try {
    // Use Hugging Face API to search for text-generation models
    const response = await fetch(
      'https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=50'
    )
    
    if (response.ok) {
      const models = await response.json()
      
      return models
        .filter(m => {
          // Filter for instruction/chat models
          const modelId = m.modelId || m.id
          return modelId && (
            modelId.includes('Instruct') ||
            modelId.includes('instruct') ||
            modelId.includes('Chat') ||
            modelId.includes('chat')
          )
        })
        .slice(0, 30) // Limit to top 30
        .map(m => {
          const modelId = m.modelId || m.id
          const modelName = modelId.split('/').pop()
          
          // Get safetensors info if available
          const safetensorsInfo = m.safetensors || {}
          const totalSize = safetensorsInfo.total || 0
          const parameters = safetensorsInfo.parameters || {}
          
          // Calculate total parameters
          let totalParams = 0
          for (const dtype in parameters) {
            totalParams += parameters[dtype] || 0
          }
          
          // Estimate VRAM from file size (rough estimate: size in bytes / 1GB)
          const estimatedVRAM = totalSize > 0 ? Math.ceil(totalSize / (1024 * 1024 * 1024)) : null
          
          return {
            value: modelId,
            label: modelName,
            fullId: modelId,
            downloads: m.downloads || 0,
            note: `${(m.downloads || 0).toLocaleString()} downloads`,
            size: totalSize,
            parameters: totalParams,
            estimatedVRAM: estimatedVRAM
          }
        })
    }
  } catch (error) {
    console.error('Failed to load from HF API:', error)
  }
  return []
}

// Load available models
async function loadAvailableModels() {
  isLoadingModels.value = true
  try {
    // First try to load from local huggingface.json
    const localResponse = await fetch('./data/huggingface.json')
    let localModels = []
    
    if (localResponse.ok) {
      const data = await localResponse.json()
      
      localModels = data.resources
        .filter(r => r.type === 'HUB' && r.url.includes('huggingface.co/'))
        .map(r => {
          const match = r.url.match(/huggingface\.co\/([^\/]+\/[^\/\?#]+)/)
          if (match) {
            return {
              value: match[1],
              label: r.title,
              fullId: match[1],
              note: r.note,
              isLocal: true
            }
          }
          return null
        })
        .filter(m => m !== null)
    }
    
    // Then load from Hugging Face API
    const hfModels = await loadModelsFromHuggingFace()
    
    // Combine and deduplicate
    const allModels = [...localModels, ...hfModels]
    const uniqueModels = Array.from(
      new Map(allModels.map(m => [m.value, m])).values()
    )
    
    // Sort by downloads (HF models) and local first
    availableModels.value = uniqueModels.sort((a, b) => {
      if (a.isLocal && !b.isLocal) return -1
      if (!a.isLocal && b.isLocal) return 1
      return (b.downloads || 0) - (a.downloads || 0)
    })
    
    // Initialize filtered models
    filteredModels.value = availableModels.value
    
    // Select first model if none selected
    if (availableModels.value.length > 0 && !selectedModel.value) {
      selectedModel.value = availableModels.value[0].value
    }
  } catch (error) {
    console.error('Failed to load models:', error)
    // Fallback to default models
    availableModels.value = [
      { 
        value: 'meta-llama/Llama-3.2-1B-Instruct', 
        label: 'Llama 3.2 1B Instruct',
        fullId: 'meta-llama/Llama-3.2-1B-Instruct',
        note: 'Fast and efficient',
        isLocal: true
      },
      { 
        value: 'meta-llama/Llama-3.2-3B-Instruct', 
        label: 'Llama 3.2 3B Instruct',
        fullId: 'meta-llama/Llama-3.2-3B-Instruct',
        note: 'Balanced performance',
        isLocal: true
      },
      { 
        value: 'mistralai/Mistral-7B-Instruct-v0.3', 
        label: 'Mistral 7B Instruct v0.3',
        fullId: 'mistralai/Mistral-7B-Instruct-v0.3',
        note: 'High quality responses',
        isLocal: true
      }
    ]
    filteredModels.value = availableModels.value
    selectedModel.value = availableModels.value[0].value
  } finally {
    isLoadingModels.value = false
  }
}

// Filter models based on search query
function filterModels() {
  const query = modelSearchQuery.value.toLowerCase().trim()
  
  if (!query) {
    filteredModels.value = availableModels.value
    return
  }
  
  filteredModels.value = availableModels.value.filter(model => {
    return (
      model.label.toLowerCase().includes(query) ||
      model.fullId.toLowerCase().includes(query) ||
      (model.note && model.note.toLowerCase().includes(query))
    )
  })
}

// Watch search query
watch(modelSearchQuery, () => {
  filterModels()
})

// Load models on component mount
onMounted(() => {
  loadAvailableModels()
})

function getModelLabel(value) {
  if (!value) return 'Select Model'
  const model = availableModels.value.find(m => m.value === value)
  return model ? model.label : value
}

function formatParameters(params) {
  if (params >= 1e9) {
    return `${(params / 1e9).toFixed(1)}B`
  } else if (params >= 1e6) {
    return `${(params / 1e6).toFixed(1)}M`
  }
  return params.toLocaleString()
}

function toggleModelDropdown() {
  showModelDropdown.value = !showModelDropdown.value
}

function selectModel(value) {
  selectedModel.value = value
  showModelDropdown.value = false
}

function clearChat() {
  messages.value = []
}

async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return
  
  if (!API_TOKEN.value) {
    showTokenInput.value = true
    return
  }

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: userInput.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const prompt = userInput.value
  userInput.value = ''
  
  if (inputField.value) {
    inputField.value.style.height = 'auto'
  }
  
  await nextTick()
  scrollToBottom()

  isLoading.value = true

  try {
    // Note: Hugging Face Inference API has CORS restrictions
    // For production, consider using a backend proxy or Hugging Face Inference Endpoints
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${selectedModel.value}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    let assistantText = ''
    if (data.error) {
      // Handle model loading errors
      if (data.error.includes('loading')) {
        assistantText = `⏳ Model is loading... This can take 20-30 seconds. Please try again in a moment.`
      } else {
        assistantText = `Error: ${data.error}`
      }
    } else if (Array.isArray(data) && data[0]?.generated_text) {
      assistantText = data[0].generated_text
    } else if (data.generated_text) {
      assistantText = data.generated_text
    } else {
      assistantText = 'Sorry, I could not generate a response.'
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: assistantText,
      timestamp: new Date()
    }

    messages.value.push(assistantMessage)
    
    await nextTick()
    scrollToBottom()
  } catch (error) {
    let errorMessage = ''
    
    // Check for CORS error
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      errorMessage = `⚠️ CORS Error: Direct browser access to Hugging Face API is blocked.\n\nSolutions:\n1. Use a browser extension like "CORS Unblock" (for testing only)\n2. Deploy with a backend proxy\n3. Use Hugging Face Inference Endpoints with CORS enabled\n\nFor now, this chat feature works best when deployed with a proper backend.`
    } else {
      errorMessage = `Error: ${error.message}`
    }
    
    const errorMsg = {
      id: Date.now() + 1,
      role: 'assistant',
      content: errorMessage,
      timestamp: new Date()
    }
    messages.value.push(errorMsg)
  } finally {
    isLoading.value = false
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function autoResize(event) {
  const textarea = event.target
  textarea.style.height = 'auto'
  textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
}
</script>

<style scoped>
.chat-section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
}

.wip-notice {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(219, 109, 40, 0.15);
  border: 1px solid rgba(219, 109, 40, 0.3);
  color: #db6d28;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.wip-notice i {
  font-size: 1rem;
}

.token-input-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.token-input-card {
  background: var(--bg-secondary, #161b22);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.token-input-card h3 {
  color: var(--text-primary, #e6edf3);
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.token-input-card h3 i {
  color: var(--accent-blue, #58a6ff);
}

.token-input-card p {
  color: var(--text-secondary, #7d8590);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.token-input-card ol {
  color: var(--text-secondary, #7d8590);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 1.25rem;
  padding: 0;
}

.token-input-card ol li {
  margin-bottom: 0.5rem;
}

.token-input-card a {
  color: var(--accent-blue, #58a6ff);
  text-decoration: none;
}

.token-input-card a:hover {
  text-decoration: underline;
}

.token-input-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.token-input {
  flex: 1;
  background: var(--bg-tertiary, #21262d);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 6px;
  color: var(--text-primary, #e6edf3);
  font-size: 0.875rem;
  padding: 0.75rem 1rem;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: all 0.2s ease;
}

.token-input:focus {
  border-color: var(--accent-blue, #58a6ff);
  background: var(--bg-secondary, #161b22);
}

.btn-save-token {
  background: var(--accent-blue, #58a6ff);
  border: none;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-save-token:hover:not(:disabled) {
  background: #4a95e8;
}

.btn-save-token:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.token-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary, #484f58);
  margin: 0;
}

.token-note i {
  color: var(--accent-green, #3fb950);
}


.chat-section.centered {
  justify-content: center;
}

.chat-section.centered .chat-input-area {
  padding: 0 2rem 2rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.messages-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.empty-state p {
  font-size: 1.25rem;
  color: var(--text-secondary, #7d8590);
}

.message {
  display: flex;
  gap: 1rem;
  animation: fadeIn 0.3s ease;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-content {
  max-width: 70%;
}

.message.user .message-content {
  max-width: 60%;
}

.message-text {
  color: var(--text-primary, #e6edf3);
  line-height: 1.6;
  font-size: 0.9375rem;
}

.message.user .message-text {
  background: var(--bg-tertiary, #21262d);
  padding: 0.75rem 1rem;
  border-radius: 18px;
  border: 1px solid var(--border-primary, #30363d);
}

.typing-indicator {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary, #7d8590);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.chat-input-area {
  padding: 2rem;
  background: transparent;
  display: flex;
  justify-content: center;
}

.input-container {
  max-width: 800px;
  width: 100%;
  background: var(--bg-secondary, #161b22);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 32px;
  padding: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.chat-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-secondary, #7d8590);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-icon:hover {
  color: var(--text-primary, #e6edf3);
}

.chat-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-primary, #e6edf3);
  font-size: 0.9375rem;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 200px;
  outline: none;
  padding: 0.5rem 0;
}

.btn-icon-footer {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: var(--text-secondary, #7d8590);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-icon-footer:hover {
  color: var(--text-primary, #e6edf3);
}

.btn-send-footer {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--text-primary, #e6edf3);
  border: none;
  color: var(--bg-primary, #0d1117);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.btn-send-footer:hover:not(:disabled) {
  background: #ffffff;
}

.btn-send-footer:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding: 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-footer {
  background: transparent;
  border: none;
  color: var(--text-secondary, #7d8590);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-footer:hover {
  color: var(--text-primary, #e6edf3);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary, #7d8590);
}

.model-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.model-select-wrapper:hover {
  background: var(--bg-tertiary, #21262d);
}

.model-label {
  font-size: 0.875rem;
  color: var(--text-secondary, #7d8590);
  font-weight: 500;
  line-height: 1;
}

.model-select-wrapper i {
  font-size: 0.75rem;
  color: var(--text-secondary, #7d8590);
  margin-top: 2px;
  transition: transform 0.2s ease;
}

.model-select-wrapper i.rotated {
  transform: rotate(180deg);
}

.model-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  background: var(--bg-secondary, #161b22);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  min-width: 420px;
  max-width: 500px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  max-height: 500px;
}

.model-search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border-secondary, #21262d);
  background: var(--bg-secondary, #161b22);
  border-radius: 8px 8px 0 0;
  flex-shrink: 0;
}

.model-search-wrapper i.fa-search {
  color: var(--text-secondary, #7d8590);
  font-size: 0.875rem;
  flex-shrink: 0;
}

.model-search-input {
  flex: 1;
  background: var(--bg-tertiary, #21262d);
  border: 1px solid var(--border-primary, #30363d);
  border-radius: 6px;
  color: var(--text-primary, #e6edf3);
  font-size: 0.875rem;
  outline: none;
  font-family: inherit;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
}

.model-search-input:focus {
  border-color: var(--accent-blue, #58a6ff);
  background: var(--bg-secondary, #161b22);
}

.model-search-input::placeholder {
  color: var(--text-secondary, #7d8590);
}

.clear-search {
  background: transparent;
  border: none;
  color: var(--text-secondary, #7d8590);
  cursor: pointer;
  padding: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-search:hover {
  background: var(--bg-tertiary, #21262d);
  color: var(--text-primary, #e6edf3);
}

.clear-search i {
  font-size: 0.75rem;
}

.model-list {
  overflow-y: auto;
  max-height: 400px;
}

/* Custom scrollbar styling */
.model-list::-webkit-scrollbar {
  width: 6px;
}

.model-list::-webkit-scrollbar-track {
  background: transparent;
}

.model-list::-webkit-scrollbar-thumb {
  background: var(--border-primary, #30363d);
  border-radius: 3px;
}

.model-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-tertiary, #484f58);
}

/* Firefox scrollbar */
.model-list {
  scrollbar-width: thin;
  scrollbar-color: var(--border-primary, #30363d) transparent;
}

.model-loading,
.no-models {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  color: var(--text-secondary, #7d8590);
  font-size: 0.875rem;
  justify-content: center;
}

.no-models {
  flex-direction: column;
  gap: 0.5rem;
}

.no-models i {
  font-size: 2rem;
  opacity: 0.5;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-primary, #30363d);
  border-top-color: var(--text-primary, #e6edf3);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.model-option {
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--border-secondary, #21262d);
}

.model-option:last-child {
  border-bottom: none;
  border-radius: 0 0 8px 8px;
}

.model-option:hover {
  background: var(--bg-tertiary, #21262d);
}

.model-option.active {
  background: var(--bg-tertiary, #21262d);
}

.model-option-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.model-option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.model-badges {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.model-option-label {
  font-size: 0.9375rem;
  color: var(--text-primary, #e6edf3);
  font-weight: 600;
  flex: 1;
  line-height: 1.3;
}

.model-option.active .model-option-label {
  color: var(--accent-blue, #58a6ff);
}

.model-option-id {
  font-size: 0.75rem;
  color: var(--text-secondary, #7d8590);
  font-family: 'Courier New', monospace;
  line-height: 1.4;
}

.model-option-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.model-size,
.model-params {
  font-size: 0.75rem;
  color: var(--accent-blue, #58a6ff);
  font-weight: 500;
}

.model-size {
  color: var(--accent-green, #3fb950);
}

.model-option-note {
  font-size: 0.8125rem;
  color: var(--text-secondary, #7d8590);
  line-height: 1.4;
}

.model-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.model-badge.badge-green {
  background: rgba(46, 160, 67, 0.15);
  color: #3fb950;
  border: 1px solid rgba(46, 160, 67, 0.3);
}

.model-badge.badge-blue {
  background: rgba(88, 166, 255, 0.15);
  color: #58a6ff;
  border: 1px solid rgba(88, 166, 255, 0.3);
}

.model-badge.badge-orange {
  background: rgba(219, 109, 40, 0.15);
  color: #db6d28;
  border: 1px solid rgba(219, 109, 40, 0.3);
}

.model-badge.badge-strict {
  background: rgba(248, 81, 73, 0.15);
  color: #f85149;
  border: 1px solid rgba(248, 81, 73, 0.3);
  padding: 0.25rem 0.5rem;
}

.model-badge.badge-strict i {
  font-size: 0.65rem;
}

.model-select {
  background: transparent;
  color: var(--text-secondary, #7d8590);
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  font-weight: 500;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 0.5rem;
}

.model-select option {
  background: var(--bg-secondary, #161b22);
  color: var(--text-primary, #e6edf3);
}

@media (max-width: 768px) {
  .input-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .model-dropdown {
    min-width: 300px;
    max-width: calc(100vw - 2rem);
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
