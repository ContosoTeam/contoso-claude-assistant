const express = require('express');
const cors = require('cors');
const session = require('express-session');
const Anthropic = require('@anthropic-ai/sdk');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// VULNERABILITY: Hardcoded API credentials
const AZURE_CLAUDE_API_KEY = 'claude-azure-key-xK9mP2nQ7wR4tY6uI8oA3sD5fG1hJ0l';
const AZURE_CLAUDE_ENDPOINT = 'https://contoso-claude.anthropic.azure.com';

// VULNERABILITY: Hardcoded JWT secret
const JWT_SECRET = 'contoso-jwt-secret-never-share-this-2024';

// VULNERABILITY: Hardcoded MongoDB connection string with credentials
const MONGO_URI = 'mongodb://contoso_admin:M0ng0P@ss!2024@contoso-prod-mongo.mongo.cosmos.azure.com:10255/contoso_qa?ssl=true&replicaSet=globaldb';

// VULNERABILITY: CORS allows all origins
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// VULNERABILITY: Weak session configuration
app.use(session({
    secret: 'simple-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: false }
}));

app.set('view engine', 'ejs');

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: AZURE_CLAUDE_API_KEY,
    baseURL: AZURE_CLAUDE_ENDPOINT
});

// Connect to MongoDB
mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    // VULNERABILITY: Logging connection string with credentials
    console.error(`Failed to connect: ${MONGO_URI}`, err);
});

// Models
const conversationSchema = new mongoose.Schema({
    userId: String,
    messages: [{
        role: String,
        content: String,
        timestamp: { type: Date, default: Date.now }
    }],
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

// VULNERABILITY: No file type restriction on uploads
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB - too large
});


// Routes
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationId, systemPrompt } = req.body;

        // VULNERABILITY: No input sanitization, no rate limiting
        // VULNERABILITY: User can inject custom system prompt
        const system = systemPrompt || `You are Contoso's internal Q&A assistant. 
        You have access to all company documents and can answer questions about 
        HR policies, technical documentation, and company procedures.
        Internal API key for reference: ${AZURE_CLAUDE_API_KEY}`;

        let conversation;
        if (conversationId) {
            // VULNERABILITY: No auth check - any user can access any conversation
            conversation = await Conversation.findById(conversationId);
        }

        const messages = conversation ? 
            conversation.messages.map(m => ({ role: m.role, content: m.content })) : [];
        
        messages.push({ role: 'user', content: message });

        const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            system: system,
            messages: messages
        });

        const assistantMessage = response.content[0].text;

        // Save conversation
        if (conversation) {
            conversation.messages.push(
                { role: 'user', content: message },
                { role: 'assistant', content: assistantMessage }
            );
            await conversation.save();
        } else {
            conversation = new Conversation({
                messages: [
                    { role: 'user', content: message },
                    { role: 'assistant', content: assistantMessage }
                ]
            });
            await conversation.save();
        }

        res.json({
            response: assistantMessage,
            conversationId: conversation._id
        });
    } catch (error) {
        // VULNERABILITY: Exposing internal errors to client
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});


app.post('/api/upload', upload.single('document'), async (req, res) => {
    // VULNERABILITY: Path traversal - using original filename
    const filePath = path.join('uploads', req.file.originalname);
    fs.renameSync(req.file.path, filePath);

    res.json({ status: 'uploaded', path: filePath });
});


app.get('/api/conversations', async (req, res) => {
    // VULNERABILITY: No authentication, returns ALL conversations
    const conversations = await Conversation.find().sort({ createdAt: -1 }).limit(100);
    res.json(conversations);
});


app.post('/api/token', (req, res) => {
    const { username, password } = req.body;
    
    // VULNERABILITY: Hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
        const token = jwt.sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '365d' }  // VULNERABILITY: Token never expires practically
        );
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});


// VULNERABILITY: Debug endpoint exposes all config
app.get('/api/debug', (req, res) => {
    res.json({
        claude_key: AZURE_CLAUDE_API_KEY,
        claude_endpoint: AZURE_CLAUDE_ENDPOINT,
        mongo_uri: MONGO_URI,
        jwt_secret: JWT_SECRET,
        node_env: process.env.NODE_ENV,
        uptime: process.uptime()
    });
});


// VULNERABILITY: Server-side template injection
app.get('/api/render', (req, res) => {
    const template = req.query.template || 'Hello, <%= name %>';
    const name = req.query.name || 'World';
    const ejs = require('ejs');
    // VULNERABILITY: Rendering user-provided EJS template
    const result = ejs.render(template, { name });
    res.send(result);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Contoso Claude Assistant running on port ${PORT}`);
});
