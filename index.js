
const express = require('express');
const https = require('https');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Helper function to make HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// ChatGPT-like API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, prompt } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Construct the prompt for Pollinations AI
    const fullPrompt = prompt ? `${prompt}\n\nUser: ${message}\nAssistant:` : `User: ${message}\nAssistant:`;
    const encodedPrompt = encodeURIComponent(fullPrompt);
    
    // Make request to Pollinations AI
    const url = `https://text.pollinations.ai/${encodedPrompt}`;
    const response = await makeRequest(url);
    
    res.json({
      success: true,
      message: message,
      response: response.trim(),
      Credits: 'Bucu0368'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Simple GET endpoint for testing
app.get('/api/chat', async (req, res) => {
  try {
    const message = req.query.message || 'hello';
    const encodedPrompt = encodeURIComponent(`User: ${message}\nAssistant:`);
    
    const url = `https://text.pollinations.ai/${encodedPrompt}`;
    const response = await makeRequest(url);
    
    res.json({
      success: true,
      message: message,
      response: response.trim(),
      Credits: 'Bucu0368'
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ChatGPT API using Pollinations AI',
    endpoints: {
      'GET /api/chat?message=hello': 'Simple chat endpoint',
      'POST /api/chat': 'Chat endpoint with body { "message": "your message", "prompt": "optional system prompt" }'
    },
    example: {
      url: '/api/chat?message=hello',
      post_body: {
        message: 'What is the weather like?',
        prompt: 'You are a helpful assistant.'
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ChatGPT API server running on port ${PORT}`);
  console.log(`Try: GET /api/chat?message=hello`);
});
