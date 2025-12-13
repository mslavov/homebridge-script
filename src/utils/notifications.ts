// Notification handling utilities
import { CONFIGURATION, NOTIFICATION_JSON_VERSION } from '../config';
import { getFilePath, getPersistedObject, persistObject } from './storage';
import type { NotificationState, NotificationStatusEntry } from '../api/types';

const INITIAL_NOTIFICATION_STATE: NotificationState = {
  jsonVersion: NOTIFICATION_JSON_VERSION,
  hbRunning: { status: true },
  hbUtd: { status: true },
  pluginsUtd: { status: true },
  nodeUtd: { status: true },
};

function isTimeToNotifyAgain(dateToCheck: Date | undefined): boolean {
  if (dateToCheck === undefined) return true;

  const dateInThePast = new Date(dateToCheck);
  const now = new Date();
  const timeBetweenDates = parseInt(String((now.getTime() - dateInThePast.getTime()) / 1000)); // seconds
  return timeBetweenDates > CONFIGURATION.notificationIntervalInDays * 24 * 60 * 60;
}

function shouldNotify(currentBool: boolean | undefined, boolFromLastTime: boolean, lastNotifiedDate: Date | undefined): boolean {
  return !currentBool && (boolFromLastTime || isTimeToNotifyAgain(lastNotifiedDate));
}

type NotificationSound = 'default' | 'accept' | 'alert' | 'complete' | 'event' | 'failure' | 'piano_error' | 'piano_success' | 'popup' | null;

function scheduleNotification(text: string): void {
  const notification = new Notification();
  notification.title = CONFIGURATION.notification_title;
  notification.body = text;
  notification.addAction(CONFIGURATION.notification_expandedButtonText, CONFIGURATION.hbServiceMachineBaseUrl, false);
  notification.sound = CONFIGURATION.notification_ringTone as NotificationSound;
  notification.schedule();
}

export async function handleNotifications(
  hbRunning: boolean | undefined,
  hbUtd: boolean | undefined,
  pluginsUtd: boolean | undefined,
  nodeUtd: boolean | undefined
): Promise<void> {
  if (!CONFIGURATION.notificationEnabled) {
    return;
  }

  const path = getFilePath(CONFIGURATION.notificationJsonFileName);
  const state = await getPersistedObject<NotificationState>(path, NOTIFICATION_JSON_VERSION, INITIAL_NOTIFICATION_STATE, true);
  const now = new Date();
  let shouldUpdateState = false;

  // Check homebridge running status
  if (shouldNotify(hbRunning, state.hbRunning.status, state.hbRunning.lastNotified)) {
    state.hbRunning.status = hbRunning ?? false;
    state.hbRunning.lastNotified = now;
    shouldUpdateState = true;
    scheduleNotification(CONFIGURATION.notifyText_hbNotRunning);
  } else if (hbRunning && !state.hbRunning.status) {
    state.hbRunning.status = hbRunning;
    state.hbRunning.lastNotified = undefined;
    shouldUpdateState = true;
    if (!CONFIGURATION.disableStateBackToNormalNotifications) {
      scheduleNotification(CONFIGURATION.notifyText_hbNotRunning_backNormal);
    }
  }

  // Check homebridge update status
  if (shouldNotify(hbUtd, state.hbUtd.status, state.hbUtd.lastNotified)) {
    state.hbUtd.status = hbUtd ?? false;
    state.hbUtd.lastNotified = now;
    shouldUpdateState = true;
    scheduleNotification(CONFIGURATION.notifyText_hbNotUtd);
  } else if (hbUtd && !state.hbUtd.status) {
    state.hbUtd.status = hbUtd;
    state.hbUtd.lastNotified = undefined;
    shouldUpdateState = true;
    if (!CONFIGURATION.disableStateBackToNormalNotifications) {
      scheduleNotification(CONFIGURATION.notifyText_hbNotUtd_backNormal);
    }
  }

  // Check plugins update status
  if (shouldNotify(pluginsUtd, state.pluginsUtd.status, state.pluginsUtd.lastNotified)) {
    state.pluginsUtd.status = pluginsUtd ?? false;
    state.pluginsUtd.lastNotified = now;
    shouldUpdateState = true;
    scheduleNotification(CONFIGURATION.notifyText_pluginsNotUtd);
  } else if (pluginsUtd && !state.pluginsUtd.status) {
    state.pluginsUtd.status = pluginsUtd;
    state.pluginsUtd.lastNotified = undefined;
    shouldUpdateState = true;
    if (!CONFIGURATION.disableStateBackToNormalNotifications) {
      scheduleNotification(CONFIGURATION.notifyText_pluginsNotUtd_backNormal);
    }
  }

  // Check node.js update status (only if enabled in config)
  if (CONFIGURATION.showNodeJsStatus) {
    if (shouldNotify(nodeUtd, state.nodeUtd.status, state.nodeUtd.lastNotified)) {
      state.nodeUtd.status = nodeUtd ?? false;
      state.nodeUtd.lastNotified = now;
      shouldUpdateState = true;
      scheduleNotification(CONFIGURATION.notifyText_nodejsNotUtd);
    } else if (nodeUtd && !state.nodeUtd.status) {
      state.nodeUtd.status = nodeUtd;
      state.nodeUtd.lastNotified = undefined;
      shouldUpdateState = true;
      if (!CONFIGURATION.disableStateBackToNormalNotifications) {
        scheduleNotification(CONFIGURATION.notifyText_nodejsNotUtd_backNormal);
      }
    }
  }

  if (shouldUpdateState) {
    persistObject(state, path);
  }
}
