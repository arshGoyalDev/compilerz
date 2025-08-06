# Compilerz
 
 A online compiler to compile code in 8 different languages without going through the hassle of a local setup 
## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Express** - Fast, unopinionated web framework
- **Turborepo** - Optimized monorepo build system
- **Codemirror** - Code editor UI and extensions for different languages
- **Docker** - For running container for different languages

## Supported Languages

<img src="https://skillicons.dev/icons?i=c,cpp,python,rust,javascript,typescript,go,java,ruby" />

## Getting Started

- First, install the dependencies:

```bash
pnpm install
```
- Make sure docker is running in the background

- Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:8000](http://localhost:8000).

## Project Structure

```
online-compiler/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Express)
```

## Available Scripts

- `pnpm dev`: Start all applications in development mode
- `pnpm build`: Build all applications
- `pnpm dev:web`: Start only the web application
- `pnpm dev:server`: Start only the server
- `pnpm check-types`: Check TypeScript types across all apps
