# Lumine - Agent System UI Frontend

A modern, responsive frontend interface for agent systems built with Next.js 16, React 19, and TypeScript.

## Project Description

Lumine is a PPT/Video Knowledge Creation Tool that provides a polished chat interface for interacting with AI agent systems. It features real-time streaming responses, thread management, authentication, and extensible tool integration capabilities.

This project is based on the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project and serves as the frontend implementation for an agent system (agent code is provided in a separate repository).

## Features

### Core Functionality
- **Modern Chat Interface**: Built with `@assistant-ui/react` for a seamless chat experience
- **Real-time Streaming**: WebSocket-based streaming support with AgentOS integration
- **Thread Management**: Create, manage, and switch between conversation threads
- **Authentication System**: User authentication with login/logout functionality
- **Tool Integration**: Extensible tool system with custom UI components
- **Responsive Design**: Mobile-friendly interface with sidebar navigation

### Advanced Features
- **Markdown Rendering**: Rich text rendering with GitHub Flavored Markdown (GFM) support
- **Custom Runtimes**: Flexible backend integration via Vercel AI SDK
- **Knowledge Base Integration**: Search and display results from external knowledge sources
- **Todo List Integration**: Task management visualization within chat context
- **Micro-app Support**: Integration with micro-apps for extended functionality

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.1.3 |
| **UI Library** | React | 19.2.3 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS | 4 |
| **State Management** | Zustand | 5.0.10 |
| **AI Integration** | Vercel AI SDK | 5.0.121 |
| **Chat UI** | @assistant-ui/react | 0.11.56 |
| **HTTP Client** | Axios | 1.13.2 |
| **Animations** | Framer Motion | 12.27.0 |
| **Icons** | Lucide React | 0.562.0 |

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn/bun
- Backend agent system running on `ws://localhost:10338` (or configured via `AGENT_WS_URL`)
- API proxy target on `http://127.0.0.1:8989`

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# or npm install
# or yarn install
# or bun install
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Google Generative AI API Key (for AI functions)
GOOGLE_GENERATIVE_AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Agent WebSocket URL
AGENT_WS_URL=ws://localhost:10338/agentOS/v1/ws_stream

# Additional configuration
```

### Development

```bash
# Start development server on port 2311
pnpm dev

# The application will be available at http://localhost:2311
```

The development server uses Turbopack for faster builds:

```bash
# With Turbopack (default)
pnpm dev

# Without Turbopack
next dev -p 2311
```

## API Proxy Configuration

The application includes built-in API proxying configured in `next.config.ts`:

```typescript
rewrites() {
  return [
    {
      source: '/proxyUrl/:path*',
      destination: 'http://127.0.0.1:8989/:path*',
    },
    {
      source: '/authApi/:path*',
      destination: 'https://ws.ecs32.top/hyancie/api/v1/:path*',
    },
  ]
}
```

## Project Structure

```
lumine/
├── app/
│   ├── assistant.tsx          # Main assistant component with chat interface
│   ├── page.tsx               # Root page
│   ├── layout.tsx             # App layout
│   ├── globals.css            # Global styles and Tailwind configuration
│   └── micro-app.d.ts         # Micro-app TypeScript definitions
├── components/
│   ├── assistant-ui/          # Chat UI components
│   │   ├── thread.tsx         # Thread display and message rendering
│   │   ├── thread-list.tsx    # Thread list sidebar
│   │   ├── threadlist-sidebar.tsx  # Thread list sidebar with auth
│   │   ├── markdown-text.tsx  # Markdown renderer
│   │   ├── tool-uis.tsx       # Custom tool UIs (Todo, Knowledge Base)
│   │   ├── todo-list.tsx      # Todo list component
│   │   └── reasoning.tsx      # AI reasoning display
│   ├── auth/                  # Authentication components
│   │   ├── auth-dialog.tsx    # Login dialog
│   │   ├── auth-hydrator.tsx  # Auth state hydration
│   │   └── user-footer.tsx    # User information footer
│   └── ui/                    # Base UI components (shadcn/ui)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── ...
├── service/
│   ├── agentStream.ts         # WebSocket streaming for agent communication
│   ├── auth.ts                # Authentication API service
│   ├── createScript.ts        # Script creation service
│   ├── knowledgeBase.ts       # Knowledge base interactions
│   └── index.ts               # Axios API client configuration
├── lib/
│   ├── store/
│   │   └── auth-store.ts      # Zustand authentication store
│   ├── chat/
│   │   └── custom-chat-transport.ts  # Custom chat transport layer
│   └── utils.ts               # Utility functions
├── hooks/
│   └── use-mobile.ts          # Mobile detection hook
└── next.config.ts             # Next.js configuration
```

## Key Features Explained

### Authentication System

The application includes a complete authentication system:

```typescript
// State management via Zustand
import { useAuthStore } from '@/lib/store/auth-store';

const { isLoggedIn, setAuth, clearAuth } = useAuthStore();

// Login
setAuth(token, user);

// Logout
clearAuth();

// Automatic session hydration on app load
// Sessions persist in localStorage
```

### Agent Integration

The app connects to AgentOS via WebSocket for streaming responses:

```typescript
import { streamAgentMessage } from '@/service/agentStream';

streamAgentMessage(
  "Your message here",
  userToken,
  {
    onSessionId: (id, conversationId) => console.log("Session:", id),
    onTextDelta: (text) => console.log("Text:", text),
    onDone: () => console.log("Completed"),
    onError: (err) => console.error(err),
  }
);
```

### Thread Management

- Create new conversation threads
- Switch between existing threads
- Persistent thread history
- Thread metadata management

### Custom Tools

The application supports custom tool UIs:

- **Todo List**: Task management visualization
- **Knowledge Base Search**: Search and display results
- Extendable tool system via `makeAssistantToolUI`

## API Client

The application uses a custom Axios instance with interceptors configured in `service/index.ts`:

- Automatic token injection from localStorage
- GET request caching prevention
- Empty parameter cleanup
- Unified error handling
- Request/response logging
- 6-minute timeout for long-running operations

```typescript
import { requestInstance } from '@/service/index';

// All API calls automatically include auth token
requestInstance.get('/endpoint')
```

## Building

```bash
# Create production build
pnpm build

# Output will be in .next/
```

## Production Deploy

Need to use PM2 for process management:

```bash
# Start with PM2
pm2 start npm --name "ai-frontend" -- start

# Or start directly with Next.js
pm2 start npx --name "ai-frontend" -- next start -p 2311

# View logs
pm2 logs ai-frontend

# Restart
pm2 restart ai-frontend

# Stop
pm2 stop ai-frontend
```

## Code Quality

```bash
# Run ESLint
pnpm lint

# Format code with Prettier
pnpm prettier:fix

# Check code formatting
pnpm prettier

# Type checking (via TypeScript)
npx tsc --noEmit
```

## Prettier Configuration

The project uses Prettier with Tailwind CSS plugin:

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "app/globals.css"
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with modern JavaScript support

## Troubleshooting

### WebSocket Connection Issues

If you experience WebSocket connection problems:

1. Verify `AGENT_WS_URL` is correctly set
2. Check that the agent backend is running
3. Ensure no firewall is blocking the connection
4. Check browser console for specific error messages

### Authentication Issues

If login/session persistence fails:

1. Check localStorage is enabled
2. Verify API proxy endpoints are correct
3. Check browser console for network errors
4. Clear browser cache and try again

### Module Resolution

If you encounter module import issues:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear Next.js cache
rm -rf .next
pnpm dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow conventional commits:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## License

This project is private.

## Support

For issues and questions, please contact the development team.

## Roadmap

- [ ] Enhanced mobile responsiveness
- [ ] Additional tool integrations
- [ ] Voice input/output support
- [ ] Enhanced security features
- [ ] Performance optimizations
- [ ] Comprehensive testing suite

---

Built with ❤️ using Next.js, React, and TypeScript
