# CORS Workaround for Chat Feature

## Problem

The Hugging Face Inference API does not support CORS (Cross-Origin Resource Sharing) for browser requests. This means direct API calls from the browser are blocked by the browser's security policy.

## Solutions

### Option 1: Browser Extension (Development/Testing Only)

Install a CORS browser extension to bypass CORS restrictions during development:

**Chrome/Edge:**
- [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino)
- [Allow CORS](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)

**Firefox:**
- [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

⚠️ **Warning:** Only use these extensions for development. Disable them when browsing other sites for security.

### Option 2: Backend Proxy (Recommended for Production)

Create a simple backend proxy that forwards requests to Hugging Face:

**Example with Node.js/Express:**

```javascript
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/inference/:model', async (req, res) => {
  const { model } = req.params;
  const token = req.headers.authorization;
  
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
```

Then update the fetch URL in `src/views/Bot.vue` to use your proxy:
```javascript
const response = await fetch(
  `http://your-backend.com/api/inference/${selectedModel.value}`,
  // ... rest of the config
)
```

### Option 3: Hugging Face Inference Endpoints

Use [Hugging Face Inference Endpoints](https://huggingface.co/inference-endpoints) which support CORS configuration:

1. Create an Inference Endpoint on Hugging Face
2. Enable CORS in the endpoint settings
3. Update the API URL in the code

### Option 4: Serverless Function

Deploy a serverless function (Vercel, Netlify, AWS Lambda) as a proxy:

**Example with Vercel:**

Create `api/inference.js`:
```javascript
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { model } = req.query;
  const token = req.headers.authorization;
  
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    }
  );
  
  const data = await response.json();
  res.json(data);
}
```

## Current Status

The chat feature is functional but requires one of the above solutions to work in a browser environment. The code includes helpful error messages to guide users.
