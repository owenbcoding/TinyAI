<template>
  <section class="chat-section" :class="{ 'centered': messages.length === 0 }">
    <div v-if="false" class="wip-notice">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Chat feature requires a backend proxy due to CORS restrictions. See <a href="https://github.com/OpenChatGit/TinyAI/blob/main/docs/CORS_WORKAROUND.md" target="_blank">CORS_WORKAROUND.md</a> for solutions.</span>
    </div>
    
    <!-- API Token Input -->
    <div v-if="showTokenInput" class="token-input-overlay">
      <div class="token-input-card">
        <h3>
          <i class="fas fa-key"></i>
          Hugging Face API Token Required
        </h3>
        <p>To use the chat feature, you need a Hugging Face API token with "Inference Providers" permission.</p>
        <ol>
          <li>Go to <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener">Hugging Face Settings</a></li>
          <li>Create a new token with <strong>"Inference Providers"</strong> permission (not just "Read")</li>
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
            <div 
              v-if="message.role === 'assistant'" 
              class="message-text markdown-content" 
              v-html="renderMarkdown(message.content)"
            ></div>
            <div v-else class="message-text">{{ message.content }}</div>
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
import { HfInference } from '@huggingface/inference'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// Initialize markdown-it with syntax highlighting
const md = new MarkdownIt({
  html: false, // Disable HTML tags for security
  linkify: true, // Auto-convert URLs to links
  typographer: true, // Enable smart quotes and other typographic replacements
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

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

// Function to render markdown
function renderMarkdown(content) {
  return md.render(content)
}

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

// Initialize HfInference client
let hfClient = null
if (API_TOKEN.value) {
  hfClient = new HfInference(API_TOKEN.value)
}

function saveApiToken() {
  if (API_TOKEN.value.trim()) {
    localStorage.setItem('hf_api_token', API_TOKEN.value.trim())
    hfClient = new HfInference(API_TOKEN.value.trim())
    showTokenInput.value = false
  }
}

function clearApiToken() {
  localStorage.removeItem('hf_api_token')
  API_TOKEN.value = ''
  hfClient = null
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

// Load models from Hugging Face Hub API that are available via Inference Providers
async function loadModelsFromHuggingFace() {
  try {
    // Get all models available via Inference Providers for chat completion
    const response = await fetch(
      'https://huggingface.co/api/models?inference_provider=all&pipeline_tag=text-generation&sort=downloads&direction=-1&limit=50'
    )
    
    if (response.ok) {
      const models = await response.json()
      
      return models
        .filter(m => {
          const modelId = m.modelId || m.id
          // Filter for instruction/chat models
          return modelId && (
            modelId.includes('Instruct') ||
            modelId.includes('instruct') ||
            modelId.includes('Chat') ||
            modelId.includes('chat') ||
            modelId.includes('Thinking') ||
            modelId.includes('thinking')
          )
        })
        .slice(0, 20) // Limit to top 20
        .map(m => {
          const modelId = m.modelId || m.id
          const modelName = modelId.split('/').pop()
          
          return {
            value: modelId,
            label: modelName,
            fullId: modelId,
            downloads: m.downloads || 0,
            note: `${(m.downloads || 0).toLocaleString()} downloads`,
            isFromAPI: true
          }
        })
    }
  } catch (error) {
    console.error('Failed to load from HF API:', error)
  }
  return []
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

// Load available models
async function loadAvailableModels() {
  isLoadingModels.value = true
  try {
    // Load ONLY models that are actually available via Inference Providers API
    const hfModels = await loadModelsFromHuggingFace()
    
    if (hfModels && hfModels.length > 0) {
      availableModels.value = hfModels
      filteredModels.value = hfModels
      console.log('Loaded', hfModels.length, 'models from Inference Providers API')
      
      // Select first model if none selected
      if (!selectedModel.value) {
        selectedModel.value = hfModels[0].value
        console.log('Auto-selected model:', selectedModel.value)
      }
    } else {
      console.error('No models available from Inference Providers API')
      availableModels.value = []
      filteredModels.value = []
    }
  } catch (error) {
    console.error('Failed to load models:', error)
    availableModels.value = []
    filteredModels.value = []
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
  
  if (!API_TOKEN.value || !hfClient) {
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
  userInput.value = ''
  
  if (inputField.value) {
    inputField.value.style.height = 'auto'
  }
  
  await nextTick()
  scrollToBottom()

  isLoading.value = true

  try {
    // Build conversation history with system prompt
    const conversationMessages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Format your responses using markdown syntax directly (headings, lists, code blocks, etc.). Do NOT wrap your markdown in code blocks - use markdown formatting naturally in your response.'
      },
      ...messages.value.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    console.log('Sending request with model:', selectedModel.value)
    console.log('Messages:', conversationMessages)
    console.log('Using token:', API_TOKEN.value.substring(0, 10) + '...')

    // Use HfInference chatCompletion method with auto provider selection
    const completion = await hfClient.chatCompletion({
      model: selectedModel.value,
      messages: conversationMessages,
      max_tokens: 512,
      temperature: 0.7,
      top_p: 0.95
    })
    
    console.log('Received completion:', completion)
    
    const assistantText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

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
    console.error('Chat error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    if (error.response) {
      console.error('Error response status:', error.response.status)
      console.error('Error response body:', error.response.body)
      console.error('Error response headers:', error.response.headers)
    }
    if (error.request) {
      console.error('Error request:', error.request)
    }
    
    let errorMessage = ''
    
    // Handle different error types from @huggingface/inference
    if (error.name === 'InferenceClientInputError') {
      // Model doesn't support the task or provider issue
      if (error.message.includes('not supported for task')) {
        const match = error.message.match(/Supported task: (\w+)/)
        const supportedTask = match ? match[1] : 'unknown'
        
        if (supportedTask === 'conversational') {
          errorMessage = `⚠️ This model requires conversational API. Retrying with correct method...`
          // The error already tells us to use conversational, so we know chatCompletion should work
          errorMessage = `⚠️ Model configuration issue. Try selecting a different model from the dropdown.`
        } else {
          errorMessage = `⚠️ Model ${selectedModel.value} doesn't support chat. Supported task: ${supportedTask}\n\nPlease select a different model from the dropdown.`
        }
      } else if (error.message.includes('No Inference Provider available')) {
        errorMessage = `⚠️ No inference provider available for this model.\n\nPlease select a different model from the dropdown.`
      } else {
        errorMessage = `⚠️ Input error: ${error.message}`
      }
    } else if (error.name === 'InferenceClientProviderApiError') {
      // Provider API errors
      if (error.message.includes('loading')) {
        errorMessage = `⏳ Model is loading... This can take 20-30 seconds. Please try again in a moment.`
      } else if (error.message.includes('rate limit')) {
        errorMessage = `⚠️ Rate limit exceeded. Please wait a moment and try again.`
      } else if (error.message.includes('HTTP error')) {
        errorMessage = `⚠️ Provider API error. The model might not be available or configured correctly.\n\nTry one of these models:\n- Qwen/Qwen2.5-7B-Instruct-1M\n- meta-llama/Llama-3.2-3B-Instruct\n\nError: ${error.message}`
      } else {
        errorMessage = `⚠️ Provider error: ${error.message}`
      }
    } else if (error.name === 'InferenceClientHubApiError') {
      // Hub API errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = `⚠️ Authentication error. Your API token needs "Inference Providers" permission.\n\n1. Go to https://huggingface.co/settings/tokens\n2. Create a new token\n3. Enable "Inference Providers" permission\n4. Clear your current token and enter the new one`
      } else if (error.response?.status === 404) {
        errorMessage = `⚠️ Model not found.\n\nPlease select a different model from the dropdown.`
      } else {
        errorMessage = `⚠️ Hub API error: ${error.message}`
      }
    } else if (error.name === 'InferenceClientProviderOutputError') {
      errorMessage = `⚠️ Provider returned unexpected output. Try a different model.`
    } else {
      // Generic error handling - check if it might be a token permission issue
      if (error.message.includes('HTTP error') || error.message.includes('400')) {
        errorMessage = `⚠️ Request failed. This might be due to:\n\n1. Token missing "Inference Providers" permission\n   → Go to https://huggingface.co/settings/tokens\n   → Create new token with "Inference Providers" enabled\n\n2. Model not available via Inference Providers\n   → Select a different model from the dropdown\n\n3. Monthly quota exceeded\n   → Check your usage at https://huggingface.co/settings/billing`
      } else {
        errorMessage = `Error: ${error.message || 'Unknown error occurred'}\n\nPlease select a different model from the dropdown.`
      }
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
/* Import highlight.js theme */
@import 'highlight.js/styles/github-dark.css';

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

/* Markdown content styling */
.markdown-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content :deep(h1) { font-size: 1.5rem; }
.markdown-content :deep(h2) { font-size: 1.25rem; }
.markdown-content :deep(h3) { font-size: 1.125rem; }

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(code) {
  background: var(--bg-tertiary, #21262d);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.875em;
  font-family: 'Courier New', Courier, monospace;
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
  border-radius: 0;
  font-size: 0.875rem;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--border-primary, #30363d);
  padding-left: 1rem;
  margin-left: 0;
  margin-bottom: 1rem;
  color: var(--text-secondary, #7d8590);
}

.markdown-content :deep(a) {
  color: var(--accent-blue, #58a6ff);
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1rem;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-primary, #30363d);
  padding: 0.5rem;
  text-align: left;
}

.markdown-content :deep(th) {
  background: var(--bg-tertiary, #21262d);
  font-weight: 600;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-primary, #30363d);
  margin: 1.5rem 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.5rem 0;
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
