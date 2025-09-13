# Overview

HicaperaMLM is a decentralized finance (DeFi) multi-level marketing platform built on blockchain technology. The application enables users to make investments in USDT and earn returns through a tiered profit system while also earning referral commissions from their network. The platform features a React frontend with a Node.js/Express backend, PostgreSQL database with Drizzle ORM, and smart contract integration for handling investments and rewards distribution.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions and effects
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with JSON responses
- **Request Handling**: Express middleware for parsing JSON and URL-encoded data
- **Error Handling**: Centralized error handling middleware
- **Development**: Hot reload with tsx for development server

## Database Layer
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Neon serverless PostgreSQL for cloud deployment
- **Schema**: Structured tables for users, investments, earnings, and referrals
- **Storage Pattern**: In-memory storage implementation for development with interface for production database integration

## Web3 Integration
- **Library**: Web3.js for blockchain interaction
- **Wallet**: MetaMask integration for user authentication and transaction signing
- **Smart Contract**: Custom MLM contract with investment, referral, and earnings distribution logic
- **Token**: USDT (Tether) integration for investments and rewards
- **Security**: Transaction deadline protection, safe math operations, and reentrancy guards

## Authentication & Security
- **Wallet-Based Auth**: Users authenticate using their Web3 wallet addresses
- **Session Management**: Stateless authentication using wallet signatures
- **Input Validation**: Zod schemas for runtime type checking and validation
- **CORS**: Cross-origin resource sharing configured for frontend-backend communication

## Development Workflow
- **Monorepo Structure**: Shared types and schemas between client and server
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Asset Management**: Static asset serving with proper caching headers
- **Environment**: Development and production build configurations
- **Path Aliases**: Configured import aliases for cleaner module resolution

# External Dependencies

## Blockchain Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **MetaMask**: Browser wallet for Web3 transactions and user authentication
- **Ethereum Network**: Blockchain network for smart contract deployment and execution
- **USDT Contract**: Tether token contract for handling stable coin transactions

## UI Component Library
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide Icons**: Modern icon library for consistent visual elements
- **Google Fonts**: Web fonts (Inter, JetBrains Mono) for typography

## Development Tools
- **Replit Integration**: Development environment plugins for runtime error handling and cartographer debugging
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer plugins
- **ESBuild**: Fast JavaScript bundler for server-side code compilation

## Third-Party Services
- **Web3 Provider**: Ethereum JSON-RPC provider for blockchain communication
- **Font Services**: Google Fonts CDN for web typography delivery
- **Static Assets**: File storage for uploaded documents and media assets