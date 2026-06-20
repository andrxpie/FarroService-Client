<div align="center">

# FarroService — Frontend

The client application for booking plumbing & home-maintenance services.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## Overview

FarroService Frontend is a [Next.js](https://nextjs.org/) (App Router) application that serves two audiences:

- **Clients** — browse the service catalog and book an appointment with a master, no account required.
- **Admins & Masters** — log in to a dashboard to manage services, schedules, bookings, and (for admins) user accounts.

The app communicates with the [FarroService Backend](#) over a JWT-authenticated REST API.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/docs) (App Router) |
| UI library | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| State / Auth | React Context API ([`AuthContext`](https://react.dev/reference/react/useContext)) |

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx               # Public page — service catalog + booking form
│   ├── layout.tsx             # Root layout with AuthContext provider
│   └── dashboard/
│       ├── layout.tsx         # Dashboard layout with nav + auth guard
│       ├── page.tsx           # Dashboard overview
│       ├── bookings/          # Booking management
│       ├── schedule/          # Schedule editor
│       ├── services/          # Service management
│       └── users/             # User management (Admin+)
├── components/
│   ├── ui/                    # Badge, Card, Modal, ConfirmModal, Select, Toast
│   ├── guest/                 # ServiceCard, ServiceCatalog, BookingWizard
│   ├── dashboard/              # Tables, filters, editors, managers
│   └── layout/                 # AppShell, Navbar
├── context/
│   └── AuthContext.tsx        # JWT auth state (login / logout / profile update)
├── services/
│   └── authService.ts         # HTTP client for auth endpoints
└── types/
    └── index.ts                # Shared TypeScript types, aligned with the backend
```

## Features

### Public

- Browse the service catalog (filterable by specialization)
- Multi-step booking wizard: choose a service → pick a master → pick an available time slot → enter contact details

### Dashboard (Admin / Master)

- **Bookings** — view, filter, edit, and update the status of bookings
- **Schedule** — set weekly working hours per master
- **Services** — create, update, and deactivate services *(Admin+)*
- **Users** — manage admin and master accounts *(Admin+)*

Access to the dashboard is protected by an authentication guard tied to JWT-based roles (`MainAdmin`, `Admin`, `Master`).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- The [FarroService Backend](https://github.com/andrxpie/FarroService-Server) running locally or accessible remotely

### Setup

```bash
# Install dependencies
npm install

# Configure the API base URL
echo "NEXT_PUBLIC_API_URL=https://localhost:<port>/api" > .env.local

# Run the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Shared Types

Core types in `types/index.ts` are kept in sync with the backend's DTOs, including:

- `Service`, `Master`, `Specialization`
- `Booking` and `BookingStatus` (`"Pending" | "Confirmed" | "Completed" | "Cancelled"`)
- `AuthUser` / `AdminUser` for authenticated session data

## Authentication

Auth state is managed through `AuthContext`, which:

- Persists the JWT and authenticated user in `localStorage`
- Exposes `login`, `logout`, and profile update actions
- Drives the dashboard's role-based route guard

---

<div align="center">

Part of the **FarroService** diploma project — see the [backend repository](https://github.com/andrxpie/FarroService-Server) for the API.

</div>
