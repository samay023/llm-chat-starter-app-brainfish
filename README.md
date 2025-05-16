# LLM Chat Starter Application

A modern chat application built with React and OpenAI integration.

## Project Structure

The project is organized as a Yarn 4 monorepo with the following structure:

```
llm-chat-starter-app/
├── apps/
│   ├── frontend/     # Vite + React + TypeScript + shadcn
│   └── backend/      # Hono backend with OpenAI integration
```

## Prerequisites

- Node.js (v18 or higher)
- Yarn (v4)
- OpenAI API key

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/brainfish-ai/llm-chat-starter-app.git
cd llm-chat-starter-app
```

2. Install dependencies:

```bash
yarn install
```

3. Set up environment variables:

**Backend**

```bash
# Navigate to the backend directory
cd apps/backend

# Create a .env file
cp .env.example .env

# Add your OpenAI API key to the .env file
```

**Frontend**

```bash
# Navigate to the backend directory
cd apps/backend

# Create a .env file
cp .env.example .env

# Add your OpenAI API key to the .env file
```

4. Start the development servers:

```bash
# From the root directory
yarn dev
```

This will start both the frontend (at http://localhost:5173) and the backend (at http://localhost:3000).

## Testing

The backend uses Vitest for testing. To run tests:

```bash
# Run all tests
yarn test

# Run backend tests only
yarn workspace backend test

# Run tests in watch mode
yarn workspace backend test --watch
```

Note: Frontend tests are not currently set up.

## Technologies Used

- **Frontend**: Vite, React, TypeScript, shadcn UI components
- **Backend**: Hono, Node.js, TypeScript
- **Monorepo**: Yarn 4 workspaces
- **LLM Integration**: OpenAI API

## License

This project is licensed under the MIT License - see the LICENSE file for details.
