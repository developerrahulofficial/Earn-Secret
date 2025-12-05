# Connect the Dots - Viral 2-Player Game

## Overview

Connect the Dots is a real-time multiplayer web game where two players collaboratively connect hidden dots to reveal a secret shape, text, or image. One player creates a hidden pattern (by typing text, drawing, or uploading an image), which is converted into 150-300 shuffled dots. Both players then take turns connecting dots one at a time, gradually revealing the secret in a magical, suspenseful reveal experience.

The game is designed with viral shareability in mind, featuring a cute, minimal aesthetic inspired by games like Wordle and Connections. The experience emphasizes emotional resonance through soft visuals, celebration-focused animations, and an intimate two-player collaborative gameplay mechanic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, providing a lightweight alternative to React Router. Main routes include:
- Home page (`/`) - Player name entry and mode selection
- Create room (`/create`) - Shape/text creation for Player 2
- Join room (`/join/:code`) - Waiting room for Player 1
- Game canvas (`/game/:code`) - Main gameplay interface

**UI Component System**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components. The design system uses:
- DM Sans as the primary font family for clean, modern typography
- Fredoka as the display/accent font for playful moments
- Custom color scheme with game-specific colors (dots, connections, canvas)
- Tailwind CSS for styling with custom spacing units (4, 8, 12, 16, 24)
- Responsive design with mobile-first approach

**State Management**: React hooks for local state, TanStack Query for server state management. WebSocket connection state is managed through a custom `useWebSocket` hook that maintains connection status, room data, and player information.

**Real-time Communication**: WebSocket-based real-time synchronization between players. The `useWebSocket` hook handles connection lifecycle, message parsing, and room state updates. Messages are typed using shared TypeScript interfaces defined in `@shared/schema`.

**Game Canvas**: HTML5 Canvas API for rendering dots, connections, and reveal animations. The canvas supports:
- Dynamic sizing based on viewport
- Touch and mouse interaction
- Pan and zoom capabilities
- Animated reveals with confetti and sparkles

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript support via tsx for development.

**WebSocket Server**: ws library integrated with the HTTP server to provide real-time bidirectional communication. The WebSocket server handles:
- Room creation and management
- Player connections and disconnections
- Turn-based gameplay logic
- Dot connection validation
- Game state synchronization

**Game Logic**: In-memory game state management using Map data structures. The `server/game.ts` module maintains:
- Active rooms with unique 6-character codes
- Player information and socket connections
- Dot placement and connection tracking
- Turn rotation and game status

**Session Management**: Game sessions are managed in-memory without persistent storage. Each player receives a unique ID, and rooms exist only while players are connected.

**API Design**: The system uses WebSocket messages for all real-time interactions rather than REST endpoints. Message types include:
- `create_room` - Initialize new game room
- `join_room` - Connect player to existing room
- `setup_game` - Submit shape/text data
- `connect_dot` - Player move action
- Room state broadcasts to all connected players

### Data Storage Solutions

**Current Implementation**: In-memory storage using JavaScript Map objects for:
- Game rooms (`Map<string, GameRoom>`)
- Player data (`Map<string, Player>`)
- WebSocket connections (`Map<string, WebSocket>`)

**Database Configuration**: Drizzle ORM is configured with PostgreSQL support (see `drizzle.config.ts`) but not currently utilized. The schema is defined in `shared/schema.ts` using Zod for validation.

**Data Models**:
- `Dot`: Individual points with position, reveal/connection status, and strategy weight
- `GameRoom`: Room state including players, dots, connections, and game status
- `Player`: Player identity, room association, and host status

**Future Considerations**: The application is structured to support database persistence through Drizzle ORM when needed. Room history, player statistics, and shape templates could be persisted to PostgreSQL.

### Authentication and Authorization

**Current Implementation**: Simple session-based player identification without formal authentication. Players provide a display name when creating or joining rooms.

**Session Storage**: Player names are stored in browser sessionStorage to persist across page refreshes within the same session.

**Room Access Control**: Rooms are accessed via 6-character codes. No password protection is implemented - anyone with the room code can join.

**Future Enhancement**: The codebase includes unused authentication infrastructure (`server/storage.ts` with user management) that could be activated for registered accounts and saved game history.

### External Dependencies

**UI Libraries**:
- Radix UI - Accessible component primitives (accordions, dialogs, tooltips, etc.)
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Component variant management
- Lucide React - Icon library

**State Management**:
- TanStack Query (React Query) - Server state management and caching
- Wouter - Lightweight client-side routing

**Real-time Communication**:
- ws - WebSocket implementation for Node.js
- Native WebSocket API on the client

**Form Handling**:
- React Hook Form - Form state management
- Zod - Schema validation and type inference
- @hookform/resolvers - Zod integration for React Hook Form

**Development Tools**:
- Vite - Fast development server and build tool
- tsx - TypeScript execution for Node.js
- esbuild - Fast JavaScript bundler for production builds

**Typography**:
- Google Fonts - DM Sans and Fredoka font families

**Database (Configured but Inactive)**:
- Drizzle ORM - Type-safe database toolkit
- PostgreSQL - Relational database (via DATABASE_URL environment variable)

**Build and Deployment**:
- The application builds to a single distributable with client assets in `dist/public` and server code bundled to `dist/index.cjs`
- Development uses separate Vite dev server with HMR
- Production serves static client files through Express