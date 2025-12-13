// API Response Types

export interface AuthResponse {
  access_token?: string;
}

export interface CpuData {
  currentLoad: number;
  cpuLoadHistory: number[];
  cpuTemperature: {
    main: number;
  };
}

export interface RamData {
  mem: {
    total: number;
    available: number;
  };
  memoryUsageHistory: number[];
}

export interface UptimeData {
  time: {
    uptime: number;
  };
  processUptime: number;
}

export interface HomebridgeVersionInfo {
  name?: string;
  installedVersion?: string;
  latestVersion?: string;
  updateAvailable: boolean;
}

export interface PluginInfo {
  name: string;
  installedVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

export interface PluginVersionInfos {
  plugins: PluginInfo[];
  updateAvailable: boolean;
}

export interface NodeJsVersionInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
}

export interface HomebridgeStatusResponse {
  status: 'ok' | 'up' | 'pending' | 'down';
}

// Notification State Types

export interface NotificationStatusEntry {
  status: boolean;
  lastNotified?: Date;
}

export interface NotificationState {
  jsonVersion: number;
  hbRunning: NotificationStatusEntry;
  hbUtd: NotificationStatusEntry;
  pluginsUtd: NotificationStatusEntry;
  nodeUtd: NotificationStatusEntry;
}

// Widget Status Types

export interface HomeBridgeStatus {
  overallStatus: boolean | undefined;
  hbVersionInfos: HomebridgeVersionInfo | undefined;
  hbUpToDate: boolean | undefined;
  pluginVersionInfos: PluginVersionInfos | undefined;
  pluginsUpToDate: boolean | undefined;
  nodeJsVersionInfos: NodeJsVersionInfo | undefined;
  nodeJsUpToDate: boolean | undefined;
}
