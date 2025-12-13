// API Client for Homebridge UI
import { CONFIGURATION } from '../config';
import { noAuthUrl, authUrl, overallStatusUrl, hbVersionUrl, pluginsUrl, nodeJsUrl } from './endpoints';
import type {
  AuthResponse,
  HomebridgeStatusResponse,
  HomebridgeVersionInfo,
  PluginInfo,
  PluginVersionInfos,
  NodeJsVersionInfo,
  HomeBridgeStatus,
} from './types';

export const UNAVAILABLE = 'UNAVAILABLE';

let token: string | typeof UNAVAILABLE | undefined;

export function getToken(): string | typeof UNAVAILABLE | undefined {
  return token;
}

export function setToken(newToken: string | typeof UNAVAILABLE | undefined): void {
  token = newToken;
}

export async function getAuthToken(): Promise<string | typeof UNAVAILABLE | undefined> {
  if (CONFIGURATION.hbServiceMachineBaseUrl === '>enter the ip with the port here<') {
    throw new Error('Base URL to machine not entered! Edit variable called hbServiceMachineBaseUrl');
  }

  const headers = {
    accept: '*/*',
    'Content-Type': 'application/json',
  };

  // Try no-auth first
  let req = new Request(noAuthUrl());
  req.timeoutInterval = CONFIGURATION.requestTimeoutInterval;
  req.method = 'POST';
  req.headers = headers;
  req.body = JSON.stringify({});

  let authData: AuthResponse;
  try {
    authData = await req.loadJSON();
  } catch {
    return UNAVAILABLE;
  }

  if (authData.access_token) {
    return authData.access_token;
  }

  // Try with credentials
  req = new Request(authUrl());
  req.timeoutInterval = CONFIGURATION.requestTimeoutInterval;
  req.body = JSON.stringify({
    username: CONFIGURATION.userName,
    password: CONFIGURATION.password,
    otp: 'string',
  });
  req.method = 'POST';
  req.headers = headers;

  try {
    authData = await req.loadJSON();
  } catch {
    return UNAVAILABLE;
  }

  return authData.access_token;
}

export async function initializeToken(): Promise<void> {
  token = await getAuthToken();
  if (token === undefined) {
    throw new Error('Credentials not valid');
  }
}

export async function fetchData<T>(url: string): Promise<T | undefined> {
  const req = new Request(url);
  req.timeoutInterval = CONFIGURATION.requestTimeoutInterval;
  req.headers = {
    accept: '*/*',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  };

  try {
    return await req.loadJSON();
  } catch {
    return undefined;
  }
}

export async function getOverallStatus(): Promise<boolean | undefined> {
  const statusData = await fetchData<HomebridgeStatusResponse>(overallStatusUrl());
  if (statusData === undefined) {
    return undefined;
  }
  if (statusData.status === 'pending') {
    return undefined; // Show as unknown (yellow question mark)
  }
  return statusData.status === 'ok' || statusData.status === 'up';
}

export async function getHomebridgeVersionInfos(): Promise<HomebridgeVersionInfo | undefined> {
  if (CONFIGURATION.pluginsOrSwUpdatesToIgnore.includes('HOMEBRIDGE_UTD')) {
    log("You configured Homebridge to not be checked for updates. Widget will show that it's UTD!");
    return { updateAvailable: false };
  }
  const hbVersionData = await fetchData<HomebridgeVersionInfo>(hbVersionUrl());
  if (hbVersionData === undefined) {
    return undefined;
  }
  return hbVersionData;
}

export async function getNodeJsVersionInfos(): Promise<NodeJsVersionInfo | undefined> {
  if (CONFIGURATION.pluginsOrSwUpdatesToIgnore.includes('NODEJS_UTD')) {
    log("You configured Node.js to not be checked for updates. Widget will show that it's UTD!");
    return { updateAvailable: false, name: 'node.js', currentVersion: '', latestVersion: '' };
  }
  const nodeJsData = await fetchData<NodeJsVersionInfo>(nodeJsUrl());
  if (nodeJsData === undefined) {
    return undefined;
  }
  nodeJsData.name = 'node.js';
  return nodeJsData;
}

export async function getPluginVersionInfos(): Promise<PluginVersionInfos | undefined> {
  const pluginsData = await fetchData<PluginInfo[]>(pluginsUrl());
  if (pluginsData === undefined) {
    return undefined;
  }

  for (const plugin of pluginsData) {
    if (CONFIGURATION.pluginsOrSwUpdatesToIgnore.includes(plugin.name)) {
      log("You configured " + plugin.name + " to not be checked for updates. Widget will show that it's UTD!");
      continue;
    }
    if (plugin.updateAvailable) {
      return { plugins: pluginsData, updateAvailable: true };
    }
  }
  return { plugins: pluginsData, updateAvailable: false };
}

export async function createHomeBridgeStatus(): Promise<HomeBridgeStatus> {
  const overallStatus = await getOverallStatus();
  const hbVersionInfos = await getHomebridgeVersionInfos();
  const hbUpToDate = hbVersionInfos === undefined ? undefined : !hbVersionInfos.updateAvailable;
  const pluginVersionInfos = await getPluginVersionInfos();
  const pluginsUpToDate = pluginVersionInfos === undefined ? undefined : !pluginVersionInfos.updateAvailable;
  const nodeJsVersionInfos = await getNodeJsVersionInfos();
  const nodeJsUpToDate = nodeJsVersionInfos === undefined ? undefined : !nodeJsVersionInfos.updateAvailable;

  return {
    overallStatus,
    hbVersionInfos,
    hbUpToDate,
    pluginVersionInfos,
    pluginsUpToDate,
    nodeJsVersionInfos,
    nodeJsUpToDate,
  };
}
