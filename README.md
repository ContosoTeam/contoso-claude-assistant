# Contoso Claude Assistant

An internal Q&A assistant powered by Azure Claude (Anthropic on Azure) for enterprise knowledge management.

## Features
- Natural language Q&A with Claude 3 Sonnet
- Document upload and indexing
- Conversation history with MongoDB
- JWT-based authentication
- Template rendering for reports

## Setup

```bash
npm install
npm start
```

## API
- `POST /api/chat` - Chat with the assistant
- `POST /api/upload` - Upload documents
- `GET /api/conversations` - List conversations
- `POST /api/token` - Get auth token

## License
MIT
