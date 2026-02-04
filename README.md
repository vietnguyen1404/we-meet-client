# WeMeet – Frontend

WeMeet is a browser-based, real-time video meeting web application inspired by Google Meet.

This repository contains the **frontend client** of the WeMeet platform.  
The application is designed to support secure authentication, real-time audio/video meetings, and subscription-based premium features, with a strong focus on performance, scalability, and maintainability.

---

## Overview

WeMeet enables users to:

- Create and join video meeting rooms directly from the browser
- Communicate through real-time audio and video
- Authenticate securely and access protected routes
- Unlock premium (VIP) features such as meeting recording, HD video, and increased participant limits

The frontend is built as a modern Single Page Application (SPA), ready to integrate with real-time signaling and WebRTC-based media services.

---

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **shadcn/ui**
- **TanStack Query**
- **Zustand**
- **pnpm**

---

## Application Architecture

- Single Page Application (SPA)
- Feature-based module organization
- Clear separation between UI, business logic, and data access
- Authentication-aware routing and feature gating
- Real-time–ready state management for meetings and participants

The codebase is structured to support long-term growth without introducing unnecessary complexity.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Install dependencies

```bash
pnpm install
```

The application will be available at:
http://localhost:5173

### Running the development server

```bash
pnpm dev
```

### Building for production

```bash
pnpm build
```

### Previewing the production build

```bash
pnpm preview
```

### Linting and formatting

```bash
pnpm lint
pnpm format
```

### Running tests

```bash
pnpm test
```

### Environment Variables

Create a `.env` file in the root directory and define the following variables:

```env
VITE_API_BASE_URL=<Your API base URL>
VITE_WEBSOCKET_URL=<Your WebSocket URL>
VITE_SENTRY_DSN=<Your Sentry DSN (optional)>
```
