# Homebridge Scriptable Widget

A TypeScript-based iOS widget for monitoring your [Homebridge](https://homebridge.io/) server status using the [Scriptable](https://scriptable.app/) app.

Based on [lwitzani/homebridgeStatusWidget](https://github.com/lwitzani/homebridgeStatusWidget).

## Features

- Real-time Homebridge server status monitoring
- System health metrics (CPU, RAM, uptime)
- Update notifications for Homebridge, plugins, and Node.js
- Home screen widget (medium size)
- Lock screen widget support

## Prerequisites

- iOS device with [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) installed
- [Homebridge](https://homebridge.io/) server with UI enabled
- Node.js 18+ for building

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/mslavov/homebridge-script.git
cd homebridge-script
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure credentials

Copy the example environment file and fill in your Homebridge details:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
HB_URL=http://192.168.1.100:8581
HB_USERNAME=admin
HB_PASSWORD=your_password_here
```

### 4. Build the widget

```bash
npm run build
```

This generates `dist/index.js` with your credentials embedded.

### 5. Install on iOS

1. Copy the contents of `dist/index.js`
2. Open the Scriptable app on your iOS device
3. Create a new script and paste the code
4. Save the script with a name (e.g., "Homebridge")

### 6. Add the widget

**Home Screen Widget:**
1. Long-press on your home screen
2. Tap the "+" button to add a widget
3. Search for "Scriptable"
4. Choose the medium widget size
5. Add to home screen and tap to configure
6. Select your "Homebridge" script

**Lock Screen Widget:**
1. Long-press on your lock screen
2. Tap "Customize"
3. Add a Scriptable widget to the accessory area
4. Select your "Homebridge" script

## Development

```bash
npm run build:watch   # Watch mode for development
npm run typecheck     # Type-check without building
```

## Project Structure

```
src/
├── index.ts           # Entry point
├── config.ts          # Configuration and credentials
├── api/
│   ├── client.ts      # Homebridge API client
│   ├── endpoints.ts   # API endpoint URLs
│   └── types.ts       # Response type definitions
├── ui/
│   ├── widget.ts      # Home screen widget
│   ├── lockscreen.ts  # Lock screen widget
│   ├── charts.ts      # Chart rendering
│   └── styles.ts      # Fonts and colors
└── utils/
    ├── storage.ts     # File storage utilities
    ├── formatters.ts  # Data formatting helpers
    └── notifications.ts # Update notifications
```

## Security Note

The `.env` file contains your Homebridge credentials and is excluded from git. Never commit this file or share the built `dist/index.js` as it contains embedded credentials.

## License

MIT
