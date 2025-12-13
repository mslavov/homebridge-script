// Homebridge Status Widget for Scriptable
// TypeScript version - based on https://github.com/lwitzani/homebridgeStatusWidget

import { CONFIGURATION } from './config';
import { initializeToken, createHomeBridgeStatus, UNAVAILABLE, getToken } from './api/client';
import { initializeFileManager, handleConfigPersisting } from './utils/storage';
import { handleNotifications } from './utils/notifications';
import { initializeFonts } from './ui/styles';
import { initializeTimeFormatter, createAndShowWidget, showNotAvailableWidget } from './ui/widget';
import { createAndShowLockScreenWidget, showNotAvailableLockScreenWidget } from './ui/lockscreen';

// Configuration flags (can be adjusted based on needs)
const usePersistedConfiguration = false; // Since we inject at build time, we don't need persisted config
const overwritePersistedConfig = false;

async function main(): Promise<void> {
  // Initialize file manager, time formatter, and fonts
  initializeFileManager();
  initializeTimeFormatter();
  initializeFonts();

  // Authenticate against the hb-service
  try {
    await initializeToken();
  } catch (error) {
    // Token initialization failed - show unavailable widget
    if (config.runsInAccessoryWidget) {
      await showNotAvailableLockScreenWidget();
    } else {
      await showNotAvailableWidget();
    }
    return;
  }

  // Check if token is unavailable (service not reachable)
  const token = getToken();
  if (token === UNAVAILABLE) {
    if (config.runsInAccessoryWidget) {
      await showNotAvailableLockScreenWidget();
    } else {
      await showNotAvailableWidget();
    }
    return;
  }

  // Get homebridge status
  const homeBridgeStatus = await createHomeBridgeStatus();

  // Handle config persisting
  await handleConfigPersisting(usePersistedConfiguration, overwritePersistedConfig);

  // Handle notifications
  await handleNotifications(
    homeBridgeStatus.overallStatus,
    homeBridgeStatus.hbUpToDate,
    homeBridgeStatus.pluginsUpToDate,
    homeBridgeStatus.nodeJsUpToDate
  );

  // Create and show the appropriate widget
  if (config.runsInAccessoryWidget) {
    await createAndShowLockScreenWidget(homeBridgeStatus);
  } else {
    await createAndShowWidget(homeBridgeStatus);
  }
}

// Run the widget
main();
