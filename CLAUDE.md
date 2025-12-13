# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A TypeScript-based iOS Scriptable widget for monitoring Homebridge status. The widget displays system health (CPU, RAM, uptime), update availability (Homebridge, plugins, Node.js), and supports both home screen and lock screen variants.

## Build Commands

```bash
npm run build          # Bundle TypeScript to dist/index.js (IIFE format for Scriptable)
npm run build:watch    # Watch mode for development
npm run typecheck      # Type-check without emitting
```

## Configuration

Credentials are injected at build time via environment variables. Copy `.env.example` to `.env` and set:
- `HB_URL` - Homebridge UI URL (e.g., `http://192.168.1.100:8581`)
- `HB_USERNAME` - Admin username
- `HB_PASSWORD` - Admin password

## Architecture

**Build Pipeline**: esbuild bundles TypeScript to a single IIFE file (`dist/index.js`) with Scriptable header prepended. Environment variables are replaced at build time via `define`.

**Source Structure** (`src/`):
- `index.ts` - Entry point, orchestrates initialization and widget display
- `config.ts` - Configuration types and defaults, credentials injected via `process.env`
- `api/` - Homebridge API client (`client.ts`), endpoint URLs (`endpoints.ts`), response types (`types.ts`)
- `ui/` - Widget rendering: `widget.ts` (home screen), `lockscreen.ts` (lock screen variant), `styles.ts` (fonts/colors)
- `utils/` - File storage (`storage.ts`), formatting helpers (`formatters.ts`), notifications (`notifications.ts`)

**Key Patterns**:
- Uses Scriptable iOS types (`@types/scriptable-ios`) - globals like `Request`, `ListWidget`, `Script`, `Device`, `Color` are available without imports
- Widget supports two modes: `config.runsInAccessoryWidget` determines lock screen vs home screen
- API auth tries no-auth endpoint first, falls back to credentials
- Configuration can be persisted to iCloud/local storage for runtime changes
