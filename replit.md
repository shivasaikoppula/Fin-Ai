# Finance AI Platform

## Overview

Finance AI is a privacy-first personal finance management platform that provides intelligent transaction analysis, fraud detection, budgeting tools, financial health scoring, and investment insights. The application combines rule-based algorithms with AI-powered features to help users understand and optimize their financial health.

The platform supports multiple transaction import methods (CSV uploads, manual entry), automatically categorizes expenses, detects potentially fraudulent transactions in real-time, and provides actionable recommendations for budgeting, tax optimization, and savings goals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with TypeScript**: Component-based UI using functional components and hooks
- **Vite**: Fast development server and optimized production builds
- **Wouter**: Lightweight client-side routing (replacing React Router)
- **TanStack Query (React Query)**: Server state management, caching, and data synchronization

**UI Component System**
- **Shadcn/ui**: Headless component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Design System**: Professional financial UI inspired by Stripe, Plaid, and Mercury
  - Typography: Inter (body), DM Sans (headings), Roboto Mono (financial figures)
  - Color scheme: Neutral-based with custom HSL variables for dark/light modes
  - Component patterns: Cards, metric displays, data tables, alerts

**State Management Pattern**
- Server state managed via React Query with automatic caching and invalidation
- Local UI state via React hooks (useState, useReducer)
- No global state management library (Redux/Zustand) - leveraging React Query for data fetching

### Backend Architecture

**Runtime & Framework**
- **Node.js with TypeScript**: ESM module system
- **Express.js**: RESTful API server with middleware pipeline
- **Development/Production Split**: Separate entry points (index-dev.ts, index-prod.ts)

**API Design**
- RESTful endpoints organized by resource (transactions, budgets, goals, financial-health)
- Request validation using Zod schemas from shared schema definitions
- JSON request/response format
- File upload support via Multer (CSV transaction imports)

**Core Business Logic Modules**
- **Fraud Detection** (`fraud-detection.ts`): Rule-based fraud scoring system
  - Velocity checks (transaction frequency)
  - Amount thresholds (large/suspicious transactions)
  - Risk scoring (0-100 scale)
  - Real-time and batch processing capabilities
  
- **Financial Health Scoring** (`financial-health.ts`): Composite scoring algorithm
  - Income stability assessment
  - Expense ratio calculation
  - Savings rate tracking
  - Debt ratio evaluation
  - Liquidity scoring
  - Weighted composite score (0-100)

- **Transaction Categorization**: Merchant name pattern matching for automatic expense categorization

### Data Storage

**Database Strategy**
- **Drizzle ORM**: Type-safe database queries with schema-first approach
- **PostgreSQL** (via Neon serverless): Production database
- **In-Memory Storage** (`storage.ts`): Development/testing fallback with full IStorage interface implementation
- **Schema Definition** (`shared/schema.ts`): Single source of truth for data models

**Data Models**
- **Users**: Authentication, profile data, monthly income tracking
- **Transactions**: Date, amount, merchant, category, type (income/expense/transfer), fraud flags
- **Budgets**: Category-based spending limits with periods (monthly/weekly/yearly)
- **Goals**: Savings targets with current amounts, deadlines, and goal types
- **Financial Health**: Cached health scores with component breakdowns

**Database Migrations**
- Drizzle Kit for schema migrations (`drizzle.config.ts`)
- Migration files stored in `/migrations` directory
- Push-based deployment workflow

### Authentication & Security

**Current Implementation**
- Demo user mode ("demo-user" userId hardcoded in frontend)
- Session-based authentication foundation (connect-pg-simple for session storage)
- HTTPS-ready (credentials: "include" for secure cookie transmission)

**Security Considerations**
- Input validation via Zod schemas
- Raw body capture for webhook verification potential
- CORS and security headers ready for configuration
- Privacy-first design (local processing, minimal data sharing)

### File Processing

**CSV Transaction Import**
- Multer middleware for multipart form uploads
- csv-parse library for parsing uploaded bank statements
- Automatic merchant name normalization
- Category inference during import
- Bulk transaction creation with fraud detection

## External Dependencies

### Database & Infrastructure
- **Neon (PostgreSQL)**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Database toolkit and migration system

### UI Component Libraries
- **Radix UI**: Accessible headless component primitives (20+ components)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for runtime type safety

### Utilities
- **date-fns**: Date manipulation and formatting
- **csv-parse**: CSV file parsing for transaction imports
- **nanoid**: Unique ID generation
- **clsx & tailwind-merge**: Conditional className utilities

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type checking and compilation
- **ESBuild**: Production bundler for backend
- **Replit Plugins**: Development tooling (runtime error overlay, cartographer, dev banner)

### Planned Integrations (Architecture Ready)
- Banking APIs (Plaid-style connectors referenced in requirements)
- UPI/Payment gateway integrations (mentioned in transaction ingestion)
- Tax calculation APIs (country-specific rules)
- Investment portfolio analysis tools