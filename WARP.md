# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Vita Navigator is a wellness tracking application built for the Lovable platform. It's a React-based progressive web app focused on health and fitness tracking with gender-specific features, personalized onboarding, and comprehensive wellness dashboard.

**Key Technologies:**
- Vite + React 18 + TypeScript
- shadcn/ui + Radix UI components
- Tailwind CSS with custom wellness theme
- React Router for navigation
- TanStack React Query for state management
- Lovable platform integration

## Common Development Commands

### Development Server
```bash
# Start development server on port 8080
npm run dev

# Alternative using bun (if available)
bun dev
```

### Build Commands
```bash
# Production build
npm run build

# Development build (useful for debugging)
npm run build:dev

# Preview production build
npm run preview
```

### Code Quality
```bash
# Run ESLint
npm run lint

# TypeScript type checking (project uses project references)
npx tsc --noEmit
```

### Package Management
```bash
# Install dependencies
npm install

# Alternative with bun
bun install
```

## Application Architecture

### State Flow Architecture
The application follows a three-stage user flow managed by the `WellnessApp` component:

1. **Authentication** (`LoginForm`) - Email/password login with mock authentication
2. **Onboarding** (`OnboardingStepper`) - 4-step personalized setup process
3. **Dashboard** (`WellnessDashboard`) - Main wellness tracking interface

### Core Components Structure

```
src/
├── components/
│   ├── WellnessApp.tsx           # Main app state orchestrator
│   ├── LoginForm.tsx             # Authentication interface
│   ├── OnboardingStepper.tsx     # Multi-step user setup
│   ├── WellnessDashboard.tsx     # Main application dashboard
│   └── ui/                       # shadcn/ui components
├── pages/
│   ├── Index.tsx                 # Main page (renders WellnessApp)
│   └── NotFound.tsx             # 404 page
└── lib/
    └── utils.ts                  # Utility functions
```

### Design System & Styling

The app uses a custom wellness-focused design system built on Tailwind CSS:

- **Primary Color:** Custom wellness blue (`--wellness-blue: 214 100% 58%`)
- **Custom Classes:** `.wellness-card`, `.wellness-input`, `.wellness-button-*`
- **Theme:** Clean, modern blue and white with dark mode support
- **Components:** Extensive use of Radix UI primitives via shadcn/ui

Key CSS variables are defined in `src/index.css` with wellness-specific color palette.

### Gender-Specific Features

The application dynamically adapts based on user gender:

**For Female Users:**
- Additional goals: "Menstrual Health", "PCOD Care", "Post-pregnancy Recovery"
- Period tracking functionality with cycle information
- Specialized workout recommendations for hormonal balance

**For Male Users:**
- Goals focused on: "Muscle Gain", "Endurance", strength training
- Age-appropriate workout recommendations

### Data Structure

**User Data Interface:**
```typescript
interface UserData {
  email: string;
  name?: string;
  age?: number;
  gender?: "male" | "female";
  weight?: number;
  height?: number;
  goals?: string[];
  preferences?: {
    activityType: string;
    timePerDay: number;
    dietPreference: string;
  };
}
```

## Development Guidelines

### Component Patterns
- Use functional components with React hooks
- Leverage TypeScript for type safety (with relaxed settings in tsconfig.json)
- Follow shadcn/ui patterns for consistent UI components
- Use the custom wellness CSS classes for consistent styling

### State Management
- Local component state for UI interactions
- React Query for server state (when applicable)
- Context for app-wide state (authentication, user data)

### Styling Approach
- Tailwind CSS utility classes
- Custom wellness design system classes
- CSS variables for themeable colors
- Responsive design with mobile-first approach

### File Organization
- Components in `/components` directory
- Pages in `/pages` directory
- Utilities in `/lib` directory
- Assets in `/assets` directory (if added)

## Lovable Platform Integration

This project is integrated with Lovable (lovable.dev):
- Auto-deployment on git pushes
- Development via Lovable web interface
- `lovable-tagger` plugin for component tagging in development mode
- Project URL: https://lovable.dev/projects/95339d8f-7dbd-467b-b90c-0fab50378575

### Deployment
Deploy through Lovable interface: Project > Settings > Share > Publish

## Important Notes

- The app runs on port 8080 in development (configured in vite.config.ts)
- ESLint is configured with React-specific rules but unused variables warnings are disabled
- TypeScript is configured with relaxed settings for rapid prototyping
- No test framework is currently configured
- The project uses bun lockfile but npm is also supported