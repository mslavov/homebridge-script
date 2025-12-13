// Configuration for Homebridge Scriptable Widget
// Credentials are injected at build time from .env

export const CONFIGURATION_JSON_VERSION = 3;
export const NOTIFICATION_JSON_VERSION = 1;

export interface ConfigurationType {
  // Connection settings (injected at build time)
  hbServiceMachineBaseUrl: string;
  userName: string;
  password: string;

  // Notification settings
  notificationEnabled: boolean;
  notificationIntervalInDays: number;
  disableStateBackToNormalNotifications: boolean;

  // File settings
  fileManagerMode: 'ICLOUD' | 'LOCAL';
  configurationFileName: string;
  notificationJsonFileName: string;

  // Display settings
  temperatureUnitConfig: 'CELSIUS' | 'FAHRENHEIT';
  requestTimeoutInterval: number;
  pluginsOrSwUpdatesToIgnore: string[];
  showNodeJsStatus: boolean;
  adaptToLightOrDarkMode: boolean;
  bgColorMode: 'PURPLE_LIGHT' | 'PURPLE_DARK' | 'BLACK_LIGHT' | 'BLACK_DARK' | 'CUSTOM';

  // Custom colors
  customBackgroundColor1_light: string;
  customBackgroundColor2_light: string;
  customBackgroundColor1_dark: string;
  customBackgroundColor2_dark: string;
  chartColor_light: string;
  chartColor_dark: string;
  fontColor_light: string;
  fontColor_dark: string;

  // Icons
  failIcon: string;
  bulletPointIcon: string;
  decimalChar: string;
  icon_statusGood: string;
  icon_colorGood: string;
  icon_statusBad: string;
  icon_colorBad: string;
  icon_statusUnknown: string;
  icon_colorUnknown: string;

  // Labels
  status_hbRunning: string;
  status_hbUtd: string;
  status_pluginsUtd: string;
  status_nodejsUtd: string;
  spacer_beforeFirstStatusColumn: number;
  spacer_betweenStatusColumns: number;
  spacer_afterSecondColumn: number;
  title_cpuLoad: string;
  title_cpuTemp: string;
  title_ramUsage: string;
  title_uptimes: string;
  title_uiService: string;
  title_systemGuiName: string;

  // Notifications
  notification_title: string;
  notification_expandedButtonText: string;
  notification_ringTone: string;
  notifyText_hbNotRunning: string;
  notifyText_hbNotUtd: string;
  notifyText_pluginsNotUtd: string;
  notifyText_nodejsNotUtd: string;
  notifyText_hbNotRunning_backNormal: string;
  notifyText_hbNotUtd_backNormal: string;
  notifyText_pluginsNotUtd_backNormal: string;
  notifyText_nodejsNotUtd_backNormal: string;

  // Siri
  enableSiriFeedback: boolean;
  siriGui_title_update_available: string;
  siriGui_title_all_UTD: string;
  siriGui_icon_version: string;
  siriGui_icon_version_color: string;
  siri_spokenAnswer_update_available: string;
  siri_spokenAnswer_all_UTD: string;

  // Error messages
  error_noConnectionText: string;
  error_noConnectionLockScreenText: string;

  // Widget appearance
  widgetTitle: string;
  dateFormat: string;
  hbLogoFileName: string;
  logoUrl: string;
  headerFontSize: number;
  informationFontSize: number;
  chartAxisFontSize: number;
  dateFontSize: number;

  // JSON version
  jsonVersion: number;
}

// Default configuration with build-time injected credentials
export function createConfiguration(): ConfigurationType {
  const baseUrl = process.env.HB_URL as string;
  const failIcon = '❌';
  const bulletPointIcon = '🔸';

  return {
    // Connection settings - injected at build time
    hbServiceMachineBaseUrl: baseUrl,
    userName: process.env.HB_USERNAME as string,
    password: process.env.HB_PASSWORD as string,

    // Notification settings
    notificationEnabled: true,
    notificationIntervalInDays: 1,
    disableStateBackToNormalNotifications: true,

    // File settings
    fileManagerMode: 'ICLOUD',
    configurationFileName: 'config.json',
    notificationJsonFileName: 'notificationState.json',

    // Display settings
    temperatureUnitConfig: 'CELSIUS',
    requestTimeoutInterval: 10,
    pluginsOrSwUpdatesToIgnore: [],
    showNodeJsStatus: false,
    adaptToLightOrDarkMode: true,
    bgColorMode: 'BLACK_LIGHT',

    // Custom colors
    customBackgroundColor1_light: '#3e00fa',
    customBackgroundColor2_light: '#7a04d4',
    customBackgroundColor1_dark: '#3e00fa',
    customBackgroundColor2_dark: '#7a04d4',
    chartColor_light: '#FFFFFF',
    chartColor_dark: '#FFFFFF',
    fontColor_light: '#FFFFFF',
    fontColor_dark: '#FFFFFF',

    // Icons
    failIcon,
    bulletPointIcon,
    decimalChar: ',',
    icon_statusGood: 'checkmark.circle.fill',
    icon_colorGood: '#' + Color.green().hex,
    icon_statusBad: 'exclamationmark.triangle.fill',
    icon_colorBad: '#' + Color.red().hex,
    icon_statusUnknown: 'questionmark.circle.fill',
    icon_colorUnknown: '#' + Color.yellow().hex,

    // Labels
    status_hbRunning: 'Running',
    status_hbUtd: 'UTD',
    status_pluginsUtd: 'Plugins UTD  ',
    status_nodejsUtd: 'Node.js UTD  ',
    spacer_beforeFirstStatusColumn: 8,
    spacer_betweenStatusColumns: 5,
    spacer_afterSecondColumn: 0,
    title_cpuLoad: 'CPU Load: ',
    title_cpuTemp: 'CPU Temp: ',
    title_ramUsage: 'RAM Usage: ',
    title_uptimes: 'Uptimes:',
    title_uiService: 'UI-Service: ',
    title_systemGuiName: 'Raspberry Pi: ',

    // Notifications
    notification_title: 'Homebridge Status changed:',
    notification_expandedButtonText: 'Show me!',
    notification_ringTone: 'event',
    notifyText_hbNotRunning: 'Your Homebridge instance stopped ⁉',
    notifyText_hbNotUtd: 'Update available for Homebridge ⁉',
    notifyText_pluginsNotUtd: 'Update available for one of your Plugins ⁉',
    notifyText_nodejsNotUtd: 'Update available for Node.js ⁉',
    notifyText_hbNotRunning_backNormal: 'Your Homebridge instance is back online ⁉',
    notifyText_hbNotUtd_backNormal: 'Homebridge is now up to date ⁉',
    notifyText_pluginsNotUtd_backNormal: 'Plugins are now up to date ⁉',
    notifyText_nodejsNotUtd_backNormal: 'Node.js is now up to date ⁉',

    // Siri
    enableSiriFeedback: true,
    siriGui_title_update_available: 'Available Updates:',
    siriGui_title_all_UTD: 'Everything is up to date!',
    siriGui_icon_version: 'arrow.right.square.fill',
    siriGui_icon_version_color: '#' + Color.blue().hex,
    siri_spokenAnswer_update_available: 'At least one update is available',
    siri_spokenAnswer_all_UTD: 'Everything is up to date',

    // Error messages - computed properties using the config values
    error_noConnectionText:
      '   ' +
      failIcon +
      ' UI-Service not reachable!\n          ' +
      bulletPointIcon +
      ' Server started?\n          ' +
      bulletPointIcon +
      ' UI-Service process started?\n          ' +
      bulletPointIcon +
      ' Server-URL ' +
      baseUrl +
      ' correct?\n          ' +
      bulletPointIcon +
      ' Are you in the same network?',
    error_noConnectionLockScreenText:
      '  ' +
      failIcon +
      ' UI-Service not reachable!\n    ' +
      bulletPointIcon +
      ' Server started?\n    ' +
      bulletPointIcon +
      ' UI-Service process started?\n    ' +
      bulletPointIcon +
      ' ' +
      baseUrl +
      ' correct?\n    ' +
      bulletPointIcon +
      ' Are you in the same network?',

    // Widget appearance
    widgetTitle: ' Homebridge ',
    dateFormat: 'dd.MM.yyyy HH:mm:ss',
    hbLogoFileName: Device.model() + 'hbLogo.png',
    logoUrl: 'https://github.com/homebridge/branding/blob/master/logos/homebridge-silhouette-round-white.png?raw=true',
    headerFontSize: 12,
    informationFontSize: 10,
    chartAxisFontSize: 7,
    dateFontSize: 7,

    // JSON version
    jsonVersion: CONFIGURATION_JSON_VERSION,
  };
}

// Global configuration instance
export let CONFIGURATION = createConfiguration();

// Allow updating configuration
export function setConfiguration(config: ConfigurationType): void {
  CONFIGURATION = config;
}
